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
import java.util.concurrent.Executors;

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
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.resources.BusesResource.NewBus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.allanbank.mongodb.bson.Document;
import com.allanbank.mongodb.bson.builder.ArrayBuilder;
import com.allanbank.mongodb.bson.builder.BuilderFactory;
import com.allanbank.mongodb.bson.builder.DocumentBuilder;
import com.google.common.util.concurrent.ThreadFactoryBuilder;

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

    /**
     * This needs to have only ONE thread because petals-admin uses a singleton which prevent concurrent use
     */
    private static final ExecutorService exec = Executors.newFixedThreadPool(1,
            new ThreadFactoryBuilder().setNameFormat("petals-admin-worker-%d").setDaemon(true).build());

    private final String id;

    private final SseBroadcaster broadcaster = new SseBroadcaster();

    public WorkspaceActor(String id) {
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

    @Suspendable
    public static void send(String wsId, Msg msg) {
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

    private static void send0(String wsId, Msg msg) throws SuspendExecution {
        ActorRegistry.getOrRegisterActor("workspace-" + wsId, () -> new WorkspaceActor(wsId)).send(msg);
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
                ImportBus bus = (ImportBus) msg;
                // we use a fiber to let the actor handles other message during bus import
                new Fiber<>(() -> {
                    Document d;
                    try {
                        Document nd = FiberAsync.runBlocking(exec,
                                (CheckedCallable<Document, Exception>) () -> doImportBus(bus));
                        d = BuilderFactory.start().add("event", "BUS_IMPORT_OK").add("data", nd).build();
                    } catch (Exception e) {
                        LOG.info("Can't retrieve topology from container {}:{}", bus.nb.getIp(), bus.nb.getPort(), e);
                        Document nd = BuilderFactory.start().add("id", bus.id).add("error", e.getMessage()).build();
                        d = BuilderFactory.start().add("event", "BUS_IMPORT_ERROR").add("data", nd).build();
                    }
                    // we use send in order to keep concurrency under control by the actor!
                    self().send(new SseEvent("WORKSPACE_CHANGE", d));
                }).start();
            } else if (msg instanceof SseEvent) {
                LOG.debug("Sending SSE event to clients for workspace {}: {}", id, msg);
                broadcaster.broadcast(((SseEvent) msg).event);
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", id, msg);
            }
        }
    }

    private static Document doImportBus(ImportBus bus) throws Exception {
        PetalsAdministration petals = PetalsAdministrationFactory.getInstance().newPetalsAdministrationAPI();
        ContainerAdministration container = petals.newContainerAdministration();

        try {
            container.connect(bus.nb.getIp(), bus.nb.getPort(), bus.nb.getUsername(), bus.nb.getPassword());
            Domain topology = container.getTopology(".*", null, true);
            return buildBusTree(bus.id, topology);
        } finally {
            try {
                container.disconnect();
            } catch (ContainerAdministrationException e) {
                LOG.warn("Error while disconnecting from container", e);
            }
        }
    }

    private static Document buildBusTree(String id, Domain topology) {
        DocumentBuilder b = BuilderFactory.start();

        b.add("id", id);
        b.add("name", topology.getName());

        ArrayBuilder cs = b.pushArray("containers");

        for (Container container : topology.getContainers()) {
            DocumentBuilder cont = cs.push();
            // TODO id
            cont.add("id", "a");
            cont.add("name", container.getContainerName());
            cont.add("state", "Deployed");
            ArrayBuilder comps = cont.pushArray("components");
            Map<String, @Nullable ArrayBuilder> compsMap = new HashMap<>();
            for (Component component : container.getComponents()) {
                DocumentBuilder comp = comps.push();
                // TODO id
                comp.add("id", "a");
                comp.add("name", component.getName());
                comp.add("state", component.getState().toString());
                compsMap.put(component.getName(), comp.pushArray("serviceUnits"));
            }

            for (ServiceAssembly sa : container.getServiceAssemblies()) {
                for (ServiceUnit su : sa.getServiceUnits()) {
                    String tc = su.getTargetComponent();
                    ArrayBuilder sus = compsMap.get(tc);
                    if (sus != null) {
                        DocumentBuilder sub = sus.push();
                        // TODO id
                        sub.add("id", "a");
                        sub.add("name", su.getName());
                        // TODO bof bof
                        sub.add("state", sa.getState().toString());
                    } else {
                        LOG.warn("Retrieved a SU {} deployed on component {}, but {} does not exist", su.getName(), tc,
                                tc);
                    }
                }
            }
        }

        return b.build();
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
}
