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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.mocks.MockProfileParamValueFactoryProvider;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ComponentTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.SUTree;

import io.dropwizard.testing.junit.ResourceTestRule;

public class WorkspaceResourceTest extends AbstractReadOnlyResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(WorkspaceResource.class);

    @Test
    public void getNonExistingWorkspaceNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/3").request(MediaType.APPLICATION_JSON_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getNonExistingWorkspaceNotFoundEvent() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/3").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getWorkspaceForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2").request(MediaType.APPLICATION_JSON_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getWorkspaceForbiddenEvent() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingWorkspace() {
        // TODO check assumptions
        WorkspaceTree tree = resources.getJerseyTest().target("/workspaces/1").request(MediaType.APPLICATION_JSON_TYPE)
                .get(WorkspaceTree.class);

        assertTree(tree);

        // ensure that calling get workspace tree set the last workspace in the db
        verify(users).saveLastWorkspace(MockProfileParamValueFactoryProvider.ADMIN, 1);
    }

    @Test
    public void getExistingWorkspaceEvent() {

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1").request()
                .get(EventInput.class)) {
            expectWorkspaceTree(eventInput, (t, a) -> assertTree(t));
        }

        // ensure that calling get workspace tree set the last workspace in the db
        verify(users).saveLastWorkspace(MockProfileParamValueFactoryProvider.ADMIN, 1);
    }

    private void assertTree(WorkspaceTree tree) {
        assertThat(tree.id).isEqualTo(1);
        assertThat(tree.name).isEqualTo("test");
        assertThat(tree.buses).hasSize(1);
        BusTree b = tree.buses.get(0);
        assert b != null;
        assertThat(b.id).isEqualTo(10);
        assertThat(b.name).isEqualTo(domain.getName());
        assertThat(b.containers).hasSize(3);

        ContainerTree c1 = b.containers.get(0);
        assert c1 != null;
        assertThat(c1.id).isEqualTo(20);
        assertThat(c1.name).isEqualTo(container1.getContainerName());
        assertThat(c1.components).hasSize(1);

        ContainerTree c2 = b.containers.get(1);
        assert c2 != null;
        assertThat(c2.id).isEqualTo(21);
        assertThat(c2.name).isEqualTo(container2.getContainerName());
        assertThat(c2.components).hasSize(0);

        ContainerTree c3 = b.containers.get(2);
        assert c3 != null;
        assertThat(c3.id).isEqualTo(22);
        assertThat(c3.name).isEqualTo(container3.getContainerName());
        assertThat(c3.components).hasSize(0);

        ComponentTree comp = c1.components.get(0);
        assert comp != null;
        assertThat(comp.id).isEqualTo(30);
        assertThat(comp.name).isEqualTo(component.getName());
        assertThat(comp.state.toString()).isEqualTo(component.getState().toString());
        assertThat(comp.serviceUnits).hasSize(1);

        SUTree su = comp.serviceUnits.get(0);
        assert su != null;
        assertThat(su.id).isEqualTo(40);
        assertThat(su.name).isEqualTo(serviceUnit.getName());
        assertThat(su.state.toString()).isEqualTo(serviceAssembly.getState().toString());
        assertThat(su.saName).isEqualTo(serviceAssembly.getName());
    }
}
