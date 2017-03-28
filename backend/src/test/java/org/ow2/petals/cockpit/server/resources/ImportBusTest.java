/**
 * Copyright (C) 2016-2017 Linagora
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
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;

import java.util.Iterator;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.jooq.Result;
import org.jooq.impl.DSL;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.BusFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.testing.junit.ResourceTestRule;
import jersey.repackaged.com.google.common.collect.ImmutableMap;

public class ImportBusTest extends AbstractCockpitResourceTest {

    private final Domain domain = new Domain("dom");

    private final Container container = new Container("cont", "host1", ImmutableMap.of(PortType.JMX, 7700), "user",
            "pass", State.REACHABLE);

    private final Container container2 = new Container("cont2", "host2", ImmutableMap.of(PortType.JMX, 7700), "user",
            "pass", State.REACHABLE);

    private final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED);

    private final ServiceUnit serviceUnit = new ServiceUnit("su", component.getName());

    private final ServiceAssembly serviceAssembly = new ServiceAssembly("sa", ArtifactState.State.STARTED, serviceUnit);

    @Rule
    public final ResourceTestRule resources = buildResourceTest(WorkspaceResource.class);

    @Before
    public void setUp() {
        // petals
        container.addProperty("petals.topology.passphrase", "phrase");
        petals.registerDomain(domain);
        petals.registerContainer(container);
        petals.registerContainer(container2);
        petals.registerArtifact(component, container);
        petals.registerArtifact(serviceAssembly, container);

        DSL.using(dbRule.getConnectionJdbcUrl()).transaction(conf -> {
            DSL.using(conf).executeInsert(new WorkspacesRecord(1L, "test"));
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

    @Test
    public void testImportBusOk() {
        long busId;
        try (EventInput eventInput = resources.target("/workspaces/1").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            BusInProgress post = resources.getJerseyTest()
                    .target("/workspaces/1/buses").request().post(Entity.json(new NewBus(container.getHost(),
                            getPort(container), container.getJmxUsername(), container.getJmxPassword(), "phrase")),
                            BusInProgress.class);

            assertThat(post.ip).isEqualTo(container.getHost());
            assertThat(post.port).isEqualTo(getPort(container));
            assertThat(post.username).isEqualTo(container.getJmxUsername());
            assertThat(post.importError).isNull();

            expectImportBusEvent(eventInput, post);

            // there should be only one!
            Result<BusesRecord> buses = DSL.using(dbRule.getConnection()).selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(1);
            BusesRecord bus = buses.iterator().next();

            // we can't really check for the temporary state because it is executed concurrently
            assertThat(bus.getImportIp()).isEqualTo(container.getHost());
            assertThat(bus.getImportPort()).isEqualTo(getPort(container));
            assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
            assertThat(bus.getImportPassword()).isEqualTo(container.getJmxPassword());
            assertThat(bus.getImportPassphrase()).isEqualTo("phrase");
            assertThat(bus.getWorkspaceId()).isEqualTo(1);
            assertThat(post.id).isEqualTo(bus.getId());
            busId = bus.getId();

            // TODO verify all the content!
            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_IMPORT_OK");
                WorkspaceContent data = e.readData(WorkspaceContent.class);
                BusFull busData = data.buses.get(post.getId());
                a.assertThat(busData.bus.id).isEqualTo(busId);
                a.assertThat(busData.bus.name).isEqualTo(domain.getName());
            });
        }

        Result<BusesRecord> buses = DSL.using(dbRule.getConnection()).selectFrom(BUSES).where(BUSES.ID.eq(busId))
                .fetch();
        assertThat(buses).hasSize(1);
        BusesRecord bus = buses.iterator().next();

        // these shouldn't have changed
        assertThat(bus.getImportIp()).isEqualTo(container.getHost());
        assertThat(bus.getImportPort()).isEqualTo(getPort(container));
        assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
        assertThat(bus.getImportPassword()).isEqualTo(container.getJmxPassword());
        assertThat(bus.getImportPassphrase()).isEqualTo("phrase");
        assertThat(bus.getWorkspaceId()).isEqualTo(1);
        // these should have been set now
        assertThat(bus.getImported()).isEqualTo(true);
        assertThat(bus.getImportError()).isNull();
        assertThat(bus.getName()).isEqualTo(domain.getName());

        Result<ContainersRecord> containers = DSL.using(dbRule.getConnection()).selectFrom(CONTAINERS)
                .where(CONTAINERS.BUS_ID.eq(busId)).fetch();
        assertThat(containers).hasSize(2);
        Iterator<ContainersRecord> iterator = containers.iterator();
        ContainersRecord cDb = iterator.next();
        ContainersRecord cDb2 = iterator.next();
        assertEquivalent(cDb, container);
        assertEquivalent(cDb2, container2);

        Result<ComponentsRecord> components = DSL.using(dbRule.getConnection()).selectFrom(COMPONENTS)
                .where(COMPONENTS.CONTAINER_ID.eq(cDb.getId())).fetch();
        assertThat(components).hasSize(1);
        ComponentsRecord compDb = components.iterator().next();
        assertEquivalent(compDb, component);

        Result<ServiceunitsRecord> sus = DSL.using(dbRule.getConnection()).selectFrom(SERVICEUNITS)
                .where(SERVICEUNITS.COMPONENT_ID.eq(compDb.getId())).fetch();
        assertThat(sus).hasSize(1);
        ServiceunitsRecord suDb = sus.iterator().next();
        assertEquivalent(suDb, serviceAssembly);
    }

    @Test
    public void testImportBusForbidden() {

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new WorkspacesRecord(2L, "test2"));

        Response post = resources.target("/workspaces/2/buses").request()
                .post(Entity.json(new NewBus(container.getHost(), getPort(container), container.getJmxUsername(),
                        container.getJmxPassword(), "phrase")));

        assertThat(post.getStatus()).isEqualTo(403);
    }

    @Test
    public void testImportBusNotFoundForbidden() {

        Response post = resources.target("/workspaces/2/buses").request()
                .post(Entity.json(new NewBus(container.getHost(), getPort(container), container.getJmxUsername(),
                        container.getJmxPassword(), "phrase")));

        assertThat(post.getStatus()).isEqualTo(403);
    }

    @Test
    public void testImportBusErrorAndDelete() {
        String incorrectHost = "wrong-host";
        int incorrectPort = 7700;

        final long busId;
        try (EventInput eventInput = resources.target("/workspaces/1").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            BusInProgress post = resources.target("/workspaces/1/buses").request()
                    .post(Entity.json(new NewBus(incorrectHost, incorrectPort, container.getJmxUsername(),
                            container.getJmxPassword(), "phrase")), BusInProgress.class);

            assertThat(post.ip).isEqualTo(incorrectHost);
            assertThat(post.port).isEqualTo(incorrectPort);
            assertThat(post.username).isEqualTo(container.getJmxUsername());
            assertThat(post.importError).isNull();

            expectImportBusEvent(eventInput, post);

            // there should be only one!
            Result<BusesRecord> buses = DSL.using(dbRule.getConnection()).selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(1);
            BusesRecord bus = buses.iterator().next();

            // we can't really check for the temporary state because it is executed concurrently
            assertThat(bus.getImportIp()).isEqualTo(incorrectHost);
            assertThat(bus.getImportPort()).isEqualTo(incorrectPort);
            assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
            assertThat(bus.getImportPassword()).isEqualTo(container.getJmxPassword());
            assertThat(bus.getImportPassphrase()).isEqualTo("phrase");
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

        Result<BusesRecord> busesDb = DSL.using(dbRule.getConnection()).selectFrom(BUSES).where(BUSES.ID.eq(busId))
                .fetch();
        assertThat(busesDb).hasSize(1);
        BusesRecord busDb = busesDb.iterator().next();

        // these shouldn't have changed
        assertThat(busDb.getImportIp()).isEqualTo(incorrectHost);
        assertThat(busDb.getImportPort()).isEqualTo(incorrectPort);
        assertThat(busDb.getImportUsername()).isEqualTo(container.getJmxUsername());
        assertThat(busDb.getImportPassword()).isEqualTo(container.getJmxPassword());
        assertThat(busDb.getImportPassphrase()).isEqualTo("phrase");
        assertThat(busDb.getWorkspaceId()).isEqualTo(1);
        // these should have been set now
        assertThat(busDb.getImported()).isEqualTo(false);
        assertThat(busDb.getImportError()).isEqualTo("Unknown Host");
        assertThat(busDb.getName()).isNull();

        try (EventInput eventInput = resources.target("/workspaces/1").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get(EventInput.class)) {

            expectWorkspaceContent(eventInput, (c, a) -> {
                a.assertThat(c.content.busesInProgress).containsOnlyKeys(String.valueOf(busId));
            });

            BusDeleted delete = resources.target("/workspaces/1/buses/" + busId).request().delete(BusDeleted.class);

            assertThat(delete.id).isEqualTo(busId);

            Result<BusesRecord> buses = DSL.using(dbRule.getConnection()).selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(0);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_DELETED");
                BusDeleted data = e.readData(BusDeleted.class);
                a.assertThat(data.id).isEqualTo(delete.id);
            });
        }
    }

    @Test
    public void importBusErrorSA() {
        petals.registerArtifact(new Component("comp", ComponentType.BC), container);
        petals.registerArtifact(
                new ServiceAssembly("sa", new ServiceUnit("su1", "comp"), new ServiceUnit("su2", "comp")), container);

        long busId;
        try (EventInput eventInput = resources.target("/workspaces/1").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            BusInProgress post = resources.getJerseyTest()
                    .target("/workspaces/1/buses").request().post(Entity.json(new NewBus(container.getHost(),
                            getPort(container), container.getJmxUsername(), container.getJmxPassword(), "phrase")),
                            BusInProgress.class);

            assertThat(post.ip).isEqualTo(container.getHost());
            assertThat(post.port).isEqualTo(getPort(container));
            assertThat(post.username).isEqualTo(container.getJmxUsername());
            assertThat(post.importError).isNull();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_IMPORT");
                BusInProgress data = e.readData(BusInProgress.class);
                a.assertThat(data.id).isEqualTo(post.id);
                a.assertThat(data.ip).isEqualTo(post.ip);
                a.assertThat(data.port).isEqualTo(post.port);
                a.assertThat(data.username).isEqualTo(post.username);
                a.assertThat(data.importError).isEqualTo(post.importError);
            });

            Result<BusesRecord> buses = DSL.using(dbRule.getConnection()).selectFrom(BUSES).fetch();
            assertThat(buses).hasSize(1);
            BusesRecord bus = buses.iterator().next();

            // we can't really check for the temporary state because it is executed concurrently
            assertThat(bus.getImportIp()).isEqualTo(container.getHost());
            assertThat(bus.getImportPort()).isEqualTo(getPort(container));
            assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
            assertThat(bus.getImportPassword()).isEqualTo(container.getJmxPassword());
            assertThat(bus.getImportPassphrase()).isEqualTo("phrase");
            assertThat(bus.getWorkspaceId()).isEqualTo(1);
            assertThat(bus.getImported()).isEqualTo(false);
            assertThat(post.id).isEqualTo(bus.getId());
            busId = bus.getId();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("BUS_IMPORT_ERROR");
                BusInProgress data = e.readData(BusInProgress.class);
                a.assertThat(data.id).isEqualTo(busId);
                a.assertThat(data.importError).contains("Buses with not-single SU SAs are not supported");
            });
        }

        Result<BusesRecord> buses = DSL.using(dbRule.getConnection()).selectFrom(BUSES).where(BUSES.ID.eq(busId))
                .fetch();
        assertThat(buses).hasSize(1);
        BusesRecord bus = buses.iterator().next();

        // these shouldn't have changed
        assertThat(bus.getImportIp()).isEqualTo(container.getHost());
        assertThat(bus.getImportPort()).isEqualTo(getPort(container));
        assertThat(bus.getImportUsername()).isEqualTo(container.getJmxUsername());
        assertThat(bus.getImportPassword()).isEqualTo(container.getJmxPassword());
        assertThat(bus.getImportPassphrase()).isEqualTo("phrase");
        assertThat(bus.getWorkspaceId()).isEqualTo(1);
        // these should have been set now
        assertThat(bus.getImported()).isEqualTo(false);
        assertThat(bus.getImportError()).contains("Buses with not-single SU SAs are not supported");
        assertThat(bus.getName()).isNull();
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
