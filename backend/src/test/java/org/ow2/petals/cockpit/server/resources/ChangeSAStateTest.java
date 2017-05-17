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
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;

import java.util.Arrays;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Before;
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
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAStateChanged;

import com.google.common.collect.ImmutableMap;

import javaslang.Tuple;

public class ChangeSAStateTest extends AbstractCockpitResourceTest {

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
        try (EventInput eventInput = resource.target("/workspaces/1/content")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

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

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbSA(getId(serviceAssembly2)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA1StateForbidden() {
        resource.db().executeInsert(new UsersRecord("anotheruser", "...", "...", null));

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

        Response put = resource.target("/workspaces/2/serviceassemblies/42").request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSA(getId(serviceAssembly2)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
        assertThatDbSA(getId(fServiceAssembly)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
    }

    @Test
    public void changeNonExistingSAStateForbidden() {

        resource.db().executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/serviceassemblies/583830").request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSA(getId(serviceAssembly2)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeWrongSAStateForbidden() {
        resource.db().executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/serviceassemblies/" + getId(serviceAssembly1)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSA(getId(serviceAssembly2)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA1StateNotFound() {
        Response put = resource.target("/workspaces/1/serviceassemblies/429879").request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(404);

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSA(getId(serviceAssembly2)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
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

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertNoDbSA(getId(serviceAssembly2));
        assertNoDbSU(getId(serviceUnit2));
        assertThat(container.getServiceAssemblies()).doesNotContain(serviceAssembly2);
    }

    @Test
    public void changeSA1StateNoChange() {
        SAStateChanged put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly1)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Started)), SAStateChanged.class);

        assertThat(put.state).isEqualTo(ServiceAssemblyMin.State.Started);

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSA(getId(serviceAssembly2)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }

    @Test
    public void changeSA1StateConflict() {
        Response put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly1)).request()
                .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        assertThatDbSA(getId(serviceAssembly1)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Started.name());
        assertThat(serviceAssembly1.getState()).isEqualTo(ArtifactState.State.STARTED);
        assertThatDbSA(getId(serviceAssembly2)).value(SERVICEASSEMBLIES.STATE.getName())
                .isEqualTo(ServiceAssemblyMin.State.Stopped.name());
        assertThat(serviceAssembly2.getState()).isEqualTo(ArtifactState.State.STOPPED);
    }
}
