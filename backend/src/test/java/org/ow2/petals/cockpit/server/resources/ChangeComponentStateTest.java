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

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
    }

    @Test
    public void changeComp1State() {
        try (EventInput eventInput = resources.target("/workspaces/1/content")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            ComponentStateChanged put = resources.target("/workspaces/1/components/" + getId(component1)).request().put(
                    Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)), ComponentStateChanged.class);

            assertThat(put.state).isEqualTo(ComponentMin.State.Stopped);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_STATE_CHANGE");
                ComponentStateChanged data = e.readData(ComponentStateChanged.class);
                a.assertThat(data.id).isEqualTo(getId(component1));
                a.assertThat(data.state).isEqualTo(ComponentMin.State.Stopped);
            });
        }

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateForbidden() {

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        Component fComponent = new Component("compf", ComponentType.SE, ArtifactState.State.STARTED);
        fContainer.addComponent(fComponent);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        Response put = resources.target("/workspaces/2/components/" + getId(fComponent)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(fComponent)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
    }

    @Test
    public void changeNonExistingCompStateForbidden() {

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resources.target("/workspaces/2/components/32342342").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeWrongCompStateForbidden() {

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resources.target("/workspaces/2/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateNotFound() {

        Response put = resources.target("/workspaces/1/components/339879").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(404);

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp2StateUnload() {
        try (EventInput eventInput = resources.target("/workspaces/1/content")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            ComponentStateChanged put = resources.target("/workspaces/1/components/" + getId(component2)).request().put(
                    Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)), ComponentStateChanged.class);

            assertThat(put.state).isEqualTo(ComponentMin.State.Unloaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_STATE_CHANGE");
                ComponentStateChanged data = e.readData(ComponentStateChanged.class);
                a.assertThat(data.id).isEqualTo(getId(component2));
                a.assertThat(data.state).isEqualTo(ComponentMin.State.Unloaded);
            });
        }

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertNoDbComp(getId(component2));
        assertThat(container.getComponents()).doesNotContain(component2);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateNoChange() {
        ComponentStateChanged put = resources.target("/workspaces/1/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Started)), ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(ComponentMin.State.Started);

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateConflict() {
        Response put = resources.target("/workspaces/1/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp3StateConflictUnloaded() {
        Response put = resources.target("/workspaces/1/components/" + getId(component3)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatDbComp(getId(component1)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Started.name());
        assertThat(component1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbComp(getId(component2)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbComp(getId(component3)).value(COMPONENTS.STATE.getName())
                .isEqualTo(ComponentMin.State.Stopped.name());
        assertThat(component3.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }
}
