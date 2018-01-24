/**
 * Copyright (C) 2016-2018 Linagora
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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CountDownLatch;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.sse.EventInput;
import org.jooq.Result;
import org.jooq.impl.DSL;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.endpoint.Endpoint;
import org.ow2.petals.admin.endpoint.Endpoint.EndpointType;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableSet;

import jersey.repackaged.com.google.common.collect.ImmutableMap;

public class ImportBusTest extends AbstractBasicResourceTest {

    private final Domain domain = new Domain("dom");

    private final Container container = new Container("cont", "host1", ImmutableMap.of(PortType.JMX, 7700), "user",
            "pass", State.REACHABLE);

    private final Container container2 = new Container("cont2", "host2", ImmutableMap.of(PortType.JMX, 7700), "user",
            "pass", State.REACHABLE);

    private final SharedLibrary sharedLibrary = new SharedLibrary("sl", "1.0.0");

    private final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED);

    private final Component componentWithSL = new Component("comp2", ComponentType.SE, ArtifactState.State.STARTED,
            ImmutableSet.of(sharedLibrary.copy()));

    private final ServiceUnit serviceUnit = new ServiceUnit("su", component.getName());

    private final ServiceAssembly serviceAssembly = new ServiceAssembly("sa", ArtifactState.State.STARTED, serviceUnit);

    private final List<Endpoint> referenceEndpoints = makeEndpoints();

    public ImportBusTest() {
        super(WorkspaceResource.class);
    }

    @Before
    public void setUp() {
        // petals
        container.addProperty("petals.topology.passphrase", "phrase");
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerContainer(container2);
        resource.petals.registerArtifact(component, container);
        resource.petals.registerArtifact(serviceAssembly, container);
        resource.petals.registerArtifact(sharedLibrary, container);
        resource.petals.registerArtifact(componentWithSL, container);
        resource.petals.registerEndpoints(referenceEndpoints);
        
        resource.db().transaction(conf -> {
            DSL.using(conf).executeInsert(new WorkspacesRecord(1L, "test", ""));
            DSL.using(conf).executeInsert(new UsersWorkspacesRecord(1L, ADMIN));
        });
    }

    private void expectImportBusEvent(EventInput eventInput, BusInProgress post) {
        expectEvent(eventInput, (e, a) -> {
            a.assertThat(e.getName()).isEqualTo("BUS_IMPORT");
            BusInProgress data = e.readData(BusInProgress.class);
            a.assertThat(data.id).isEqualTo(post.id);
            a.assertThat(data.ip).isEqualTo(post.ip);
            a.assertThat(data.port).isEqualTo(post.port);
            a.assertThat(data.username).isEqualTo(post.username);
            a.assertThat(data.importError).isEqualTo(post.importError);
        });
    }

    @SuppressWarnings("unchecked")
    private static <E extends @Nullable Exception> void doThrow0(Exception e) throws E {
        throw (E) e;
    }

    @Test
    public void testImportBusOk() {
        long busId;
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput);

            BusInProgress post = resource.target("/workspaces/1/buses").request()
                    .post(Entity.json(new NewBus(container.getHost(), getPort(container), container.getJmxUsername(),
                            container.getJmxPassword(), "phrase")), BusInProgress.class);

            assertThat(post.ip).isEqualTo(container.getHost());
            assertThat(post.port).isEqualTo(getPort(container));
            assertThat(post.username).isEqualTo(container.getJmxUsername());
            assertThat(post.importError).isNull();

            expectImportBusEvent(eventInput, post);

            // there should be only one!
            Result<BusesRecord> buses = resource.db().selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(1);
            BusesRecord bus = buses.iterator().next();

            // we can't really check for the temporary state because it is executed concurrently
            assertThat(bus.getImportIp()).isEqualTo(container.getHost());
            assertThat(bus.getImportPort()).isEqualTo(getPort(container));
            assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
            assertThat(bus.getWorkspaceId()).isEqualTo(1);
            assertThat(post.id).isEqualTo(bus.getId());
            busId = bus.getId();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_IMPORT_OK");
                WorkspaceContent data = e.readData(WorkspaceContent.class);
                BusFull busData = data.buses.get(post.getId());
                a.assertThat(busData.bus.id).isEqualTo(busId);
                assertWorkspaceContent(a, data, 1, referenceEndpoints, domain);
            });
        }

        Result<BusesRecord> buses = resource.db().selectFrom(BUSES).where(BUSES.ID.eq(busId)).fetch();
        assertThat(buses).hasSize(1);
        BusesRecord bus = buses.iterator().next();

        // these shouldn't have changed
        assertThat(bus.getImportIp()).isEqualTo(container.getHost());
        assertThat(bus.getImportPort()).isEqualTo(getPort(container));
        assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
        assertThat(bus.getWorkspaceId()).isEqualTo(1);

        // these should have been set now
        assertThat(bus.getImported()).isEqualTo(true);
        assertThat(bus.getImportError()).isNull();
        assertThat(bus.getName()).isEqualTo(domain.getName());
    }

    @Test
    public void testImportBusForbidden() {

        resource.db().executeInsert(new WorkspacesRecord(2L, "test2", ""));

        Response post = resource.target("/workspaces/2/buses").request()
                .post(Entity.json(new NewBus(container.getHost(), getPort(container), container.getJmxUsername(),
                        container.getJmxPassword(), "phrase")));

        assertThat(post.getStatus()).isEqualTo(403);
    }

    @Test
    public void testImportBusNotFoundForbidden() {

        Response post = resource.target("/workspaces/2/buses").request()
                .post(Entity.json(new NewBus(container.getHost(), getPort(container), container.getJmxUsername(),
                        container.getJmxPassword(), "phrase")));

        assertThat(post.getStatus()).isEqualTo(403);
    }

    @Test
    public void testImportBusCancel() {
        CountDownLatch doneSignal = new CountDownLatch(1);
        Container slowContainer = new Container("cont3", "host3", ImmutableMap.of(PortType.JMX, 7700), "user", "pass",
                State.REACHABLE) {
            @Override
            public State getState() {
                try {
                    doneSignal.await();
                } catch (InterruptedException e) {
                    ImportBusTest.<@Nullable RuntimeException> doThrow0(e);
                }
                return State.REACHABLE;
            }
        };

        resource.petals.registerContainer(slowContainer);

        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput);

            BusInProgress post = resource.target("/workspaces/1/buses").request()
                    .post(Entity.json(new NewBus(container.getHost(), getPort(container), container.getJmxUsername(),
                            container.getJmxPassword(), "phrase")), BusInProgress.class);

            assertThat(post.ip).isEqualTo(container.getHost());
            assertThat(post.port).isEqualTo(getPort(container));
            assertThat(post.username).isEqualTo(container.getJmxUsername());
            assertThat(post.importError).isNull();

            expectImportBusEvent(eventInput, post);

            // there should be only one!
            Result<BusesRecord> buses = resource.db().selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(1);
            BusesRecord bus = buses.iterator().next();

            // we can't really check for the temporary state because it is executed concurrently
            assertThat(bus.getImportIp()).isEqualTo(container.getHost());
            assertThat(bus.getImportPort()).isEqualTo(getPort(container));
            assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
            assertThat(bus.getWorkspaceId()).isEqualTo(1);
            assertThat(post.id).isEqualTo(bus.getId());

            BusDeleted delete = resource.target("/workspaces/1/buses/" + post.id).request().delete(BusDeleted.class);

            assertThat(delete.id).isEqualTo(post.id);
            assertThat(delete.reason).isEqualTo("Import cancelled by admin");

            doneSignal.countDown();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_DELETED");
                BusDeleted data = e.readData(BusDeleted.class);
                a.assertThat(data.id).isEqualTo(post.id);
                a.assertThat(data.reason).isEqualTo(delete.reason);
            });

            Result<BusesRecord> buses2 = resource.db().selectFrom(BUSES).fetch();
            assertThat(buses2).hasSize(0);
        }
    }

    @Test
    public void testImportBusErrorAndDelete() {
        String incorrectHost = "wrong-host";
        int incorrectPort = 7700;

        final long busId;
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput);

            BusInProgress post = resource.target("/workspaces/1/buses").request()
                    .post(Entity.json(new NewBus(incorrectHost, incorrectPort, container.getJmxUsername(),
                            container.getJmxPassword(), "phrase")), BusInProgress.class);

            assertThat(post.ip).isEqualTo(incorrectHost);
            assertThat(post.port).isEqualTo(incorrectPort);
            assertThat(post.username).isEqualTo(container.getJmxUsername());
            assertThat(post.importError).isNull();

            expectImportBusEvent(eventInput, post);

            // there should be only one!
            Result<BusesRecord> buses = resource.db().selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(1);
            BusesRecord bus = buses.iterator().next();

            // we can't really check for the temporary state because it is executed concurrently
            assertThat(bus.getImportIp()).isEqualTo(incorrectHost);
            assertThat(bus.getImportPort()).isEqualTo(incorrectPort);
            assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
            assertThat(bus.getWorkspaceId()).isEqualTo(1);
            assertThat(bus.getImported()).isEqualTo(false);
            assertThat(post.id).isEqualTo(bus.getId());
            busId = bus.getId();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_IMPORT_ERROR");
                BusInProgress data = e.readData(BusInProgress.class);
                a.assertThat(data.id).isEqualTo(busId);
                a.assertThat(data.importError).isEqualTo("Unknown Host");
            });
        }

        Result<BusesRecord> busesDb = resource.db().selectFrom(BUSES).where(BUSES.ID.eq(busId)).fetch();
        assertThat(busesDb).hasSize(1);
        BusesRecord busDb = busesDb.iterator().next();

        // these shouldn't have changed
        assertThat(busDb.getImportIp()).isEqualTo(incorrectHost);
        assertThat(busDb.getImportPort()).isEqualTo(incorrectPort);
        assertThat(busDb.getImportUsername()).isEqualTo(container.getJmxUsername());
        assertThat(busDb.getWorkspaceId()).isEqualTo(1);
        // these should have been set now
        assertThat(busDb.getImported()).isEqualTo(false);
        assertThat(busDb.getImportError()).isEqualTo("Unknown Host");
        assertThat(busDb.getName()).isNull();

        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (c, a) -> {
                a.assertThat(c.content.busesInProgress).containsOnlyKeys(String.valueOf(busId));
            });

            BusDeleted delete = resource.target("/workspaces/1/buses/" + busId).request().delete(BusDeleted.class);

            assertThat(delete.id).isEqualTo(busId);
            assertThat(delete.reason).isEqualTo("Bus deleted by admin");

            Result<BusesRecord> buses = resource.db().selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(0);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_DELETED");
                BusDeleted data = e.readData(BusDeleted.class);
                a.assertThat(data.id).isEqualTo(delete.id);
                a.assertThat(data.reason).isEqualTo(delete.reason);
            });
        }
    }

    private List<Endpoint> makeEndpoints() {
        List<Endpoint> endpoints = new ArrayList<Endpoint>();

        endpoints.add(new Endpoint("edp1", EndpointType.INTERNAL, "cont", "comp", "{http://namespace.org/}serv 1",
                Arrays.asList("{http://namespace.org/}int1")));
        endpoints.add(new Endpoint("edp2", EndpointType.INTERNAL, "cont", "comp", "{http://namespace.org/}serv2",
                Arrays.asList("{http://namespace.org/}int2", "{http://namespace.org/}int3")));
        endpoints.add(new Endpoint("edp3", EndpointType.INTERNAL, "cont", "comp", "{http://namespace.org/}serv3",
                Arrays.asList("{http://namespace.org/}int3")));
        endpoints.add(new Endpoint("edp4", EndpointType.INTERNAL, "cont", "comp", "{http://namespace.org/}serv4",
                Arrays.asList("{http://namespace.org/}int3")));
        endpoints.add(new Endpoint("edp5", EndpointType.INTERNAL, "cont", "comp2", "{http://namespace.org/}serv1",
                Arrays.asList("{http://petals.ow2.org/}int1", "{http://petals.ow2.org/}int2")));

        return endpoints;
    }
}

/**
 * We can't use {@link BusesResource.BusImport} because it won't serialize the passwords (on purpose!!)
 */
class NewBus {

    @JsonProperty
    public final String ip;

    @JsonProperty
    public final int port;

    @JsonProperty
    public final String username;

    @JsonProperty
    public final String password;

    @JsonProperty
    public final String passphrase;

    public NewBus(String ip, int port, String username, String password, String passphrase) {
        this.ip = ip;
        this.port = port;
        this.username = username;
        this.password = password;
        this.passphrase = passphrase;
    }
}
