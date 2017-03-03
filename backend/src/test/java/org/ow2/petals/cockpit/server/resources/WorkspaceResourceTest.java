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
import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.BusFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.ComponentFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.ContainerFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;

import io.dropwizard.testing.junit.ResourceTestRule;

public class WorkspaceResourceTest extends AbstractDefaultWorkspaceResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(WorkspaceResource.class);

    @Test
    public void getNonExistingWorkspaceNotFoundEvent() {
        Response get = resources.getJerseyTest().target("/workspaces/3").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getWorkspaceForbiddenEvent() {
        Response get = resources.getJerseyTest().target("/workspaces/2").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingWorkspace() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        WorkspaceFullContent content = resources.getJerseyTest().target("/workspaces/1").request()
                .get(WorkspaceFullContent.class);
        
        assertContent(content);

        // with a normal GET, we don't record it as the last workspace of the user
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();
    }

    @Test
    public void getExistingWorkspaceEvent() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {
            expectWorkspaceContent(eventInput, (t, a) -> assertContent(t));
        }

        // ensure that calling get workspace tree set the last workspace in the db
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isEqualTo(1);
    }

    private void assertContent(WorkspaceFullContent content) {
        assertThat(content.workspace.id).isEqualTo(1);
        assertThat(content.workspace.name).isEqualTo("test");

        assertThat(content.content.buses).hasSize(1);
        assertThat(content.content.containers).hasSize(3);
        assertThat(content.content.components).hasSize(1);
        assertThat(content.content.serviceUnits).hasSize(1);

        BusFull b = content.content.buses.values().iterator().next();
        assert b != null;

        assertThat(b.bus.id).isEqualTo(10);
        assertThat(b.bus.name).isEqualTo(domain.getName());
        assertThat(b.containers).hasSize(3);

        ContainerFull c1 = content.content.containers.get("20");
        assert c1 != null;

        assertThat(c1.container.id).isEqualTo(20);
        assertThat(c1.container.name).isEqualTo(container1.getContainerName());
        assertThat(c1.components).hasSize(1);

        ContainerFull c2 = content.content.containers.get("21");
        assert c2 != null;

        assertThat(c2.container.id).isEqualTo(21);
        assertThat(c2.container.name).isEqualTo(container2.getContainerName());
        assertThat(c2.components).hasSize(0);

        ContainerFull c3 = content.content.containers.get("22");
        assert c3 != null;

        assertThat(c3.container.id).isEqualTo(22);
        assertThat(c3.container.name).isEqualTo(container3.getContainerName());
        assertThat(c3.components).hasSize(0);

        ComponentFull comp = content.content.components.get("30");
        assert comp != null;

        assertThat(comp.component.id).isEqualTo(30);
        assertThat(comp.component.name).isEqualTo(component.getName());
        assertThat(comp.component.state.toString()).isEqualTo(component.getState().toString());
        assertThat(comp.serviceUnits).hasSize(1);

        ServiceUnitMin su = content.content.serviceUnits.get("40");
        assert su != null;

        assertThat(su.id).isEqualTo(40);
        assertThat(su.name).isEqualTo(serviceUnit.getName());
        assertThat(su.state.toString()).isEqualTo(serviceAssembly.getState().toString());
        assertThat(su.saName).isEqualTo(serviceAssembly.getName());
    }
}
