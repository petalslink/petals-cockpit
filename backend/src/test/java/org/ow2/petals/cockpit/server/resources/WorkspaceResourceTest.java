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
import static org.mockito.Mockito.verify;

import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.mocks.MockProfileParamValueFactoryProvider;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.BusFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.ComponentFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.ContainerFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;

import io.dropwizard.testing.junit.ResourceTestRule;

public class WorkspaceResourceTest extends AbstractReadOnlyResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(WorkspaceResource.class);

    @Test
    public void getNonExistingWorkspaceNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/3").request().get();

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
        Response get = resources.getJerseyTest().target("/workspaces/2").request().get();

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
        WorkspaceFullContent tree = resources.getJerseyTest().target("/workspaces/1").request()
                .get(WorkspaceFullContent.class);

        assertContent(tree);

        // ensure that calling get workspace tree set the last workspace in the db
        verify(users).saveLastWorkspace(MockProfileParamValueFactoryProvider.ADMIN, 1);
    }

    @Test
    public void getExistingWorkspaceEvent() {

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {
            expectWorkspaceContent(eventInput, (t, a) -> assertContent(t));
        }

        // ensure that calling get workspace tree set the last workspace in the db
        verify(users).saveLastWorkspace(MockProfileParamValueFactoryProvider.ADMIN, 1);
    }

    private void assertContent(WorkspaceFullContent content) {
        assertThat(content.workspace.id).isEqualTo(1);
        assertThat(content.workspace.name).isEqualTo("test");

        assertThat(content.content.buses.map).hasSize(1);
        assertThat(content.content.containers.map).hasSize(3);
        assertThat(content.content.components.map).hasSize(1);
        assertThat(content.content.serviceUnits.map).hasSize(1);

        BusFull b = content.content.buses.map.values().iterator().next();
        assert b != null;

        assertThat(b.bus.id).isEqualTo(10);
        assertThat(b.bus.name).isEqualTo(domain.getName());
        assertThat(b.containers).hasSize(3);

        ContainerFull c1 = content.content.containers.map.get("20");
        assert c1 != null;

        assertThat(c1.container.id).isEqualTo(20);
        assertThat(c1.container.name).isEqualTo(container1.getContainerName());
        assertThat(c1.components).hasSize(1);

        ContainerFull c2 = content.content.containers.map.get("21");
        assert c2 != null;

        assertThat(c2.container.id).isEqualTo(21);
        assertThat(c2.container.name).isEqualTo(container2.getContainerName());
        assertThat(c2.components).hasSize(0);

        ContainerFull c3 = content.content.containers.map.get("22");
        assert c3 != null;

        assertThat(c3.container.id).isEqualTo(22);
        assertThat(c3.container.name).isEqualTo(container3.getContainerName());
        assertThat(c3.components).hasSize(0);

        ComponentFull comp = content.content.components.map.get("30");
        assert comp != null;

        assertThat(comp.component.id).isEqualTo(30);
        assertThat(comp.component.name).isEqualTo(component.getName());
        assertThat(comp.component.state.toString()).isEqualTo(component.getState().toString());
        assertThat(comp.serviceUnits).hasSize(1);

        ServiceUnitMin su = content.content.serviceUnits.map.get("40");
        assert su != null;

        assertThat(su.id).isEqualTo(40);
        assertThat(su.name).isEqualTo(serviceUnit.getName());
        assertThat(su.state.toString()).isEqualTo(serviceAssembly.getState().toString());
        assertThat(su.saName).isEqualTo(serviceAssembly.getName());
    }
}
