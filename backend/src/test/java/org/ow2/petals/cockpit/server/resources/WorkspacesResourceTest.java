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
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import javax.ws.rs.client.Entity;

import org.junit.Test;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.NewWorkspace;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.Workspace;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.WorkspacesContent;

public class WorkspacesResourceTest extends AbstractCockpitResourceTest {

    public WorkspacesResourceTest() {
        super(WorkspacesResource.class);
    }

    @Test
    public void createWorkspace() {
        NewWorkspace newWs = new NewWorkspace("test");
        Workspace post = resource.target("/workspaces").request().post(Entity.json(newWs), Workspace.class);

        assertThat(post.id).isGreaterThan(0);
        assertThat(post.name).isEqualTo(newWs.name);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1).column(WORKSPACES.ID.getName()).value().isEqualTo(post.id)
                .column(WORKSPACES.NAME.getName()).value().isEqualTo(post.name).column(WORKSPACES.DESCRIPTION.getName())
                .value().isEqualTo("Put some description in **markdown** for the workspace here.");

        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1).column(USERS_WORKSPACES.USERNAME.getName()).value()
                .isEqualTo(ADMIN).column(USERS_WORKSPACES.WORKSPACE_ID.getName()).value().isEqualTo(post.id);
    }

    @Test
    public void getWorkspaces() {
        resource.db().executeInsert(new WorkspacesRecord(1L, "test1", ""));
        resource.db().executeInsert(new WorkspacesRecord(2L, "test2", ""));
        resource.db().executeInsert(new WorkspacesRecord(3L, "test3", ""));
        resource.db().executeInsert(new WorkspacesRecord(4L, "test4", ""));

        addUser("userX");
        addUser("userY");

        resource.db().executeInsert(new UsersWorkspacesRecord(1L, "admin"));
        resource.db().executeInsert(new UsersWorkspacesRecord(1L, "userX"));
        resource.db().executeInsert(new UsersWorkspacesRecord(2L, "userX"));
        resource.db().executeInsert(new UsersWorkspacesRecord(3L, "admin"));

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
        assertThat(ws.users.get("admin").name).isEqualTo("Administrator");
        assertThat(ws.users.get("userX").id).isEqualTo("userX");
        assertThat(ws.users.get("userX").name).isEqualTo("...");
        assertThat(ws.users.get("userY")).isNull();
    }
}
