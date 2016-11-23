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

import java.util.Optional;
import java.util.concurrent.ExecutorService;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.hk2.api.ServiceLocator;
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

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.actors.BasicActor;
import co.paralleluniverse.actors.behaviors.RequestMessage;
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

    @Nullable
    private static ServiceLocator serviceLocator;

    private final DbWorkspace w;

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

    public WorkspaceActor(DbWorkspace w) {
        this.w = w;
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

    public static void setServiceLocator(ServiceLocator sl) {
        serviceLocator = sl;
    }

    private static ServiceLocator serviceLocator() {
        assert serviceLocator != null;
        return serviceLocator;
    }

    @SuppressWarnings("resource")
    public static Optional<ActorRef<Msg>> get(long wId) throws SuspendExecution {
        String name = "workspace-" + wId;

        ActorRef<Msg> a = ActorRegistry.tryGetActor(name);

        if (a == null) {
            WorkspacesDAO workspaces = serviceLocator().getService(WorkspacesDAO.class);
            assert workspaces != null;
            DbWorkspace ws = workspaces.findById(wId);
            if (ws != null) {
                a = ActorRegistry.getOrRegisterActor(name, () -> {
                    WorkspaceActor workspaceActor = new WorkspaceActor(ws);
                    serviceLocator().inject(workspaceActor);
                    return workspaceActor;
                });
            }
        }

        return Optional.ofNullable(a);
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {
        for (;;) {
            Msg msg = receive();
            if (msg instanceof GetTree) {
                // TODO let the actor keep the workspace tree in memory and take care of sync to db
                answer((GetTree) msg, m -> Either.right(workspaces.getWorkspaceTree(w)));
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
                LOG.debug("New SSE client for workspace {}", w.id);
                // this one is coming from the SSE resource
                answer((NewClient) msg, nc -> {
                    broadcaster.add(nc.output);
                    return Either.right(null);
                });
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", w.id, msg);
            }
        }
    }

    private <R, T extends WorkspaceRequest<R>> void answer(T r, CheckedFunction1<T, Either<Status, R>> f)
            throws SuspendExecution {
        try {
            if (w.users.stream().anyMatch(r.user::equals)) {
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

        final long bId = FiberAsync.runBlocking(sqlExecutor, new CheckedCallable<Long, RuntimeException>() {
            @Override
            public Long call() {
                return buses.createBus(nb.ip, nb.port, nb.username, nb.password, nb.passphrase, w.id);
            }
        });

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

            final BusTree tree = FiberAsync.runBlocking(sqlExecutor, new CheckedCallable<BusTree, RuntimeException>() {
                @Override
                public BusTree call() {
                    return buses.saveImport(bId, topology);
                }
            });

            return WorkspaceEvent.ok(tree);

        } catch (Exception e) {
            String m = e.getMessage();
            String message = m != null ? m : e.getClass().getName();

            LOG.info("Can't import bus from container {}:{}: {}", bus.ip, bus.port, message);
            LOG.debug("Can't import bus from container {}:{}", bus.ip, bus.port, e);

            FiberAsync.runBlocking(sqlExecutor, new CheckedCallable<@Nullable Void, RuntimeException>() {
                @Override
                @Nullable
                public Void call() {
                    buses.saveError(bId, message);
                    return null;
                }
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

    public abstract static class WorkspaceRequest<R> extends RequestMessage<Either<Status, R>> implements Msg {

        private static final long serialVersionUID = -5915325922592086753L;

        final String user;

        public WorkspaceRequest(String user) {
            this.user = user;
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
