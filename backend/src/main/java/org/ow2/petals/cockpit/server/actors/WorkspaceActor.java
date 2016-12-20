/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.ow2.petals.cockpit.server.actors;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.server.BroadcasterListener;
import org.glassfish.jersey.server.ChunkedOutput;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.BusActor.ForBusMsg;
import org.ow2.petals.cockpit.server.actors.CockpitActors.CockpitRequest;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInError;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.NewBus;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.ImmutableList;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.Fiber;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.CheckedFunction1;
import javaslang.control.Either;

/**
 * TODO should we make it die after some time if there is no listeners? not sure, see next TODO
 * 
 * TODO should we start it on application start? for now it doesn't make any sense since the actor are not proactively
 * monitoring the buses
 * 
 * @author vnoel
 *
 */
public class WorkspaceActor extends CockpitActor<Msg> {

    private static final Logger LOG = LoggerFactory.getLogger(WorkspaceActor.class);

    private static final long serialVersionUID = -2202357041789526859L;

    private final DbWorkspace db;

    private WorkspaceTree tree = new WorkspaceTree(0, "", ImmutableList.of(), ImmutableList.of());

    private final Map<Long, ActorRef<BusActor.Msg>> wsBuses = new HashMap<>();

    private final SseBroadcaster broadcaster = new SseBroadcaster();

    public WorkspaceActor(DbWorkspace w) {
        this.db = w;
        this.broadcaster.add(new BroadcasterListener<OutboundEvent>() {
            @Override
            public void onException(ChunkedOutput<OutboundEvent> chunkedOutput, Exception exception) {
                LOG.error("Error in SSE broadcaster for workspace {}", w.id, exception);
            }

            @Override
            public void onClose(ChunkedOutput<OutboundEvent> chunkedOutput) {
                LOG.debug("Client left workspace {}", w.id);
            }
        });
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {

        tree = runDAO(() -> workspaces.getWorkspaceTree(db));

        for (BusTree b : tree.buses) {
            wsBuses.put(b.id, as.getActor(new BusActor(b, self())));
        }

        for (;;) {
            Msg msg = receive();
            if (msg instanceof WorkspaceEventMsg) {
                broadcast(((WorkspaceEventMsg) msg).event);
            } else if (msg instanceof GetWorkspaceTree) {
                answer((GetWorkspaceTree) msg, m -> Either.right(tree));
            } else if (msg instanceof ImportBus) {
                answer((ImportBus) msg, this::handleImportBus);
            } else if (msg instanceof DeleteBus) {
                answer((DeleteBus) msg, b -> {
                    // TODO for now this is only used for in error buses, so there is no actor to kill, but in the
                    // future, we should be careful about that!
                    final int deleted = buses.delete(b.bId);
                    // TODO we must notify the others people on the workspace!
                    if (deleted < 1) {
                        return Either.left(Status.NOT_FOUND);
                    } else {
                        return Either.right(null);
                    }
                });
            } else if (msg instanceof NewWorkspaceClient) {
                LOG.debug("New SSE client for workspace {}", db.id);
                // this one is coming from the SSE resource
                answer((NewWorkspaceClient) msg, nc -> Either.right(addBroadcastClient()));
            } else if (msg instanceof ForBusMsg && msg instanceof CockpitRequest) {
                forward((CockpitRequest<?> & ForBusMsg) msg);
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", db.id, msg);
            }
        }
    }

    private EventOutput addBroadcastClient() throws IOException {
        EventOutput eo = new EventOutput();

        eo.write(new OutboundEvent.Builder().name("WORKSPACE_TREE").mediaType(MediaType.APPLICATION_JSON_TYPE)
                .data(this.tree).build());

        broadcaster.add(eo);

        return eo;
    }

    /**
     * This centralises all changes to {@link #tree} and {@link #wsBuses}.
     */
    private void broadcast(WorkspaceEvent event) throws SuspendExecution, InterruptedException {
        // events are about ws changes, so we must update the tree
        // TODO handle that in a batter way: we need to merge the Tree and the Db access together!!
        tree = runDAO(() -> workspaces.getWorkspaceTree(db));

        if (event.event == WorkspaceEvent.Type.BUS_IMPORT_OK) {
            BusTree bTree = (BusTree) event.data;

            // TODO see how it interact with our WorkspaceTree...
            // TODO maybe delegate to the actor the import itself? but inversely, maybe it's best to leave the
            // creation to the workspace, because then it would be akward to have the bus create the container
            // object in db...
            @SuppressWarnings("resource")
            BusActor actor = new BusActor(bTree, self());
            wsBuses.put(bTree.id, as.getActor(actor));
        }

        OutboundEvent oe = new OutboundEvent.Builder().name("WORKSPACE_CHANGE")
                .mediaType(MediaType.APPLICATION_JSON_TYPE).data(event).build();
        broadcaster.broadcast(oe);
    }

    private boolean hasAccess(String username) {
        return db.users.stream().anyMatch(username::equals);
    }

    public <R extends CockpitRequest<?> & ForBusMsg> void forward(R req) throws SuspendExecution {
        @SuppressWarnings("resource")
        ActorRef<BusActor.Msg> bus = wsBuses.get(req.getBusId());
        if (!hasAccess(req.user)) {
            RequestReplyHelper.reply(req, Either.left(Status.FORBIDDEN));
        } else if (bus == null) {
            RequestReplyHelper.reply(req, Either.left(Status.NOT_FOUND));
        } else {
            bus.send(req);
        }
    }

    private <R, T extends CockpitRequest<R>> void answer(T r, CheckedFunction1<T, Either<Status, R>> f)
            throws SuspendExecution {
        try {
            if (hasAccess(r.user)) {
                RequestReplyHelper.reply(r, f.apply(r));
            } else {
                RequestReplyHelper.reply(r, Either.left(Status.FORBIDDEN));
            }
        } catch (Throwable e) {
            RequestReplyHelper.replyError(r, e);
        }
    }

    private Either<Status, BusInProgress> handleImportBus(ImportBus bus) throws SuspendExecution, InterruptedException {
        final NewBus nb = bus.nb;

        final long bId = runDAO(() -> buses.createBus(nb.ip, nb.port, nb.username, nb.password, nb.passphrase, db.id));

        // we use a fiber to let the actor handles other message during bus import
        new Fiber<>(() -> {
            WorkspaceEvent ev = doImportBus(bId, nb);
            self().send(new WorkspaceEventMsg(ev));
        }).start();

        return Either.right(new BusInProgress(bId, nb.ip, nb.port, nb.username));
    }

    private WorkspaceEvent doImportBus(long bId, NewBus bus) throws SuspendExecution, InterruptedException {
        try {
            final Domain topology = getTopology(bus);

            final BusTree bTree = runDAO(() -> buses.saveImport(bId, topology));

            return WorkspaceEvent.busImportOk(bTree);
        } catch (Exception e) {
            String m = e.getMessage();
            String message = m != null ? m : e.getClass().getName();

            LOG.info("Can't import bus from container {}:{}: {}", bus.ip, bus.port, message);
            LOG.debug("Can't import bus from container {}:{}", bus.ip, bus.port, e);

            runDAO(() -> buses.saveError(bId, message));

            return WorkspaceEvent.busImportError(new BusInError(bId, bus.ip, bus.port, bus.username, message));
        }
    }

    private Domain getTopology(NewBus bus) throws Exception, SuspendExecution, InterruptedException {
        return runAdmin(bus.ip, bus.port, bus.username, bus.password,
                petals -> petals.newContainerAdministration().getTopology(bus.passphrase, true));
    }

    public interface Msg {
        // marker interface for messages to this actor
    }

    public static class WorkspaceRequest<T> extends CockpitRequest<T> implements Msg {

        private static final long serialVersionUID = -564899978996631515L;

        public WorkspaceRequest(String user) {
            super(user);
        }
    }

    public static class NewWorkspaceClient extends WorkspaceRequest<EventOutput> {

        private static final long serialVersionUID = 1L;

        public NewWorkspaceClient(String user) {
            super(user);
        }
    }

    public static class ImportBus extends WorkspaceRequest<BusInProgress> {

        private static final long serialVersionUID = 1286574765918364762L;

        final NewBus nb;

        public ImportBus(String user, NewBus nb) {
            super(user);
            this.nb = nb;
        }
    }

    public static class DeleteBus extends WorkspaceRequest<@Nullable Void> {

        private static final long serialVersionUID = 1L;

        final long bId;

        public DeleteBus(String user, long bId) {
            super(user);
            this.bId = bId;
        }
    }

    public static class GetWorkspaceTree extends WorkspaceRequest<WorkspaceTree> {

        private static final long serialVersionUID = -2520646870000161079L;

        public GetWorkspaceTree(String user) {
            super(user);
        }
    }

    public static class WorkspaceEventMsg implements Msg {

        final WorkspaceEvent event;

        public WorkspaceEventMsg(WorkspaceEvent event) {
            this.event = event;
        }

    }
}
