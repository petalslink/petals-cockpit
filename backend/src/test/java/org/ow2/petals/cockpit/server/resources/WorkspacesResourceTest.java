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

import org.jooq.impl.DSL;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.NewWorkspace;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.Workspace;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.Workspaces;

import io.dropwizard.testing.junit.ResourceTestRule;

public class WorkspacesResourceTest extends AbstractCockpitResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(WorkspacesResource.class);

    @Test
    public void createWorkspace() {
        NewWorkspace newWs = new NewWorkspace("test");
        Workspace post = resources.getJerseyTest().target("/workspaces").request().post(Entity.json(newWs),
                Workspace.class);

        assertThat(post.id).isGreaterThan(0);
        assertThat(post.name).isEqualTo(newWs.name);

        // there should be only one!
        assertThat(table(WORKSPACES)).hasNumberOfRows(1)
                .column(WORKSPACES.ID.getName()).value().isEqualTo(post.id)
                .column(WORKSPACES.NAME.getName()).value().isEqualTo(post.name);

        assertThat(table(USERS_WORKSPACES)).hasNumberOfRows(1)
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo(ADMIN)
                .column(USERS_WORKSPACES.WORKSPACE_ID.getName()).value().isEqualTo(post.id);
    }

    @Test
    public void getWorkspaces() {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new WorkspacesRecord(1L, "test1"));
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new WorkspacesRecord(2L, "test2"));
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new WorkspacesRecord(3L, "test3"));
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new WorkspacesRecord(4L, "test4"));

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("userX", "..", "..", null));
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("userY", "..", "..", null));

        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersWorkspacesRecord(1L, "admin"));
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersWorkspacesRecord(1L, "userX"));
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersWorkspacesRecord(2L, "userX"));
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersWorkspacesRecord(3L, "admin"));

        Workspaces ws = resources.getJerseyTest().target("/workspaces").request().get(Workspaces.class);

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

        assertThat(ws.users.get("admin").username).isEqualTo("admin");
        assertThat(ws.users.get("admin").name).isEqualTo("Administrator");
        assertThat(ws.users.get("userX").username).isEqualTo("userX");
        assertThat(ws.users.get("userX").name).isEqualTo("..");
        assertThat(ws.users.get("userY")).isNull();
    }
}
