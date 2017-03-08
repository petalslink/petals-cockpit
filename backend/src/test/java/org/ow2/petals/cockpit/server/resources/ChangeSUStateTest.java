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
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;

import java.util.Arrays;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
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
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SUChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SUStateChanged;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.testing.junit.ResourceTestRule;
import javaslang.Tuple;

public class ChangeSUStateTest extends AbstractCockpitResourceTest {

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED);

    private final ServiceUnit serviceUnit1 = new ServiceUnit("su1", component.getName());

    private final ServiceAssembly serviceAssembly1 = new ServiceAssembly("sa1", ArtifactState.State.STARTED,
            serviceUnit1);

    private final ServiceUnit serviceUnit2 = new ServiceUnit("su2", component.getName());

    private final ServiceAssembly serviceAssembly2 = new ServiceAssembly("sa2", ArtifactState.State.STOPPED,
            serviceUnit2);

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ServiceUnitsResource.class, WorkspaceResource.class);

    @Before
    public void setUp() {
        petals.registerDomain(domain);
        petals.registerContainer(container);
        petals.registerArtifact(component, container);
        petals.registerArtifact(serviceAssembly1, container);
        petals.registerArtifact(serviceAssembly2, container);

        setupWorkspace(1, "test",
                Arrays.asList(Tuple.of(10L, domain, "phrase", Arrays.asList(Tuple.of(20L, container,
                        Arrays.asList(Tuple.of(30L, component,
                                Arrays.asList(Tuple.of(40L, serviceAssembly1), Tuple.of(41L, serviceAssembly2)))))))),
                ADMIN);
    }

    @Test
    public void changeSU1State() {

        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/40").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Started);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            SUStateChanged put = resources.getJerseyTest().target("/workspaces/1/serviceunits/40").request()
                    .put(Entity.json(new SUChangeState(ServiceUnitMin.State.Stopped)), SUStateChanged.class);

            assertThat(put.state).isEqualTo(ServiceUnitMin.State.Stopped);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SU_STATE_CHANGE");
                SUStateChanged data = e.readData(SUStateChanged.class);
                a.assertThat(data.id).isEqualTo(40);
                a.assertThat(data.state).isEqualTo(ServiceUnitMin.State.Stopped);
            });
        }

        assertThatDbSU(40).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Stopped.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbSU(41).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSU1StateForbidden() {

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2",
                Arrays.asList(Tuple.of(11L, domain, "phrase", Arrays.asList(Tuple.of(21L, container,
                        Arrays.asList(Tuple.of(31L, component,
                                Arrays.asList(Tuple.of(42L, serviceAssembly1), Tuple.of(43L, serviceAssembly2)))))))),
                "anotheruser");

        Response put = resources.getJerseyTest().target("/workspaces/2/serviceunits/42").request()
                .put(Entity.json(new SUChangeState(ServiceUnitMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbSU(40).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSU(41).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbSU(42).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Started.name());
        assertThatDbSU(43).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Stopped.name());
    }

    @Test
    public void changeSU1StateNotFound() {

        Response put = resources.getJerseyTest().target("/workspaces/1/serviceunits/42").request()
                .put(Entity.json(new SUChangeState(ServiceUnitMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(404);

        assertThatDbSU(40).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSU(41).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSU2StateUnload() {

        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/41").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Stopped);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            SUStateChanged put = resources.getJerseyTest().target("/workspaces/1/serviceunits/41").request()
                    .put(Entity.json(new SUChangeState(ServiceUnitMin.State.Unloaded)), SUStateChanged.class);

            assertThat(put.state).isEqualTo(ServiceUnitMin.State.Unloaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SU_STATE_CHANGE");
                SUStateChanged data = e.readData(SUStateChanged.class);
                a.assertThat(data.id).isEqualTo(41);
                a.assertThat(data.state).isEqualTo(ServiceUnitMin.State.Unloaded);
            });
        }

        assertThatDbSU(40).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertNoDbSU(41);
        assertThat(container.getServiceAssemblies()).doesNotContain(serviceAssembly2);
    }

    @Test
    public void changeSU1StateNoChange() {
        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/40").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Started);

        SUStateChanged put = resources.getJerseyTest().target("/workspaces/1/serviceunits/40").request()
                .put(Entity.json(new SUChangeState(ServiceUnitMin.State.Started)), SUStateChanged.class);

        assertThat(put.state).isEqualTo(ServiceUnitMin.State.Started);

        assertThatDbSU(40).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSU(41).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSU1StateConflict() {
        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/40").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Started);

        Response put = resources.getJerseyTest().target("/workspaces/1/serviceunits/40").request()
                .put(Entity.json(new SUChangeState(ServiceUnitMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatDbSU(40).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSU(41).value(SERVICEUNITS.STATE.getName()).isEqualTo(ServiceUnitMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }
}
