/**
 * Copyright (C) 2017 Linagora
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

public class UsersResourceTest extends AbstractSecurityTest {

    private void can(@Nullable Authentication user, String target, String method, @Nullable Entity<?> entity,
            int expectedStatus) {
        if (user != null) {
            final Response login = login(user);
            assertThat(login.getStatus()).isEqualTo(200);
        }

        final Response get = this.app.target(target).request().method(method, entity);
        assertThat(get.getStatus()).isEqualTo(expectedStatus);
    }

    @Test
    public void testAdminCanListAllUsers() {
        can(ADMIN, "/users", HttpMethod.GET, null, 200);
    }

    @Test
    public void testUserCanListAllUsers() {
        can(USER, "/users", HttpMethod.GET, null, 200);
    }

    @Test
    public void testUnloggedCanTListAllUsers() {
        can(null, "/users", HttpMethod.GET, null, 401);
    }

    @Test
    public void testAdminCanGetUsers() {
        addUser("user1");
        can(ADMIN, "/users/user1", HttpMethod.GET, null, 200);
    }

    @Test
    public void testUserCanTGetUsers() {
        addUser("user1");
        can(USER, "/users/user1", HttpMethod.GET, null, 403);
    }

    @Test
    public void testAdminCanDeleteUsers() {
        addUser("user1");
        can(ADMIN, "/users/user1", HttpMethod.DELETE, null, 204);
    }

    @Test
    public void testUserCanTDeleteUsers() {
        addUser("user1");
        can(USER, "/users/user1", HttpMethod.DELETE, null, 403);
    }

    @Test
    public void testAdminCanAddUsers() {
        can(ADMIN, "/users", HttpMethod.POST, Entity.json(new NewUser("user1", "...", "...")), 204);
    }

    @Test
    public void testUserCanTAddUsers() {
        can(USER, "/users", HttpMethod.POST, Entity.json(new NewUser("user1", "...", "...")), 403);
    }

    @Test
    public void testAdminCanModifyUsers() {
        addUser("user1");
        can(ADMIN, "/users/user1", HttpMethod.PUT, Entity.json(new UpdateUser(null, null)), 204);
    }

    @Test
    public void testUserCanTModifyUsers() {
        addUser("user1");
        can(USER, "/users/user1", HttpMethod.PUT, Entity.json(new UpdateUser(null, null)), 403);
    }
}
