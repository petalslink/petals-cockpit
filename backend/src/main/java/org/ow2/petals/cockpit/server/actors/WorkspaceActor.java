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
import java.util.concurrent.ExecutorService;
import java.util.function.Supplier;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.server.BroadcasterListener;
import org.glassfish.jersey.server.ChunkedOutput;
import org.ow2.petals.admin.api.ContainerAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.admin.api.exception.ContainerAdministrationException;
import org.ow2.petals.admin.api.exception.DuplicatedServiceException;
import org.ow2.petals.admin.api.exception.MissingServiceException;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
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
import co.paralleluniverse.actors.BasicActor;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.common.util.CheckedCallable;
import co.paralleluniverse.fibers.Fiber;
import co.paralleluniverse.fibers.FiberAsync;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.CheckedFunction1;
import javaslang.control.Either;

/**
 * TODO should we make it die after some time if there is no listeners?
 * 
 * @author vnoel
 *
 */
public class WorkspaceActor extends BasicActor<Msg, Void> {

    private static final Logger LOG = LoggerFactory.getLogger(WorkspaceActor.class);

    private static final long serialVersionUID = -2202357041789526859L;

    private final DbWorkspace workspace;

    private WorkspaceTree tree = new WorkspaceTree(0, "", ImmutableList.of(), ImmutableList.of());

    private final Map<Long, ActorRef<BusActor.Msg>> wsBuses = new HashMap<>();

    private final SseBroadcaster broadcaster = new SseBroadcaster();

    @Inject
    @Named(CockpitApplication.PETALS_ADMIN_ES)
    private ExecutorService executor;

    @Inject
    @Named(CockpitApplication.JDBC_ES)
    private ExecutorService sqlExecutor;

    @Inject
    private BusesDAO buses;

    @Inject
    private WorkspacesDAO workspaces;

    @Inject
    private CockpitActors as;

    public WorkspaceActor(DbWorkspace w) {
        this.workspace = w;
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

    /**
     * This is needed because the java compiler has trouble typechecking lambda on {@link CheckedCallable}.
     */
    private <T> T runDAO(Supplier<T> s) throws SuspendExecution, InterruptedException {
        return FiberAsync.runBlocking(sqlExecutor, new CheckedCallable<T, RuntimeException>() {
            @Override
            public T call() {
                return s.get();
            }
        });
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {

        assert wsBuses.isEmpty();

        tree = runDAO(() -> workspaces.getWorkspaceTree(workspace));

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
                    final int deleted = buses.delete(b.bId);
                    if (deleted < 1) {
                        return Either.left(Status.NOT_FOUND);
                    } else {
                        return Either.right(null);
                    }
                });
            } else if (msg instanceof NewClient) {
                LOG.debug("New SSE client for workspace {}", workspace.id);
                // this one is coming from the SSE resource
                answer((NewClient) msg, nc -> {
                    broadcaster.add(nc.output);
                    return Either.right(null);
                });
            } else if (msg instanceof BusActor.BusRequest) {
                BusActor.BusRequest<?> bMsg = (BusActor.BusRequest<?>) msg;
                @SuppressWarnings("resource")
                ActorRef<BusActor.Msg> bus = wsBuses.get(bMsg.getBusId());
                if (bus == null) {
                    RequestReplyHelper.reply(bMsg, Either.left(Status.NOT_FOUND));
                } else {
                    bus.send(bMsg);
                }
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", workspace.id, msg);
            }
        }
    }

    private <R, T extends CockpitActors.Request<R>> void answer(T r, CheckedFunction1<T, Either<Status, R>> f)
            throws SuspendExecution {
        try {
            if (workspace.users.stream().anyMatch(r.user::equals)) {
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

        final long bId = runDAO(
                () -> buses.createBus(nb.ip, nb.port, nb.username, nb.password, nb.passphrase, workspace.id));

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
            final Domain topology = FiberAsync.runBlocking(executor,
                    new CheckedCallable<Domain, ContainerAdministrationException>() {
                        @Override
                        public Domain call() throws ContainerAdministrationException {
                            return getTopology(bus);
                        }
                    });

            final BusTree bTree = runDAO(() -> buses.saveImport(bId, topology));
            
            // TODO update it more nicely!! (as a result of the import made by the bus actor!)
            tree = runDAO(() -> workspaces.getWorkspaceTree(workspace));

            // TODO see how it interact with our WorkspaceTree...
            // TODO maybe delegate him the import itself?
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

    /**
     * This is meant to be run inside the single thread executor with fiber async for two reasons:
     * 
     * It is blocking and the petals-admin API sucks (it usess singletons)
     */
    private Domain getTopology(NewBus bus) throws ContainerAdministrationException {

        final PetalsAdministration petals;
        try {
            petals = PetalsAdministrationFactory.getInstance().newPetalsAdministrationAPI();
        } catch (DuplicatedServiceException | MissingServiceException e) {
            throw new AssertionError(e);
        }

        final ContainerAdministration container = petals.newContainerAdministration();

        try {
            container.connect(bus.ip, bus.port, bus.username, bus.password);
            return container.getTopology(".*", bus.passphrase, true);
        } finally {
            try {
                if (container.isConnected()) {
                    container.disconnect();
                }
            } catch (ContainerAdministrationException e) {
                LOG.warn("Error while disconnecting from container", e);
            }
        }
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
