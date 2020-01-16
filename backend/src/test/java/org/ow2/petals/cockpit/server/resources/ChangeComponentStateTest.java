/**
 * Copyright (C) 2016-2020 Linagora
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

import java.util.Arrays;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.sse.EventInput;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentStateChanged;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class ChangeComponentStateTest extends AbstractBasicResourceTest {

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Component component1 = new Component("comp1", ComponentType.SE, ArtifactState.State.STARTED);

    private final Component component2 = new Component("comp2", ComponentType.BC, ArtifactState.State.STOPPED);

    private final Component component3 = new Component("comp3", ComponentType.BC, ArtifactState.State.STOPPED) {
        @Override
        public void setState(ArtifactState.@Nullable State state) {
            throw new PetalsAdminException(new ArtifactAdministrationException("error"));
        }
    };

    private final ServiceUnit serviceUnit1 = new ServiceUnit("su1", component3.getName());

    private final ServiceAssembly serviceAssembly1 = new ServiceAssembly("sa1", ArtifactState.State.STARTED,
            serviceUnit1);

    public ChangeComponentStateTest() {
        super(ComponentsResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerArtifact(component1, container);
        resource.petals.registerArtifact(component2, container);
        resource.petals.registerArtifact(component3, container);
        resource.petals.registerArtifact(serviceAssembly1, container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
    }

    @Test
    public void changeComp1State() {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(component1)).request().put(
                    Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)), ComponentStateChanged.class);

            assertThat(put.state).isEqualTo(ComponentMin.State.Stopped);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_STATE_CHANGE");
                ComponentStateChanged data = e.readData(ComponentStateChanged.class);
                a.assertThat(data.id).isEqualTo(getId(component1));
                a.assertThat(data.state).isEqualTo(ComponentMin.State.Stopped);
            });
        }

        assertThatComponentState(component1, ArtifactState.State.STOPPED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateForbidden() {
        addUser("anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        Component fComponent = new Component("compf", ComponentType.SE, ArtifactState.State.STARTED);
        fContainer.addComponent(fComponent);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        Response put = resource.target("/workspaces/2/components/" + getId(fComponent)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
        assertThatComponentState(fComponent, ArtifactState.State.STARTED);
    }

    @Test
    public void changeNonExistingCompStateForbidden() {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/components/32342342").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeWrongCompStateForbidden() {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateNotFound() {
        Response put = resource.target("/workspaces/1/components/339879").request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(404);

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp3StateConflictContainerError() {
        Response put = resource.target("/workspaces/1/components/" + getId(component3)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Started)));

        assertThat(put.getStatus()).isEqualTo(409);
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(409);
        assertThat(err.getMessage()).isEqualTo("error");
        assertThat(err.getDetails()).contains(ChangeComponentStateTest.class.getName() + "$1.setState");

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp2StateUnload() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput);

            ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(component2)).request().put(
                    Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)), ComponentStateChanged.class);

            assertThat(put.state).isEqualTo(ComponentMin.State.Unloaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_STATE_CHANGE");
                ComponentStateChanged data = e.readData(ComponentStateChanged.class);
                a.assertThat(data.id).isEqualTo(getId(component2));
                a.assertThat(data.state).isEqualTo(ComponentMin.State.Unloaded);
            });
        }

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertNoDbComponent(component2);
        assertThat(container.getComponents()).doesNotContain(component2);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateNoChange() {
        ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Started)), ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(ComponentMin.State.Started);

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp1StateConflict() {
        Response put = resource.target("/workspaces/1/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeComp3StateConflictUnloaded() {
        Response put = resource.target("/workspaces/1/components/" + getId(component3)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatComponentState(component1, ArtifactState.State.STARTED);
        assertThatComponentState(component2, ArtifactState.State.STOPPED);
        assertThatComponentState(component3, ArtifactState.State.STOPPED);
    }
}
