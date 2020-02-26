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
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.apache.commons.lang3.RandomStringUtils;
import org.junit.Test;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.NewWorkspace;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.WorkspaceMin;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.WorkspacesContent;

@SuppressWarnings("null")
public class WorkspacesResourceTest extends AbstractBasicResourceTest {

    // This is a 101 characters long Cthuvian Lorem Ipsum, don't say it out loud!
    private static final String STRING_OF_101_CHARS = "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl gol fhtagn. Hai ph'orr'e, n'ghft n'gha uaah Nyarlathotep.";

    public WorkspacesResourceTest() {
        super(WorkspacesResource.class);
    }

    @Test
    public void createWorkspace() {
        NewWorkspace newWs = new NewWorkspace("test", null, null);
        WorkspaceMin post = resource.target("/workspaces").request().post(Entity.json(newWs), WorkspaceMin.class);

        assertThat(post.id).isGreaterThan(0);
        assertThat(post.name).isEqualTo(newWs.name);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1).column(WORKSPACES.ID.getName()).value().isEqualTo(post.id)
                .column(WORKSPACES.NAME.getName()).value().isEqualTo(post.name).column(WORKSPACES.DESCRIPTION.getName())
                .value().isEqualTo(WorkspacesResource.DEFAULT_DESCRIPTION)
                .column(WORKSPACES.SHORT_DESCRIPTION.getName()).value()
                .isEqualTo(WorkspacesResource.DEFAULT_SHORT_DESCRIPTION);

        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1).column(USERS_WORKSPACES.USERNAME.getName()).value()
                .isEqualTo(ADMIN).column(USERS_WORKSPACES.WORKSPACE_ID.getName()).value().isEqualTo(post.id);
    }

    @Test
    public void createWorkspaceWithShortDescription() {
        NewWorkspace newWs = new NewWorkspace("test", "This is a test workspace short description", null);
        WorkspaceMin post = resource.target("/workspaces").request().post(Entity.json(newWs), WorkspaceMin.class);

        assertThat(post.id).isGreaterThan(0);
        assertThat(post.name).isEqualTo(newWs.name);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1).column(WORKSPACES.ID.getName()).value().isEqualTo(post.id)
                .column(WORKSPACES.NAME.getName()).value().isEqualTo(post.name)
                .column(WORKSPACES.SHORT_DESCRIPTION.getName()).value()
                .isEqualTo("This is a test workspace short description").column(WORKSPACES.DESCRIPTION.getName())
                .value().isEqualTo(WorkspacesResource.DEFAULT_DESCRIPTION);

        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1).column(USERS_WORKSPACES.USERNAME.getName()).value()
                .isEqualTo(ADMIN).column(USERS_WORKSPACES.WORKSPACE_ID.getName()).value().isEqualTo(post.id);
    }

    @Test
    public void createWorkspaceWithTooLongShortDescription() {
        NewWorkspace newWs = new NewWorkspace("test",
                RandomStringUtils.random(WorkspacesResource.SHORT_DESCRIPTION_MAX_LENGTH + 1), null);
        Response post = resource.target("/workspaces").request().post(Entity.json(newWs));
        assertThat(post.getStatus()).isEqualTo(422);
        assertThat(table(WORKSPACES)).hasNumberOfRows(0);
        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(0);
    }

    @Test
    public void createWorkspaceWithDescription() {
        NewWorkspace newWs = new NewWorkspace("test", null, "This is a test workspace description");
        WorkspaceMin post = resource.target("/workspaces").request().post(Entity.json(newWs), WorkspaceMin.class);

        assertThat(post.id).isGreaterThan(0);
        assertThat(post.name).isEqualTo(newWs.name);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1).column(WORKSPACES.ID.getName()).value().isEqualTo(post.id)
                .column(WORKSPACES.NAME.getName()).value().isEqualTo(post.name)
                .column(WORKSPACES.SHORT_DESCRIPTION.getName()).value()
                .isEqualTo(WorkspacesResource.DEFAULT_SHORT_DESCRIPTION).column(WORKSPACES.DESCRIPTION.getName())
                .value().isEqualTo("This is a test workspace description");

        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1).column(USERS_WORKSPACES.USERNAME.getName()).value()
                .isEqualTo(ADMIN).column(USERS_WORKSPACES.WORKSPACE_ID.getName()).value().isEqualTo(post.id);
    }

    @Test
    public void getWorkspaces() {
        resource.db().executeInsert(new WorkspacesRecord(1L, "test1", "", ""));
        resource.db().executeInsert(new WorkspacesRecord(2L, "test2", "", ""));
        resource.db().executeInsert(new WorkspacesRecord(3L, "test3", "", ""));
        resource.db().executeInsert(new WorkspacesRecord(4L, "test4", "", ""));

        addUser("userX");
        addUser("userY");

        resource.db().executeInsert(new UsersWorkspacesRecord(1L, "admin", false, false, false));
        resource.db().executeInsert(new UsersWorkspacesRecord(1L, "userX", false, false, false));
        resource.db().executeInsert(new UsersWorkspacesRecord(2L, "userX", false, false, false));
        resource.db().executeInsert(new UsersWorkspacesRecord(3L, "admin", false, false, false));

        WorkspacesContent ws = resource.target("/workspaces").request().get(WorkspacesContent.class);

        // ws 1 and 3
        assertThat(ws.workspaces).hasSize(2);

        assertThat(ws.workspaces.get("1").id).isEqualTo(1);
        assertThat(ws.workspaces.get("1").name).isEqualTo("test1");
        assertThat(ws.workspaces.get("1").users).containsExactly("admin", "userX");
        assertThat(ws.workspaces.get("2")).isNull();
        assertThat(ws.workspaces.get("3").id).isEqualTo(3);
        assertThat(ws.workspaces.get("3").name).isEqualTo("test3");
        assertThat(ws.workspaces.get("3").users).containsExactly("admin");
        assertThat(ws.workspaces.get("4")).isNull();

        // admin and userX
        assertThat(ws.users).hasSize(2);

        assertThat(ws.users.get("admin").id).isEqualTo("admin");
        assertThat(ws.users.get("admin").name).isEqualTo("admin");
        assertThat(ws.users.get("userX").id).isEqualTo("userX");
        assertThat(ws.users.get("userX").name).isEqualTo("userX");
        assertThat(ws.users.get("userY")).isNull();
    }

    @Test
    public void createWorkspaceTwice() {
        NewWorkspace newWs = new NewWorkspace("test", null, null);
        Response add = resource.target("/workspaces").request().post(Entity.json(newWs));
        assertThat(add.getStatus()).isEqualTo(200);

        Response add2 = resource.target("/workspaces").request().post(Entity.json(newWs));
        assertThat(add2.getStatus()).isEqualTo(409);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1);
        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1);
    }

    @Test
    public void createWorkspacesSimilarNames() {
        NewWorkspace newWs = new NewWorkspace("this is a test workspace name", null, null);
        NewWorkspace newWs2 = new NewWorkspace("this? is_'a'_(test-workspace) {name}", null, null);

        Response add = resource.target("/workspaces").request().post(Entity.json(newWs));
        assertThat(add.getStatus()).isEqualTo(200);

        Response add2 = resource.target("/workspaces").request().post(Entity.json(newWs2));
        assertThat(add2.getStatus()).isEqualTo(409);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1);
        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1);
    }

    @Test
    public void createWorkspacesRidiculousButSimilarNames() {
        NewWorkspace newWs = new NewWorkspace("th(is 'I__s) a ]tE|st_ w$$o;rk   .sp:Ac!e name", null, null);
        NewWorkspace newWs2 = new NewWorkspace("tHis? is_'a'_(tE\\St-wo°rksp/Ace) {nam&e}", null, null);

        Response add = resource.target("/workspaces").request().post(Entity.json(newWs));
        assertThat(add.getStatus()).isEqualTo(200);

        Response add2 = resource.target("/workspaces").request().post(Entity.json(newWs2));
        assertThat(add2.getStatus()).isEqualTo(409);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1);
        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1);
    }

    @Test
    public void createWorkspaceTooLongName() {
        NewWorkspace newWs = new NewWorkspace(STRING_OF_101_CHARS, null, null);

        Response add = resource.target("/workspaces").request().post(Entity.json(newWs));

        assertThat(add.getStatus()).isEqualTo(422);
        assertThat(table(WORKSPACES)).hasNumberOfRows(0);
        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(0);
    }


}
