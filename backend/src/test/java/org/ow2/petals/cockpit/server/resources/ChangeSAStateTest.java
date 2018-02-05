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
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAStateChanged;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class ChangeSAStateTest extends AbstractBasicResourceTest {

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
            serviceUnit2) {
        @Override
        public void setState(ArtifactState.@Nullable State state) {
            throw new PetalsAdminException(new ArtifactAdministrationException("error"));
        }
    };

    public ChangeSAStateTest() {
        super(ServiceAssembliesResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerArtifact(component, container);
        resource.petals.registerArtifact(serviceAssembly1, container);
        resource.petals.registerArtifact(serviceAssembly2, container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
    }

    @Test
    public void changeSA1State() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput);

            SAStateChanged put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly1)).request()
                    .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)), SAStateChanged.class);

            assertThat(put.state).isEqualTo(ServiceAssemblyMin.State.Stopped);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SA_STATE_CHANGE");
                SAStateChanged data = e.readData(SAStateChanged.class);
                a.assertThat(data.id).isEqualTo(getId(serviceAssembly1));
                a.assertThat(data.state).isEqualTo(ServiceAssemblyMin.State.Stopped);
            });
        }

        assertThatSAState(serviceAssembly1, ArtifactState.State.STOPPED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA1StateForbidden() {
        addUser("anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        Component fComponent = new Component("compf", ComponentType.SE, ArtifactState.State.STARTED);
        fContainer.addComponent(fComponent);
        ServiceAssembly fServiceAssembly = new ServiceAssembly("saf", ArtifactState.State.STARTED,
                new ServiceUnit("suf", fComponent.getName()));
        fContainer.addServiceAssembly(fServiceAssembly);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        Response put = resource.target("/workspaces/2/serviceassemblies/" + getId(fServiceAssembly)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
        assertThatSAState(fServiceAssembly, ArtifactState.State.STARTED);
    }

    @Test
    public void changeNonExistingSAStateForbidden() {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/serviceassemblies/583830").request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeWrongSAStateForbidden() {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/serviceassemblies/" + getId(serviceAssembly1)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA1StateNotFound() {
        Response put = resource.target("/workspaces/1/serviceassemblies/429879").request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(404);

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA2StateUnload() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput);

            SAStateChanged put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly2)).request()
                    .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Unloaded)), SAStateChanged.class);

            assertThat(put.state).isEqualTo(ServiceAssemblyMin.State.Unloaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SA_STATE_CHANGE");
                SAStateChanged data = e.readData(SAStateChanged.class);
                a.assertThat(data.id).isEqualTo(getId(serviceAssembly2));
                a.assertThat(data.state).isEqualTo(ServiceAssemblyMin.State.Unloaded);
            });
        }

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertNoDbSA(serviceAssembly2);
        assertNoDbSU(serviceUnit2);
        assertThat(container.getServiceAssemblies()).doesNotContain(serviceAssembly2);
    }

    @Test
    public void changeSA1StateNoChange() {
        SAStateChanged put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly1)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Started)), SAStateChanged.class);

        assertThat(put.state).isEqualTo(ServiceAssemblyMin.State.Started);

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA1StateConflict() {
        Response put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly1)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA2StateConflictContainerError() {
        Response put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly2)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Started)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("error");
        assertThat(err.getDetails()).contains(ChangeSAStateTest.class.getName() + "$1.setState");

        assertThatSAState(serviceAssembly1, ArtifactState.State.STARTED);
        assertThatSAState(serviceAssembly2, ArtifactState.State.STOPPED);
    }
}
