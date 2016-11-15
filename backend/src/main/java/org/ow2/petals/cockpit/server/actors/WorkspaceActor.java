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

import java.util.concurrent.ExecutorService;

import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.core.MediaType;

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
import org.ow2.petals.cockpit.server.actors.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusInError;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.BusesResource.NewBus;
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

    private final long id;

    private final SseBroadcaster broadcaster = new SseBroadcaster();

    @Inject
    @Named(CockpitApplication.PETALS_ADMIN_ES)
    private ExecutorService executor;

    @Inject
    @Named(CockpitApplication.PETALS_ADMIN_ES)
    private ExecutorService sqlExecutor;

    @Inject
    private BusesDAO buses;

    public WorkspaceActor(long id) {
        this.id = id;
        this.broadcaster.add(new BroadcasterListener<OutboundEvent>() {
            @Override
            public void onException(@Nullable ChunkedOutput<OutboundEvent> chunkedOutput,
                    @Nullable Exception exception) {
                LOG.error("Error in SSE broadcaster for workspace {}", id, exception);
            }

            @Override
            public void onClose(@Nullable ChunkedOutput<OutboundEvent> chunkedOutput) {
                LOG.debug("Client left workspace {}", id);
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

    public static BusInProgress importBus(DbWorkspace w, NewBus nb) {
        try {
            return RequestReplyHelper.call(WorkspaceActor.get(w), new WorkspaceActor.ImportBus(nb));
        } catch (InterruptedException | SuspendExecution e) {
            throw new AssertionError(e);
        }
    }

    public static void newClient(DbWorkspace w, EventOutput eo) {
        try {
            WorkspaceActor.get(w).send(new WorkspaceActor.NewClient(eo));
        } catch (SuspendExecution e) {
            throw new AssertionError(e);
        }
    }

    private static ActorRef<Msg> get(DbWorkspace w) throws SuspendExecution {
        ActorRef<Msg> a = ActorRegistry.getOrRegisterActor("workspace-" + w.id, () -> {
            WorkspaceActor workspaceActor = new WorkspaceActor(w.id);
            serviceLocator().inject(workspaceActor);
            return workspaceActor;
        });
        assert a != null;
        return a;
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {
        for (;;) {
            Msg msg = receive();
            if (msg instanceof NewClient) {
                LOG.debug("New SSE client for workspace {}", id);
                // this one is coming from the SSE resource
                broadcaster.add(((NewClient) msg).output);
            } else if (msg instanceof ImportBus) {
                handleImportBus((ImportBus) msg);
            } else if (msg instanceof SseEvent) {
                LOG.debug("Sending SSE event to clients for workspace {}: {}", id, msg);
                broadcaster.broadcast(((SseEvent) msg).event);
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", id, msg);
            }
        }
    }

    private void handleImportBus(ImportBus bus) throws SuspendExecution {
        try {
            final NewBus nb = bus.nb;
            final long bId = FiberAsync.runBlocking(sqlExecutor, new CheckedCallable<Long, RuntimeException>() {
                @Override
                public Long call() {
                    return buses.createBus(nb.importIp, nb.importPort, nb.importUsername, nb.importPassword,
                            nb.importPassphrase, id);
                }
            });
            RequestReplyHelper.reply(bus, new BusInProgress(bId, nb.importIp, nb.importPort, nb.importUsername));
            // we use a fiber to let the actor handles other message during bus import
            new Fiber<>(() -> {
                final WorkspaceEvent ev = doImportBus(bId, nb);
                // we use send in order to keep concurrency under control by the actor!
                self().send(new SseEvent("WORKSPACE_CHANGE", ev));
            }).start();
        } catch (Exception e) {
            RequestReplyHelper.replyError(bus, e);
        }
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
            LOG.info("Can't import bus from container {}:{}: {}", bus.importIp, bus.importPort, e.getMessage());
            LOG.debug("Can't import bus from container {}:{}", bus.importIp, bus.importPort, e);
            FiberAsync.runBlocking(sqlExecutor, new CheckedCallable<@Nullable Void, RuntimeException>() {
                @Override
                @Nullable
                public Void call() {
                    buses.saveError(bId, e.getMessage());
                    return null;
                }
            });
            return WorkspaceEvent
                    .error(new BusInError(bId, bus.importIp, bus.importPort, bus.importUsername, e.getMessage()));
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
            container.connect(bus.importIp, bus.importPort, bus.importUsername, bus.importPassword);
            return container.getTopology(".*", bus.importPassphrase, true);
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

    public static class NewClient implements Msg {

        final EventOutput output;

        public NewClient(EventOutput output) {
            this.output = output;
        }

    }

    public static class ImportBus extends RequestMessage<BusInProgress> implements Msg {

        private static final long serialVersionUID = 1286574765918364762L;

        final NewBus nb;

        public ImportBus(NewBus nb) {
            this.nb = nb;
        }
    }

    public static class SseEvent implements Msg {

        final OutboundEvent event;

        public SseEvent(String name, String data) {
            this.event = new OutboundEvent.Builder().name(name).data(data).build();
        }

        public SseEvent(String name, Object data) {
            this.event = new OutboundEvent.Builder().name(name).mediaType(MediaType.APPLICATION_JSON_TYPE).data(data)
                    .build();
        }

        @Override
        public String toString() {
            return "SseEvent[name:" + event.getName() + ", mt: " + event.getMediaType() + ", d: " + event.getData()
                    + "]";
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
