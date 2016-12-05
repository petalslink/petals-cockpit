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
import org.ow2.petals.admin.api.exception.ContainerAdministrationException;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusInError;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.BusesResource.NewBus;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.Fiber;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.CheckedFunction1;
import javaslang.Tuple;
import javaslang.control.Either;
import javaslang.control.Option;

/**
 * TODO should we make it die after some time if there is no listeners? not sure, see next TODO
 * 
 * TODO should we start it on application start? for now it doesn't make any sense
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
            if (msg instanceof GetTree) {
                answer((GetTree) msg, m -> Either.right(tree));
            } else if (msg instanceof ImportBus) {
                answer((ImportBus) msg, this::handleImportBus);
            } else if (msg instanceof DeleteBus) {
                answer((DeleteBus) msg, b -> {
                    // TODO for now this is only used for in error buses, so there is no actor to kill, but in the
                    // future, we should be careful about that!
                    final int deleted = buses.delete(b.bId);
                    if (deleted < 1) {
                        return Either.left(Status.NOT_FOUND);
                    } else {
                        return Either.right(null);
                    }
                });
            } else if (msg instanceof NewClient) {
                LOG.debug("New SSE client for workspace {}", db.id);
                // this one is coming from the SSE resource
                answer((NewClient) msg, nc -> {
                    broadcaster.add(nc.output);
                    return Either.right(null);
                });
            } else if (msg instanceof BusActor.ForwardedMsg && msg instanceof CockpitActors.Request) {
                // forward requests to the adequate bus
                BusActor.ForwardedMsg bMsg = (BusActor.ForwardedMsg) msg;
                CockpitActors.Request<?> bReq = (CockpitActors.Request<?>) msg;
                @SuppressWarnings("resource")
                ActorRef<BusActor.Msg> bus = wsBuses.get(bMsg.getBusId());
                // TODO factorise with answer?
                if (!hasAccess(bReq.user)) {
                    RequestReplyHelper.reply(bReq, Either.left(Status.FORBIDDEN));
                } else if (bus == null) {
                    RequestReplyHelper.reply(bReq, Either.left(Status.NOT_FOUND));
                } else {
                    bus.send(bMsg);
                }
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", db.id, msg);
            }
        }
    }

    private boolean hasAccess(String username) {
        return db.users.stream().anyMatch(username::equals);
    }

    private <R, T extends CockpitActors.Request<R>> void answer(T r, CheckedFunction1<T, Either<Status, R>> f)
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
        new Fiber<>(() -> importBus(bId, nb)).start();

        return Either.right(new BusInProgress(bId, nb.ip, nb.port, nb.username));
    }

    private void importBus(long bId, NewBus bus) throws SuspendExecution, InterruptedException {
        WorkspaceEvent ev = doImportBus(bId, bus);
        OutboundEvent oe = new OutboundEvent.Builder().name("WORKSPACE_CHANGE")
                .mediaType(MediaType.APPLICATION_JSON_TYPE).data(ev).build();
        broadcaster.broadcast(oe);
    }

    private WorkspaceEvent doImportBus(long bId, NewBus bus) throws SuspendExecution, InterruptedException {
        try {
            final Domain topology = getTopology(bus);

            final BusTree bTree = runDAO(() -> buses.saveImport(bId, topology));

            // TODO update it more nicely!! (as a result of the import made by the bus actor!)
            tree = runDAO(() -> workspaces.getWorkspaceTree(db));

            // TODO see how it interact with our WorkspaceTree...
            // TODO maybe delegate him the import itself? maybe it's best to leave the creation to the workspace,
            // because then it would be akward to have the bus create the container object in db so...
            wsBuses.put(tree.id, as.getActor(new BusActor(bTree, self())));

            return WorkspaceEvent.ok(bTree);
        } catch (Exception e) {
            String m = e.getMessage();
            String message = m != null ? m : e.getClass().getName();

            LOG.info("Can't import bus from container {}:{}: {}", bus.ip, bus.port, message);
            LOG.debug("Can't import bus from container {}:{}", bus.ip, bus.port, e);

            runDAO(() -> {
                buses.saveError(bId, message);
                return null;
            });

            return WorkspaceEvent.error(new BusInError(bId, bus.ip, bus.port, bus.username, message));
        }
    }

    private Domain getTopology(NewBus bus)
            throws ContainerAdministrationException, SuspendExecution, InterruptedException {
        return super.getTopology(bus.ip, bus.port, bus.username, bus.password,
                Option.some(Tuple.of(bus.passphrase, true)));
    }

    public interface Msg {
        // marker interface for messages to this actor
    }

    public static class WorkspaceRequest<T> extends CockpitActors.Request<T> implements Msg {

        private static final long serialVersionUID = -564899978996631515L;

        public WorkspaceRequest(String user) {
            super(user);
        }
    }

    public static class NewClient extends WorkspaceRequest<@Nullable Void> {

        private static final long serialVersionUID = 1L;

        final EventOutput output;

        public NewClient(String user, EventOutput output) {
            super(user);
            this.output = output;
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

    public static class GetTree extends WorkspaceRequest<WorkspaceTree> {

        private static final long serialVersionUID = -2520646870000161079L;

        public GetTree(String user) {
            super(user);
        }
    }

    public static class WorkspaceEvent {

        @JsonProperty
        private final String event;

        @JsonProperty
        private final Object data;

        public WorkspaceEvent(String event, Object data) {
            this.event = event;
            this.data = data;
        }

        public static WorkspaceEvent error(BusInError bus) {
            return new WorkspaceEvent("BUS_IMPORT_ERROR", bus);
        }

        public static WorkspaceEvent ok(BusTree bus) {
            return new WorkspaceEvent("BUS_IMPORT_OK", bus);
        }

        @Override
        public String toString() {
            return "WorkspaceEvent [event=" + event + ", data=" + data + "]";
        }
    }
}
