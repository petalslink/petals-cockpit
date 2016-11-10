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

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;

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
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.exception.ContainerAdministrationException;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusTree;
import org.ow2.petals.cockpit.server.resources.BusesResource.ComponentTree;
import org.ow2.petals.cockpit.server.resources.BusesResource.ContainerTree;
import org.ow2.petals.cockpit.server.resources.BusesResource.NewBus;
import org.ow2.petals.cockpit.server.resources.BusesResource.SUTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonProperty;

import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.actors.BasicActor;
import co.paralleluniverse.common.util.CheckedCallable;
import co.paralleluniverse.fibers.Fiber;
import co.paralleluniverse.fibers.FiberAsync;
import co.paralleluniverse.fibers.SuspendExecution;
import co.paralleluniverse.fibers.Suspendable;
import co.paralleluniverse.strands.Strand;

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

    @Nullable
    private ExecutorService executor;

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

    @Suspendable
    public static void send(long wsId, Msg msg) {
        if (Strand.isCurrentFiber()) {
            try {
                send0(wsId, msg);
            } catch (final SuspendExecution e) {
                throw new AssertionError(e);
            }
        } else {
            new Fiber<>(() -> send0(wsId, msg)).start();
        }
    }

    private static void send0(long wsId, Msg msg) throws SuspendExecution {
        ActorRegistry.getOrRegisterActor("workspace-" + wsId, () -> new WorkspaceActor(wsId)).send(msg);
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {
        executor = serviceLocator().getService(ExecutorService.class, CockpitApplication.PETALS_ADMIN_ES);

        for (;;) {
            Msg msg = receive();
            if (msg instanceof NewClient) {
                LOG.debug("New SSE client for workspace {}", id);
                // this one is coming from the SSE resource
                broadcaster.add(((NewClient) msg).output);
            } else if (msg instanceof ImportBus) {
                ImportBus bus = (ImportBus) msg;
                // we use a fiber to let the actor handles other message during bus import
                new Fiber<>(() -> {
                    WorkspaceEvent ev;
                    try {
                        BusTree tree = FiberAsync.runBlocking(executor,
                                (CheckedCallable<BusTree, Exception>) () -> doImportBus(bus));
                        ev = WorkspaceEvent.ok(bus.id, tree);
                    } catch (Exception e) {
                        LOG.info("Can't retrieve topology from container {}:{}: {}", bus.nb.getIp(), bus.nb.getPort(),
                                e.getMessage());
                        LOG.debug("Can't retrieve topology from container {}:{}", bus.nb.getIp(), bus.nb.getPort(), e);
                        ev = WorkspaceEvent.error(bus.id, e.getMessage());
                    }
                    // we use send in order to keep concurrency under control by the actor!
                    self().send(new SseEvent("WORKSPACE_CHANGE", ev));
                }).start();
            } else if (msg instanceof SseEvent) {
                LOG.debug("Sending SSE event to clients for workspace {}: {}", id, msg);
                broadcaster.broadcast(((SseEvent) msg).event);
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", id, msg);
            }
        }
    }

    private static BusTree doImportBus(ImportBus bus) throws Exception {
        PetalsAdministration petals = PetalsAdministrationFactory.getInstance().newPetalsAdministrationAPI();
        ContainerAdministration container = petals.newContainerAdministration();

        try {
            container.connect(bus.nb.getIp(), bus.nb.getPort(), bus.nb.getUsername(), bus.nb.getPassword());
            Domain topology = container.getTopology(".*", bus.nb.getPassphrase(), true);
            return buildBusTree(bus.id, topology);
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

    private static BusTree buildBusTree(String id, Domain topology) {

        List<ContainerTree> containers = new ArrayList<>();
        for (Container container : topology.getContainers()) {
            List<ComponentTree> components = new ArrayList<>();
            for (Component component : container.getComponents()) {
                List<SUTree> serviceUnits = new ArrayList<>();
                for (ServiceAssembly sa : container.getServiceAssemblies()) {
                    for (ServiceUnit su : sa.getServiceUnits()) {
                        if (su.getTargetComponent().equals(component.getName())) {
                            // TODO id
                            serviceUnits.add(new SUTree("a", su.getName(), SUTree.State.from(sa.getState())));
                        }
                    }
                }

                // TODO id
                components.add(new ComponentTree("a", component.getName(),
                        ComponentTree.State.from(component.getState()), serviceUnits));
            }

            // TODO id
            containers.add(
                    new ContainerTree("a", container.getContainerName(), ContainerTree.State.Deployed, components));
        }

        return new BusTree(id, topology.getName(), containers);
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

    public static class ImportBus implements Msg {

        final String id;

        final NewBus nb;

        public ImportBus(String id, NewBus nb) {
            this.id = id;
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

        public static WorkspaceEvent error(String id, String error) {
            return new WorkspaceEvent("BUS_IMPORT_ERROR", new ImportBusError(id, error));
        }

        public static WorkspaceEvent ok(String id, BusTree bus) {
            return new WorkspaceEvent("BUS_IMPORT_OK", bus);
        }
    }

    public static class ImportBusError {

        @JsonProperty
        private final String id;

        @JsonProperty
        private final String error;

        public ImportBusError(String id, String error) {
            this.id = id;
            this.error = error;
        }
    }
}
