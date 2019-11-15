/**
 * Copyright (C) 2019 Linagora
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

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.resources.PermissionsResource.PermissionsMin;
import org.ow2.petals.cockpit.server.resources.PermissionsResource.ViewPermissions;

public class PermissionsResourceTest extends AbstractDefaultWorkspaceResourceTest {
   
	public PermissionsResourceTest() {
        super(PermissionsResource.class);
    }

    @Test
    public void getAllPermissions() {
        addUsersToWorkspace(1L, ANOTHERUSER);
        addPermissions(1L, ANOTHERUSER, true, false, true);
		ViewPermissions view = resource.target("/users/anotheruser/permissions").request()
				.get(ViewPermissions.class);
		assertThat(view).isNotNull();
		assertThat(view.permissions.get(1L).adminWorkspace).isTrue();
		assertThat(view.permissions.get(1L).deployArtifact).isFalse();
		assertThat(view.permissions.get(1L).lifecycleArtifact).isTrue();

		assertThat(view.permissions.get(2L).adminWorkspace).isFalse();
		assertThat(view.permissions.get(2L).deployArtifact).isTrue();
		assertThat(view.permissions.get(2L).lifecycleArtifact).isTrue();
    }

    @Test
    public void getPermissionsWithWorkspaceID() {
		ViewPermissions view = resource.target("/users/anotheruser/permissions").queryParam("wsId", 2).request()
				.get(ViewPermissions.class);
		assertThat(view).isNotNull();
		assertThat(view.permissions.get(2L).adminWorkspace).isFalse();
		assertThat(view.permissions.get(2L).deployArtifact).isTrue();
		assertThat(view.permissions.get(2L).lifecycleArtifact).isTrue();
    }

    @Test
    public void adminCockpitCanUpdatePermissions() {
        Map<Long, PermissionsMin> permissions = new HashMap<>();
        permissions.put(2L, new PermissionsMin(true, false, false));
        Response put = resource.target("/users/anotheruser/permissions").request()
                .put(Entity.json(permissions));
        assertThat(put).isNotNull();
        assertThat(put.getStatus()).isEqualTo(204);
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRowsList().size()).isEqualTo(1);
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(2).getValue().equals(true));
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(3).getValue().equals(false));
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(4).getValue().equals(false));
    }

    @Test
    public void notAdminCanNotUpdatePermissions() {
        resource.setCurrentProfile(new CockpitProfile(ANOTHERUSER, resource.db().configuration()));
        HashMap<Long, PermissionsMin> permissions = new HashMap<>();
        permissions.put(2L, new PermissionsMin(true, false, false));
        Response put = resource.target("/users/anotheruser/permissions").request()
                .put(Entity.json(permissions));
        assertThat(put.getStatus()).isEqualTo(401);// Fail: Forbidden
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRowsList().size()).isEqualTo(1);
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(2).getValue().equals(false));
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(3).getValue().equals(true));
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(4).getValue().equals(true));
    }

    @Test
    public void adminWorkspaceCanUpdatePermissionsOnHisWorkspace() {
        resource.setCurrentProfile(new CockpitProfile(ADMINWORKSPACEUSER, resource.db().configuration()));
        HashMap<Long, PermissionsMin> permissions = new HashMap<>();
        permissions.put(2L, new PermissionsMin(true, false, false));
        Response put = resource.target("/users/anotheruser/permissions").request()
                .put(Entity.json(permissions));
        assertThat(put).isNotNull();
        assertThat(put.getStatus()).isEqualTo(204);
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRowsList().size()).isEqualTo(1);
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(2).getValue().equals(true));
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(3).getValue().equals(false));
        assertThat(requestUsersWorkspaces(2L, ANOTHERUSER).getRow(0).getColumnValue(4).getValue().equals(false));
    }

    @Test
    public void adminWorkspaceCanNotUpdatePermissionsOnOtherWorkspace() {
        resource.setCurrentProfile(new CockpitProfile(ADMINWORKSPACEUSER, resource.db().configuration()));
        HashMap<Long, PermissionsMin> permissions = new HashMap<>();
        permissions.put(1L, new PermissionsMin(true, false, false));
        Response put = resource.target("/users/admin/permissions").request()
                .put(Entity.json(permissions));
        assertThat(put).isNotNull();
        assertThat(put.getStatus()).isEqualTo(401); // Fail: Forbidden
        assertThat(requestUsersWorkspaces(1L, ADMIN).getRowsList().size()).isEqualTo(1);
        assertThat(requestUsersWorkspaces(1L, ADMIN).getRow(0).getColumnValue(2).getValue().equals(true));
        assertThat(requestUsersWorkspaces(1L, ADMIN).getRow(0).getColumnValue(3).getValue().equals(true));
        assertThat(requestUsersWorkspaces(1L, ADMIN).getRow(0).getColumnValue(4).getValue().equals(true));
    }

    @Test
    public void lastAdminWorkspaceCanNotBeDemoted() {
        HashMap<Long, PermissionsMin> permissions = new HashMap<>();
        permissions.put(2L, new PermissionsMin(false, false, false));
        Response put = resource.target("/users/adminwsuser/permissions").request()
                .put(Entity.json(permissions));
        assertThat(put).isNotNull();
        assertThat(put.getStatus()).isEqualTo(409); // Fail: Conflict
        assertThat(requestUsersWorkspaces(2L, ADMINWORKSPACEUSER).getRowsList().size()).isEqualTo(1);
        assertThat(requestUsersWorkspaces(2L, ADMINWORKSPACEUSER).getRow(0).getColumnValue(2).getValue().equals(true));
        assertThat(requestUsersWorkspaces(2L, ADMINWORKSPACEUSER).getRow(0).getColumnValue(3).getValue().equals(false));
        assertThat(requestUsersWorkspaces(2L, ADMINWORKSPACEUSER).getRow(0).getColumnValue(4).getValue().equals(false));
    }

}
