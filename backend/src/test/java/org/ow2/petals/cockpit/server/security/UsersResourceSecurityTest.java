/**
 * Copyright (C) 2017-2019 Linagora
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

import javax.ws.rs.HttpMethod;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.Nullable;
import org.junit.Test;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;
import org.ow2.petals.cockpit.server.resources.UsersResource.UpdateUser;

public class UsersResourceSecurityTest extends AbstractSecurityTest {

    private void canAuth(@Nullable Authentication user, String target, String method, @Nullable Entity<?> entity,
            int expectedStatus) {
        if (user != null) {
            final Response login = login(user);
            assertThat(login.getStatus()).isEqualTo(200);
        }

        final Response get = app.target(target).request().method(method, entity);
        assertThat(get.getStatus()).isEqualTo(expectedStatus);
    }

    private void can(NewUser user, String target, String method, @Nullable Entity<?> entity,
            int expectedStatus) {
        assert user != null && user.username != null && user.password != null;
        this.canAuth(new Authentication(user.username, user.password), target, method, entity, expectedStatus);
    }

    @Test
    public void adminCanListAllUsers() {
        can(ADMIN, "/users", HttpMethod.GET, null, 200);
    }

    @Test
    public void userCanListAllUsers() {
        can(USER, "/users", HttpMethod.GET, null, 200);
    }

    @Test
    public void unloggedCanNotListAllUsers() {
        canAuth(null, "/users", HttpMethod.GET, null, 401);
    }

    @Test
    public void adminCanGetUsers() {
        addUser("user1");
        can(ADMIN, "/users/user1", HttpMethod.GET, null, 200);
    }

    @Test
    public void userCanNotGetUsers() {
        addUser("user1");
        can(USER, "/users/user1", HttpMethod.GET, null, 403);
    }

    @Test
    public void adminCanDeleteUsers() {
        addUser("user1");
        can(ADMIN, "/users/user1", HttpMethod.DELETE, null, 204);
    }

    @Test
    public void userCanNotDeleteUsers() {
        addUser("user1");
        can(USER, "/users/user1", HttpMethod.DELETE, null, 403);
    }

    @Test
    public void adminCanAddUsers() {
        can(ADMIN, "/users", HttpMethod.POST, Entity.json(new NewUser("user1", "...", "...", false)), 204);
    }

    @Test
    public void userCanNotAddUsers() {
        can(USER, "/users", HttpMethod.POST, Entity.json(new NewUser("user1", "...", "...", false)), 403);
    }

    @Test
    public void adminCanModifyUsers() {
        addUser("user1");
        can(ADMIN, "/users/user1", HttpMethod.PUT, Entity.json(new UpdateUser(null, null, false)), 204);
    }

    @Test
    public void userCanNotModifyUsers() {
        addUser("user1");
        can(USER, "/users/user1", HttpMethod.PUT, Entity.json(new UpdateUser(null, null, false)), 403);
    }

    @Test
    public void adminCanNotGetLdapUserList() {
        addUser("user1");
        can(ADMIN, "/ldap/users?name=user", HttpMethod.GET, null, 404);
    }

    @Test
    public void userCanNotGetLdapUserList() {
        addUser("user1");
        can(USER, "/ldap/users?name=user", HttpMethod.GET, null, 403);
    }

}
