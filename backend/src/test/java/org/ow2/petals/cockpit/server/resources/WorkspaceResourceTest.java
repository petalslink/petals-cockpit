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
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.Map;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.UserSession.UserMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.BusFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.ComponentFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.ContainerFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceOverviewContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceUpdate;

import io.dropwizard.testing.junit.ResourceTestRule;

public class WorkspaceResourceTest extends AbstractDefaultWorkspaceResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(WorkspaceResource.class);

    @Test
    public void deleteWorkspaceNonExistingWorkspaceForbidden() {
        Response delete = resources.target("/workspaces/3").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);
    }

    @Test
    public void deleteWorkspaceWorkspaceForbidden() {
        Response delete = resources.target("/workspaces/2").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);

        // it wasn't deleted
        assertThat(requestWorkspace(2)).hasNumberOfRows(1);
    }

    @Test
    public void deleteWorkspace() {
        assertThat(table(WORKSPACES)).hasNumberOfRows(2);

        WorkspaceDeleted delete = resources.target("/workspaces/1").request().delete(WorkspaceDeleted.class);

        assertThat(delete.id).isEqualTo(1);

        // only the second workspace is still present
        assertThat(table(WORKSPACES)).hasNumberOfRows(1);

        assertThat(requestWorkspace(1)).hasNumberOfRows(0);
        assertThat(requestWorkspace(2)).hasNumberOfRows(1);

        assertThat(requestBus(10)).hasNumberOfRows(0);
        assertThat(requestBus(2)).hasNumberOfRows(1);

        assertThat(requestContainer(20)).hasNumberOfRows(0);
        assertThat(requestContainer(21)).hasNumberOfRows(0);
        assertThat(requestContainer(22)).hasNumberOfRows(0);
        assertThat(requestContainer(2)).hasNumberOfRows(1);

        assertThat(requestComponent(30)).hasNumberOfRows(0);
        assertThat(requestComponent(2)).hasNumberOfRows(1);

        assertThat(requestSU(40)).hasNumberOfRows(0);
        assertThat(requestSU(2)).hasNumberOfRows(1);
    }

    @Test
    public void getEventNonExistingWorkspaceForbidden() {
        Response get = resources.target("/workspaces/3/content").request(SseFeature.SERVER_SENT_EVENTS_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getEventWorkspaceForbidden() {
        Response get = resources.target("/workspaces/2/content").request(SseFeature.SERVER_SENT_EVENTS_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingWorkspace() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        WorkspaceFullContent content = resources.target("/workspaces/1/content").request()
                .get(WorkspaceFullContent.class);

        assertContent(content);

        // with a normal GET, we don't record it as the last workspace of the user
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();
    }

    @Test
    public void getEventExistingWorkspace() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        try (EventInput eventInput = resources.target("/workspaces/1/content")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {
            expectWorkspaceContent(eventInput, (t, a) -> assertContent(t));
        }

        // ensure that calling get workspace tree set the last workspace in the db
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isEqualTo(1);
    }

    public void getOverviewNonExistingWorkspaceForbidden() {
        Response get = resources.target("/workspaces/3").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    public void getOverviewWorkspaceForbidden() {
        Response get = resources.target("/workspaces/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    public void getOverviewWorkspace() {
        WorkspaceOverviewContent get = resources.target("/workspaces/1").request().get(WorkspaceOverviewContent.class);

        assertOverview(get.workspace);

        assertUsers(get.users);
    }

    public void setDescriptionNonExistingWorkspaceForbidden() {
        Response put = resources.target("/workspaces/3").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")));

        assertThat(put.getStatus()).isEqualTo(403);
    }

    public void setDescriptionWorkspaceForbidden() {
        Response put = resources.target("/workspaces/2").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")));

        assertThat(put.getStatus()).isEqualTo(403);

        // it wasn't changed!
        assertThat(requestWorkspace(2)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");
    }

    public void setDescription() {
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");

        WorkspaceOverviewContent put = resources.target("/workspaces/1").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")), WorkspaceOverviewContent.class);
        
        assertThat(put.workspace.id).isEqualTo(1);
        assertThat(put.workspace.name).isEqualTo("test");
        assertThat(put.workspace.users).containsExactlyInAnyOrder(ADMIN);
        assertThat(put.workspace.description).isEqualTo("description");

        assertUsers(put.users);

        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("description");
    }

    private void assertUsers(Map<String, UserMin> users) {
        assertThat(users).hasSize(1);

        UserMin u = users.values().iterator().next();
        assert u != null;

        assertThat(u.id).isEqualTo(ADMIN);
        assertThat(u.name).isEqualTo("Administrator");
    }

    private void assertOverview(WorkspaceOverview overview) {
        assertThat(overview.id).isEqualTo(1);
        assertThat(overview.name).isEqualTo("test");
        assertThat(overview.users).containsExactlyInAnyOrder(ADMIN);
        assertThat(overview.description).isEqualTo("");
    }

    private void assertContent(WorkspaceFullContent content) {
        assertOverview(content.workspace);

        assertThat(content.content.buses).hasSize(1);
        assertThat(content.content.containers).hasSize(3);
        assertThat(content.content.components).hasSize(1);
        assertThat(content.content.serviceUnits).hasSize(1);

        assertUsers(content.users);

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
