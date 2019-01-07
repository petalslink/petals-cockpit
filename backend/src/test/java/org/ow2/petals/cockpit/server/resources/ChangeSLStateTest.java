/**
 * Copyright (C) 2016-2019 Linagora
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

import org.glassfish.jersey.media.sse.EventInput;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SLChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SLStateChanged;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class ChangeSLStateTest extends AbstractBasicResourceTest {

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final SharedLibrary sl1 = new SharedLibrary("sl1", "1.0.0");

    private final SharedLibrary sl2 = new SharedLibrary("sl2", "1.0.0");

    private final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED,
            ImmutableSet.of(sl2));

    public ChangeSLStateTest() {
        super(ServiceAssembliesResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerArtifact(sl1, container);
        resource.petals.registerArtifact(sl2, container);
        resource.petals.registerArtifact(component, container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
    }

    @Test
    public void changeSL1StateUnload() {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            SLStateChanged put = resource.target("/workspaces/1/sharedlibraries/" + getId(sl1)).request()
                    .put(Entity.json(new SLChangeState(SharedLibraryMin.State.Unloaded)), SLStateChanged.class);

            assertThat(put.state).isEqualTo(SharedLibraryMin.State.Unloaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SL_STATE_CHANGE");
                SLStateChanged data = e.readData(SLStateChanged.class);
                a.assertThat(data.id).isEqualTo(getId(sl1));
                a.assertThat(data.state).isEqualTo(SharedLibraryMin.State.Unloaded);
            });
        }

        assertNoDbSL(sl1);
        assertThatDbSL(sl2);
        assertThat(container.getSharedLibraries()).doesNotContain(sl1);
    }

    @Test
    public void changeSLStateForbidden() {
        addUser("anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        SharedLibrary fSL = new SharedLibrary("slf", "1.0.0");
        fContainer.addSharedLibrary(fSL);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        Response put = resource.target("/workspaces/2/sharedlibraries/" + getId(fSL)).request()
                .put(Entity.json(new SLChangeState(SharedLibraryMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbSL(sl1);
        assertThatDbSL(sl2);
        assertThatDbSL(fSL);
    }

    @Test
    public void changeNonExistingSLStateForbidden() {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/sharedlibraries/583830").request()
                .put(Entity.json(new SLChangeState(SharedLibraryMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbSL(sl1);
        assertThatDbSL(sl2);
    }

    @Test
    public void changeWrongSL1StateForbidden() {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Response put = resource.target("/workspaces/2/sharedlibraries/" + getId(sl1)).request()
                .put(Entity.json(new SLChangeState(SharedLibraryMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(403);

        assertThatDbSL(sl1);
        assertThatDbSL(sl2);
    }

    @Test
    public void changeSLStateNotFound() {
        Response put = resource.target("/workspaces/1/sharedlibraries/429879").request()
                .put(Entity.json(new SLChangeState(SharedLibraryMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(404);

        assertThatDbSL(sl1);
        assertThatDbSL(sl2);
    }

    @Test
    public void changeSL1StateNoChange() {
        SLStateChanged put = resource.target("/workspaces/1/sharedlibraries/" + getId(sl1)).request()
                .put(Entity.json(new SLChangeState(SharedLibraryMin.State.Loaded)), SLStateChanged.class);

        assertThat(put.state).isEqualTo(SharedLibraryMin.State.Loaded);

        assertThatDbSL(sl1);
        assertThatDbSL(sl2);
    }

    @Test
    public void changeSL2StateConflictComponentError() {
        Response put = resource.target("/workspaces/1/sharedlibraries/" + getId(sl2)).request()
                .put(Entity.json(new SLChangeState(SharedLibraryMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("Component comp still using this SL");

        assertThatDbSL(sl1);
        assertThatDbSL(sl2);
    }
}
