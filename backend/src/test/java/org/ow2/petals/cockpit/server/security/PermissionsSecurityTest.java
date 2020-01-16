/**
 * Copyright (C) 2019-2020 Linagora
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
package org.ow2.petals.cockpit.server.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;

import javax.ws.rs.HttpMethod;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.Nullable;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryMin;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.AddUser;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeParameters;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SLChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceUpdate;

@SuppressWarnings("null")
public class PermissionsSecurityTest extends AbstractSecurityTest {

    public static final NewUser ADMINWORKSPACE = new NewUser("ADMINWORKSPACE", "ADMINWORKSPACE", "ADMINWORKSPACE",
            false);

    public static final NewUser DEPLOYPERMISSION = new NewUser("DEPLOYPERMISSION", "DEPLOYPERMISSION",
            "DEPLOYPERMISSION", false);

    public static final NewUser LIFECYCLEPERMISSION = new NewUser("LIFECYCLEPERMISSION", "LIFECYCLEPERMISSION",
            "LIFECYCLEPERMISSION", false);

    private void setUpWorkspace(long wsId, String wsName, String... users) {
        app.db().executeInsert(new WorkspacesRecord(wsId, wsName, "", ""));
        for (String user : users) {
            app.db().executeInsert(new UsersWorkspacesRecord(wsId, user, false, false, false));
        }
    }

    private void changeUserPermissionsWorkspace(long wsId, String name, boolean adminWs, boolean deploy,
            boolean lifecycle) {
        app.db().executeUpdate(new UsersWorkspacesRecord(wsId, name, adminWs, deploy, lifecycle));
    }

    private void canAuth(@Nullable Authentication user, String target, String method, @Nullable Entity<?> entity,
            boolean isForbidden) {
        if (user != null) {
            final Response login = login(user);
            assertThat(login.getStatus()).isEqualTo(200);
        }

        final Response get = app.target(target).request().method(method, entity);

        // We look if the error 403 (Forbidden) is thrown here
        if (isForbidden) {
            assertThat(get.getStatus()).isEqualTo(403);
        } else {
            assertThat(get.getStatus()).isNotEqualTo(403);
        }
    }

    private void isAllowed(NewUser user, String target, String method, @Nullable Entity<?> entity) {
        assert user != null && user.username != null && user.password != null;
        this.canAuth(new Authentication(user.username, user.password), target, method, entity, false);
    }

    private void isForbidden(NewUser user, String target, String method, @Nullable Entity<?> entity) {
        assert user != null && user.username != null && user.password != null;
        this.canAuth(new Authentication(user.username, user.password), target, method, entity, true);
    }

    @Before
    public void setUp() {
        addUser(ADMINWORKSPACE);
        addUser(DEPLOYPERMISSION);
        addUser(LIFECYCLEPERMISSION);
        setUpWorkspace(1L, "test", "ADMINWORKSPACE", "DEPLOYPERMISSION", "LIFECYCLEPERMISSION");
        changeUserPermissionsWorkspace(1L, "ADMINWORKSPACE", true, false, false);
        changeUserPermissionsWorkspace(1L, "DEPLOYPERMISSION", false, true, false);
        changeUserPermissionsWorkspace(1L, "LIFECYCLEPERMISSION", false, false, true);
    }

    @Test
    public void adminWorkspaceCanUpdateWorkspace() {
        isAllowed(ADMINWORKSPACE, "/workspaces/1", HttpMethod.PUT, Entity.json(new WorkspaceUpdate("", "", "")));
    }

    @Test
    public void adminWorkspaceCanNotUpdateOtherWorkspace() {
        isForbidden(ADMINWORKSPACE, "/workspaces/2", HttpMethod.PUT, Entity.json(new WorkspaceUpdate("", "", "")));
    }

    @Test
    public void notAdminWorkspaceCanNotUpdateWorkspace() {
        isForbidden(DEPLOYPERMISSION, "/workspaces/1", HttpMethod.PUT, Entity.json(new WorkspaceUpdate("", "", "")));
    }

    @Test
    public void adminWorkspaceCanDeleteHisWorkspace() {
        isAllowed(ADMINWORKSPACE, "/workspaces/1", HttpMethod.DELETE, null);
    }

    @Test
    public void adminWorkspaceCanNotDeleteOtherWorkspace() {
        isForbidden(ADMINWORKSPACE, "/workspaces/2", HttpMethod.DELETE, null);
    }

    @Test
    public void notAdminWorkspaceCanNotDeleteWorkspace() {
        isForbidden(DEPLOYPERMISSION, "/workspaces/1", HttpMethod.DELETE, null);
    }

    @Test
    public void adminWorkspaceCanAddUsers() {
        isAllowed(ADMINWORKSPACE, "/workspaces/1/users", HttpMethod.POST, Entity.json(new AddUser("test")));
    }

    @Test
    public void adminWorkspaceCanNotAddUsersOnOtherWorkspace() {
        isForbidden(ADMINWORKSPACE, "/workspaces/2/users", HttpMethod.POST, Entity.json(new AddUser("test")));
    }

    @Test
    public void notAdminWorkspaceCanNotAddUsers() {
        isForbidden(DEPLOYPERMISSION, "/workspaces/1/users", HttpMethod.POST, Entity.json(new AddUser("test")));
    }

    @Test
    public void adminWorkspaceCanDeleteUsers() {
        isAllowed(ADMINWORKSPACE, "/workspaces/1/users/DEPLOYPERMISSION", HttpMethod.DELETE, null);
    }

    @Test
    public void adminWorkspaceCanNotDeleteUsersOnOtherWorkspace() {
        isForbidden(ADMINWORKSPACE, "/workspaces/2/users/DEPLOYPERMISSION", HttpMethod.DELETE, null);
    }

    @Test
    public void notAdminWorkspaceCanNotDeleteUsers() {
        isForbidden(DEPLOYPERMISSION, "/workspaces/1/users/test", HttpMethod.DELETE, null);
    }

    @Test
    public void lifecyclePermissionCanChangeSLState() {
        isAllowed(LIFECYCLEPERMISSION, "/workspaces/1/sharedlibraries/1", HttpMethod.PUT,
                Entity.json(new SLChangeState(SharedLibraryMin.State.Loaded)));
    }

    @Test
    public void notLifecycleCanNotChangeSLState() {
        isForbidden(DEPLOYPERMISSION, "/workspaces/1/sharedlibraries/1", HttpMethod.PUT,
                Entity.json(new SLChangeState(SharedLibraryMin.State.Loaded)));
    }

    @Test
    public void lifecyclePermissionCanChangeSAState() {
        isAllowed(LIFECYCLEPERMISSION, "/workspaces/1/serviceassemblies/1", HttpMethod.PUT,
                Entity.json(new SAChangeState(ServiceAssemblyMin.State.Started)));
    }

    @Test
    public void notLifecyclePermissionCanNotChangeSAState() {
        isForbidden(DEPLOYPERMISSION, "/workspaces/1/serviceassemblies/1", HttpMethod.PUT,
                Entity.json(new SAChangeState(ServiceAssemblyMin.State.Started)));
    }

    @Test
    public void lifecyclePermissionCanChangeComponentState() {
        isAllowed(LIFECYCLEPERMISSION, "/workspaces/1/components/1", HttpMethod.PUT,
                Entity.json(new ComponentChangeState(ComponentMin.State.Started)));
    }

    @Test
    public void notLifecyclePermissionCanNotChangeComponentState() {
        isForbidden(DEPLOYPERMISSION, "/workspaces/1/components/1", HttpMethod.PUT,
                Entity.json(new ComponentChangeState(ComponentMin.State.Started)));
    }

    @Test
    public void deployPermissionCanChangeComponentParameters() {
        isAllowed(DEPLOYPERMISSION, "/workspaces/1/components/1/parameters", HttpMethod.PUT,
                Entity.json(new ComponentChangeParameters(new HashMap<String, String>())));
    }

    @Test
    public void notDeployPermissionCanNotChangeComponentParameters() {
        isForbidden(LIFECYCLEPERMISSION, "/workspaces/1/components/1/parameters", HttpMethod.PUT,
                Entity.json(new ComponentChangeParameters(new HashMap<String, String>())));
    }

    @Test
    public void deployPermissionCanDeploySharedLibrary() {
        isAllowed(DEPLOYPERMISSION, "/workspaces/1/containers/1/sharedlibraries", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

    @Test
    public void notDeployPermissionCanNotDeploySharedLibrary() {
        isForbidden(LIFECYCLEPERMISSION, "/workspaces/1/containers/1/sharedlibraries", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

    @Test
    public void deployPermissionCanDeployServiceUnit() {
        isAllowed(DEPLOYPERMISSION, "/workspaces/1/components/1/serviceunits", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

    @Test
    public void notDeployPermissionCanNotDeployServiceUnit() {
        isForbidden(LIFECYCLEPERMISSION, "/workspaces/1/components/1/serviceunits", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

    @Test
    public void deployPermissionCanDeployComponent() {
        isAllowed(DEPLOYPERMISSION, "/workspaces/1/containers/1/components", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

    @Test
    public void notDeployPermissionCanNotDeployComponent() {
        isForbidden(LIFECYCLEPERMISSION, "/workspaces/1/containers/1/components", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

    @Test
    public void deployPermissionCanDeployServiceAssembly() {
        isAllowed(DEPLOYPERMISSION, "/workspaces/1/containers/1/serviceassemblies", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

    @Test
    public void notDeployPermissionCanNotDeployServiceAssembly() {
        isForbidden(LIFECYCLEPERMISSION, "/workspaces/1/containers/1/serviceassemblies", HttpMethod.POST,
                Entity.entity("", MediaType.MULTIPART_FORM_DATA));
    }

}
