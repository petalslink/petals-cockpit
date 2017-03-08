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
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;

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
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentStateChanged;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.testing.junit.ResourceTestRule;
import javaslang.Tuple;

public class ChangeComponentStateTest extends AbstractCockpitResourceTest {

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Component component1 = new Component("comp1", ComponentType.SE, ArtifactState.State.STARTED);

    private final Component component2 = new Component("comp2", ComponentType.BC, ArtifactState.State.STOPPED);

    private final Component component3 = new Component("comp3", ComponentType.BC, ArtifactState.State.STOPPED);

    private final ServiceUnit serviceUnit1 = new ServiceUnit("su1", component3.getName());

    private final ServiceAssembly serviceAssembly1 = new ServiceAssembly("sa1", ArtifactState.State.STARTED,
            serviceUnit1);

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ComponentsResource.class, WorkspaceResource.class);

    @Before
    public void setUp() {
        petals.registerDomain(domain);
        petals.registerContainer(container);
        petals.registerArtifact(component1, container);
        petals.registerArtifact(component2, container);
        petals.registerArtifact(component3, container);
        petals.registerArtifact(serviceAssembly1, container);

        setupWorkspace(1, "test",
                Arrays.asList(Tuple.of(10L, domain, "phrase",
                        Arrays.asList(Tuple.of(20L, container,
                                Arrays.asList(Tuple.of(30L, component1, Arrays.asList()),
                                        Tuple.of(31L, component2, Arrays.asList()), Tuple.of(32L, component3,
                                                Arrays.asList(Tuple.of(40L, serviceAssembly1)))))))),
                ADMIN);
    }

    @Test
    public void changeComp1State() {

        ComponentOverview get1 = resources.getJerseyTest().target("/components/30").request()
                .get(ComponentOverview.class);
        assertThat(get1.state).isEqualTo(ComponentMin.State.Started);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            ComponentStateChanged put = resources.getJerseyTest().target("/workspaces/1/components/30").request()
                    .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)), ComponentStateChanged.class);

            assertThat(put.state).isEqualTo(ComponentMin.State.Stopped);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_STATE_CHANGE");
                ComponentStateChanged data = e.readData(ComponentStateChanged.class);
                a.assertThat(data.id).isEqualTo(30);
                a.assertThat(data.state).isEqualTo(ComponentMin.State.Stopped);
            });
        }

        assertThatDbComp(30).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(31).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(32).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateForbidden() {

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2",
                Arrays.asList(Tuple.of(11L, domain, "phrase",
                        Arrays.asList(
                                Tuple.of(21L, container, Arrays.asList(Tuple.of(33L, component1, Arrays.asList())))))),
                "anotheruser");

        Response put = resources.getJerseyTest().target("/workspaces/2/components/33").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbComp(30).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(31).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(32).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(33).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Started.name());
    }

    @Test
    public void changeComp1StateNotFound() {

        Response put = resources.getJerseyTest().target("/workspaces/1/components/33").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(404);

        assertThatDbComp(30).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(31).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(32).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp2StateUnload() {

        ComponentOverview get1 = resources.getJerseyTest().target("/components/31").request()
                .get(ComponentOverview.class);
        assertThat(get1.state).isEqualTo(ComponentMin.State.Stopped);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            ComponentStateChanged put = resources.getJerseyTest().target("/workspaces/1/components/31").request()
                    .put(Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)), ComponentStateChanged.class);

            assertThat(put.state).isEqualTo(ComponentMin.State.Unloaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_STATE_CHANGE");
                ComponentStateChanged data = e.readData(ComponentStateChanged.class);
                a.assertThat(data.id).isEqualTo(31);
                a.assertThat(data.state).isEqualTo(ComponentMin.State.Unloaded);
            });
        }

        assertThatDbComp(30).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertNoDbComp(31);
        assertThat(container.getComponents()).doesNotContain(component2);
        assertThatDbComp(32).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateNoChange() {
        ComponentOverview get1 = resources.getJerseyTest().target("/components/30").request()
                .get(ComponentOverview.class);
        assertThat(get1.state).isEqualTo(ComponentMin.State.Started);

        ComponentStateChanged put = resources.getJerseyTest().target("/workspaces/1/components/30").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Started)), ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(ComponentMin.State.Started);

        assertThatDbComp(30).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(31).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(32).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateConflict() {
        ComponentOverview get1 = resources.getJerseyTest().target("/components/30").request()
                .get(ComponentOverview.class);
        assertThat(get1.state).isEqualTo(ComponentMin.State.Started);

        Response put = resources.getJerseyTest().target("/workspaces/1/components/30").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatDbComp(30).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(31).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(32).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp3StateConflictUnloaded() {
        ComponentOverview get1 = resources.getJerseyTest().target("/components/32").request()
                .get(ComponentOverview.class);
        assertThat(get1.state).isEqualTo(ComponentMin.State.Stopped);

        Response put = resources.getJerseyTest().target("/workspaces/1/components/32").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatDbComp(30).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(31).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(32).value(COMPONENTS.STATE.getName()).isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }
}
