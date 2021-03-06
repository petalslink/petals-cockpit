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
import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.ArrayList;
import java.util.Map;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.apache.commons.lang3.RandomStringUtils;
import org.assertj.core.api.SoftAssertions;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Test;
import org.ow2.petals.admin.endpoint.Endpoint;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.UsersResource.UserMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.AddUser;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceOverviewContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceUpdate;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceUser;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.WorkspaceMin;

import com.google.common.collect.ImmutableList;

@SuppressWarnings("null")
public class WorkspaceResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public WorkspaceResourceTest() {
        super(WorkspaceResource.class);
    }

    @Test
    public void deleteNonExistingWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/3").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);
    }

    @Test
    public void deleteExistingWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/2").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);

        // it wasn't deleted
        assertThat(requestWorkspace(2)).hasNumberOfRows(1);
    }

    @Test
    public void deleteExistingWorkspace() {
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
    public void getEventExistingWorkspaceForbidden() {
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

    @Test
    public void getOverviewNonExistingWorkspaceForbidden() {
        Response get = resource.target("/workspaces/3").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getOverviewExistingWorkspaceForbidden() {
        Response get = resource.target("/workspaces/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getOverviewExistingWorkspace() {
        WorkspaceOverviewContent get = resource.target("/workspaces/1").request().get(WorkspaceOverviewContent.class);

        assertWorkspaceOverviewContent(get);
    }

    @Test
    public void setDescriptionNonExistingWorkspaceForbidden() {
        Response put = resource.target("/workspaces/3").request()
                .put(Entity.json(new WorkspaceUpdate(null, "shortDescription", "description")));

        assertThat(put.getStatus()).isEqualTo(403);
    }

    @Test
    public void setDescriptionExistingWorkspaceForbidden() {
        Response put = resource.target("/workspaces/2").request()
                .put(Entity.json(new WorkspaceUpdate(null, "shortDescription", "description")));

        assertThat(put.getStatus()).isEqualTo(403);

        // it wasn't changed!
        assertThat(requestWorkspace(2)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");
    }

    @Test
    public void setShortDescriptionAndDescription() {
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");

        WorkspaceOverviewContent put = resource.target("/workspaces/1").request().put(
                Entity.json(new WorkspaceUpdate(null, "shortDescription", "description")),
                WorkspaceOverviewContent.class);

        assertWorkspaceOverviewContent(put, "shortDescription", "description");
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.SHORT_DESCRIPTION.getName())
                .isEqualTo("shortDescription");
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("description");
    }

    @Test
    public void setTooLongShortDescription() {
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.SHORT_DESCRIPTION.getName()).isEqualTo("");

        Response put = resource.target("/workspaces/1").request()
                .put(Entity.json(new WorkspaceUpdate(null,
                        RandomStringUtils.random(WorkspacesResource.SHORT_DESCRIPTION_MAX_LENGTH + 1),
                        "newDescription")));
        assertThat(put.getStatus()).isEqualTo(422);

        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.SHORT_DESCRIPTION.getName()).isEqualTo("");
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");
    }

    @Test
    public void addUserToExistingWorkspace() {
        addUser("user1");

        Response add = resource.target("/workspaces/1/users").request().post(Entity.json(new AddUser("user1")));
        assertThat(add.getStatus()).isEqualTo(200);

        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 1L)).hasNumberOfRows(2)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("admin").value().isEqualTo("user1");

        // adding an already added user should not work
        Response add2 = resource.target("/workspaces/1/users").request().post(Entity.json(new AddUser("user1")));
        assertThat(add2.getStatus()).isEqualTo(409);

        // non-existing user
        Response add3 = resource.target("/workspaces/1/users").request().post(Entity.json(new AddUser("user2")));
        assertThat(add3.getStatus()).isEqualTo(409);

        // the other workspace wasn't touched
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 2L)).hasNumberOfRows(4)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("anotheruser");
    }

    @Test
    public void addUserToExistingWorkspaceForbidden() {
        addUser("user1");

        Response add = resource.target("/workspaces/2/users").request().post(Entity.json(new AddUser("user1")));
        assertThat(add.getStatus()).isEqualTo(403);

        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 2L)).hasNumberOfRows(4)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("anotheruser");
    }

    @Test
    public void addUserToNonExistingWorkspaceForbidden() {
        addUser("user1");

        Response add = resource.target("/workspaces/3/users").request().post(Entity.json(new AddUser("user1")));
        assertThat(add.getStatus()).isEqualTo(403);
    }

    @Test
    public void addSameUserToDifferentWorkspaces() {
        // verify users of both workspaces
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 1L)).hasNumberOfRows(1);
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 2L)).hasNumberOfRows(4);

        // add user1 to the first workspace
        addUser("user1");
        Response add = resource.target("/workspaces/1/users").request().post(Entity.json(new AddUser("user1")));
        assertThat(add.getStatus()).isEqualTo(200);
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 1L)).hasNumberOfRows(2);

        // relog as an admin workspace
        resource.setCurrentProfile(new CockpitProfile(ADMINWORKSPACEUSER, resource.db().configuration()));

        // add user1 to the second workspace
        Response add2 = resource.target("/workspaces/2/users").request().post(Entity.json(new AddUser("user1")));
        assertThat(add2.getStatus()).isEqualTo(200);
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 2L)).hasNumberOfRows(5);
    }

    @Test
    public void getUserInformationsWhenAddingUser() {
        addUser("user1");

        WorkspaceUser add = resource.target("/workspaces/1/users").request().post(Entity.json(new AddUser("user1")),
                WorkspaceUser.class);
        assertThat(add.id).isEqualTo("user1");
        assertThat(add.name).isEqualTo("user1");
        assertThat(add.wsPermissions.adminWorkspace).isFalse();
        assertThat(add.wsPermissions.deployArtifact).isFalse();
        assertThat(add.wsPermissions.lifecycleArtifact).isFalse();
    }

    @Test
    public void deleteUserFromExistingWorkspace() {
        resource.setCurrentProfile(new CockpitProfile(ADMIN, resource.db().configuration()));

        addUser("user1");

        resource.db().executeInsert(new UsersWorkspacesRecord(1L, "user1", false, false, false));

        Response delete = resource.target("/workspaces/1/users/user1").request().delete();
        assertThat(delete.getStatus()).isEqualTo(204);

        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 1L)).hasNumberOfRows(1)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("admin");

        // deleting an non-workspace user should work
        Response delete2 = resource.target("/workspaces/1/users/user1").request().delete();
        assertThat(delete2.getStatus()).isEqualTo(204);

        // non-existing user should work also
        Response delete3 = resource.target("/workspaces/1/users/user2").request().delete();
        assertThat(delete3.getStatus()).isEqualTo(204);

        // the other workspace wasn't touched
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 2L)).hasNumberOfRows(4)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("anotheruser");
    }

    @Test
    public void deleteUserFromNonExistingWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/3/users/user1").request().delete();
        assertThat(delete.getStatus()).isEqualTo(403);
    }

    @Test
    public void deleteUserFromExistingWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/2/users/anotheruser").request().delete();
        assertThat(delete.getStatus()).isEqualTo(403);

        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 2L)).hasNumberOfRows(4)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("anotheruser");
    }

    @Test
    public void leaveWorkspace() {
        addUser("user1");

        resource.db().executeInsert(new UsersWorkspacesRecord(1L, "user1", true, false, false));

        Response delete = resource.target("/workspaces/1/users/admin").request().delete();

        assertThat(delete.getStatus()).isEqualTo(204);
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 1L)).hasNumberOfRows(1)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("user1");
    }

    @Test
    public void leaveWorkspaceLastMemberForbidden() {
        Response delete = resource.target("/workspaces/1/users/admin").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 1L)).hasNumberOfRows(1)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("admin");
    }

    @Test
    public void leaveWorkspaceLastAdministratorForbidden() {
        addUser("user1");

        resource.db().executeInsert(new UsersWorkspacesRecord(1L, "user1", false, false, false));

        Response delete = resource.target("/workspaces/1/users/admin").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);
        assertThat(requestBy(USERS_WORKSPACES.WORKSPACE_ID, 1L)).hasNumberOfRows(2)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("admin");
    }

    @Test
    public void deleteBus() {
        assertThat(requestBus(domain)).hasNumberOfRows(1);

        BusDeleted res = resource.target("/workspaces/1/buses/" + getId(domain)).request().delete(BusDeleted.class);

        assertThat(requestBus(domain)).hasNumberOfRows(0);
        assertThat(res.id).isEqualTo(getId(domain));
        assertThat(res.reason).isEqualTo("Bus deleted by " + ADMIN);
        assertWorkspaceContentForServices(new SoftAssertions(), res.content, 1, new ArrayList<Endpoint>());

        assertThat(requestContainer(container1)).hasNumberOfRows(0);
        assertThat(requestContainer(container2)).hasNumberOfRows(0);
        assertThat(requestContainer(container3)).hasNumberOfRows(0);
    }

    @Test
    public void updateWorkspaceWithNameSimilarToAnotherWorkspaceName() {
        Response put = resource.target("/workspaces/1").request()
                .put(Entity.json(new WorkspaceUpdate("test_2", null, null)));
        assertThat(put.getStatus()).isEqualTo(409);

        // it wasn't changed!
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.NAME.getName()).isEqualTo("test");
    }

    @Test
    public void updateWorkspaceWithNameSimilarToPreviousName() {
        Response put = resource.target("/workspaces/1").request()
                .put(Entity.json(new WorkspaceUpdate("te_st", null, null)));
        assertThat(put.getStatus()).isEqualTo(200);

        // it was changed!
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.NAME.getName()).isEqualTo("te_st");
    }

    private void assertContent(SoftAssertions a, WorkspaceFullContent content, Domain... buses) {
        assertContentMin(content.workspace);

        assertWorkspaceContent(a, content.content, content.workspace.id, referenceEndpoints, buses);
    }

    private void assertUsers(Map<String, UserMin> users) {
        assertThat(users).hasSize(1);

        UserMin u = users.values().iterator().next();

        assertThat(u.id).isEqualTo(ADMIN);
        assertThat(u.name).isEqualTo("admin");
    }

    private void assertContentMin(WorkspaceMin workspaceMin) {
        assertThat(workspaceMin.id).isEqualTo(1);
        assertThat(workspaceMin.name).isEqualTo("test");
    }

    private void assertWorkspaceUsers(ImmutableList<WorkspaceResource.WorkspaceUser> users) {
        assertThat(users).hasSize(1);
        WorkspaceResource.WorkspaceUser u = users.iterator().next();

        assertThat(u.id).isEqualTo(ADMIN);
        assertThat(u.name).isEqualTo(ADMIN);
        assertThat(u.wsPermissions.adminWorkspace).isTrue();
        assertThat(u.wsPermissions.deployArtifact).isTrue();
        assertThat(u.wsPermissions.lifecycleArtifact).isTrue();
    }

    private void assertWorkspaceOverviewContent(WorkspaceOverviewContent overview) {
        assertWorkspaceOverviewContent(overview, "", "");
    }

    private void assertWorkspaceOverviewContent(WorkspaceOverviewContent overview, String shortDescription,
            String description) {
        assertThat(overview.workspace.id).isEqualTo(1);
        assertThat(overview.workspace.name).isEqualTo("test");
        assertThat(overview.description).isEqualTo(description);
        assertThat(overview.shortDescription).isEqualTo(shortDescription);
        assertWorkspaceUsers(overview.users);
    }
}
