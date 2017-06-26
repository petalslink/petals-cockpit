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

import org.assertj.core.api.SoftAssertions;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Test;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.UsersResource.UserMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceOverviewContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceUpdate;

public class WorkspaceResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public WorkspaceResourceTest() {
        super(WorkspaceResource.class);
    }

    @Test
    public void deleteWorkspaceNonExistingWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/3").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);
    }

    @Test
    public void deleteWorkspaceWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/2").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);

        // it wasn't deleted
        assertThat(requestWorkspace(2)).hasNumberOfRows(1);
    }

    @Test
    public void deleteWorkspace() {
        assertThat(table(WORKSPACES)).hasNumberOfRows(2);

        WorkspaceDeleted delete = resource.target("/workspaces/1").request().delete(WorkspaceDeleted.class);

        assertThat(delete.id).isEqualTo(1);

        // only the second workspace is still present
        assertThat(table(WORKSPACES)).hasNumberOfRows(1);

        assertThat(requestWorkspace(1)).hasNumberOfRows(0);
        assertThat(requestWorkspace(2)).hasNumberOfRows(1);

        assertThat(requestBus(domain)).hasNumberOfRows(0);
        assertThat(requestBus(fDomain)).hasNumberOfRows(1);

        assertThat(requestContainer(container1)).hasNumberOfRows(0);
        assertThat(requestContainer(container2)).hasNumberOfRows(0);
        assertThat(requestContainer(container3)).hasNumberOfRows(0);
        assertThat(requestContainer(fContainer)).hasNumberOfRows(1);

        assertThat(requestComponent(component)).hasNumberOfRows(0);
        assertThat(requestComponent(fComponent)).hasNumberOfRows(1);

        assertThat(requestSA(serviceAssembly)).hasNumberOfRows(0);
        assertThat(requestSA(fServiceAssembly)).hasNumberOfRows(1);

        assertThat(requestSU(serviceUnit)).hasNumberOfRows(0);
        assertThat(requestSU(fServiceUnit)).hasNumberOfRows(1);
    }

    @Test
    public void getEventNonExistingWorkspaceForbidden() {
        Response get = resource.target("/workspaces/3/content").request(SseFeature.SERVER_SENT_EVENTS_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getEventWorkspaceForbidden() {
        Response get = resource.target("/workspaces/2/content").request(SseFeature.SERVER_SENT_EVENTS_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingWorkspace() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        WorkspaceFullContent content = resource.target("/workspaces/1/content").request()
                .get(WorkspaceFullContent.class);

        SoftAssertions a = new SoftAssertions();
        assertContent(a, content, domain);
        a.assertAll();

        // with a normal GET, we don't record it as the last workspace of the user
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();
    }

    @Test
    public void getEventExistingWorkspace() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput, (t, a) -> assertContent(a, t, domain));
        }

        // ensure that calling get workspace tree set the last workspace in the db
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isEqualTo(1);
    }

    public void getOverviewNonExistingWorkspaceForbidden() {
        Response get = resource.target("/workspaces/3").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    public void getOverviewWorkspaceForbidden() {
        Response get = resource.target("/workspaces/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    public void getOverviewWorkspace() {
        WorkspaceOverviewContent get = resource.target("/workspaces/1").request().get(WorkspaceOverviewContent.class);

        assertContentOverview(get.workspace);

        assertUsers(get.users);
    }

    public void setDescriptionNonExistingWorkspaceForbidden() {
        Response put = resource.target("/workspaces/3").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")));

        assertThat(put.getStatus()).isEqualTo(403);
    }

    public void setDescriptionWorkspaceForbidden() {
        Response put = resource.target("/workspaces/2").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")));

        assertThat(put.getStatus()).isEqualTo(403);

        // it wasn't changed!
        assertThat(requestWorkspace(2)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");
    }

    public void setDescription() {
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");

        WorkspaceOverviewContent put = resource.target("/workspaces/1").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")), WorkspaceOverviewContent.class);

        assertThat(put.workspace.id).isEqualTo(1);
        assertThat(put.workspace.name).isEqualTo("test");
        assertThat(put.workspace.users).containsExactlyInAnyOrder(ADMIN);
        assertThat(put.workspace.description).isEqualTo("description");

        assertUsers(put.users);

        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("description");
    }

    private void assertContent(SoftAssertions a, WorkspaceFullContent content, Domain... buses) {
        assertContentOverview(content.workspace);
        assertUsers(content.users);

        assertWorkspaceContent(a, content.content, content.workspace.id, buses);
    }

    private void assertUsers(Map<String, UserMin> users) {
        assertThat(users).hasSize(1);

        UserMin u = users.values().iterator().next();
        assert u != null;

        assertThat(u.id).isEqualTo(ADMIN);
        assertThat(u.name).isEqualTo("admin");
    }

    private void assertContentOverview(WorkspaceOverview overview) {
        assertThat(overview.id).isEqualTo(1);
        assertThat(overview.name).isEqualTo("test");
        assertThat(overview.users).containsExactlyInAnyOrder(ADMIN);
        assertThat(overview.description).isEqualTo("");
    }
}
