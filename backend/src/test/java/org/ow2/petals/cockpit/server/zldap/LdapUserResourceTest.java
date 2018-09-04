/**
 * Copyright (C) 2018 Linagora
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

/**
 * Could not consistently run these test without making UserSessionTest and UsersResourceSecurityTest fail as side
 * effect... Something to do with CockpitApplicationRule instantiating conflicting DropwizardAppRule (I suppose).
 *
 * As a workaround, the tests are run alphabetically and some were placed in zldap package to make them run last ... see:
 * https://groups.google.com/forum/#!topic/dropwizard-user/hb79pf_gXjg
 */
package org.ow2.petals.cockpit.server.zldap;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.cockpit.server.mocks.MockLdapServer;
import org.ow2.petals.cockpit.server.resources.LdapResource.LdapUser;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;
import org.ow2.petals.cockpit.server.resources.UsersResource.UpdateUser;
import org.ow2.petals.cockpit.server.security.AbstractLdapTest;

public class LdapUserResourceTest extends AbstractLdapTest {

    @Before
    public void setUpDb() {
        addUser(ADMIN_LDAP_DB, true);
        addUser(USER_NOLDAP_DB, false);
        login(ADMIN_LDAP_DB);
    }

    @Test
    public void ldapGetUsersOneResult() {
        List<LdapUser> users = appLdap.target("/ldap/users?name=bonjour").request()
                .get(new GenericType<List<LdapUser>>() {
                });

        assertThat(users).isNotNull();
        assertThat(users.size()).isEqualTo(1);
        assertThat(users).contains(USER2);
    }

    @Test
    public void ldapGetUsersMultipleResults() {
        List<LdapUser> users = appLdap.target("/ldap/users?name=user").request().get(new GenericType<List<LdapUser>>() {
        });

        assertThat(users).isNotNull();
        assertThat(users.size()).isEqualTo(3);
        assertThat(users).contains(USER1, USER2, USER3);
    }

    @Test
    public void ldapGetUsersNoResult() {
        List<LdapUser> users = appLdap.target("/ldap/users?name=alexandre").request()
                .get(new GenericType<List<LdapUser>>() {
                });

        assertThat(users).isNotNull();
        assertThat(users.size()).isEqualTo(0);
    }

    @Test
    public void ldapGetUsersNoParameter() {
        Response get = appLdap.target("/ldap/users").request().get();
        assertThat(get.getStatus()).isEqualTo(400); // Bad request
    }

    @Test
    public void ldapGetUsersEmptyName() {
        Response get = appLdap.target("/ldap/users?name=").request().get();
        assertThat(get.getStatus()).isEqualTo(400); // Bad request
    }

    @Test
    public void ldapGetUsersInjection() {
        Response get = appLdap.target("/ldap/users?name=)(cn=").request().get();
        assertThat(get.getStatus()).isEqualTo(400); // Bad request
    }

    @Test
    public void ldapGetUsersNotAdminForbidden() {
        addUser(USER_LDAP_NODB, false);
        login(USER_LDAP_NODB);
        Response get = appLdap.target("/ldap/users?name=user").request().get();
        assertThat(get.getStatus()).isEqualTo(403); // Forbidden
    }

    @Test
    public void ldapAddUser() {
        final String username = USER_LDAP_NODB.username;

        Response post = appLdap.target("/users").request().post(Entity.json(USER_LDAP_NODB));
        assertThat(post.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUser(username);
        assertThatDbUser(username).value("name").isEqualTo(USER_LDAP_NODB.name);
        assertThatDbUser(username).value("password").isNotEqualTo(USER_LDAP_NODB.password);
        assertThat(isUserPasswordWhenEncoded(username, USER_LDAP_NODB.password)).isFalse();
        assertThatDbUser(username).value("admin").isEqualTo(false);
        assertThatDbUser(username).value("is_from_ldap").isEqualTo(true);
    }

    @Test
    public void ldapAddUserUsernameOnly() {
        final String username = USER_LDAP_NODB.username;

        Response post = appLdap.target("/users").request().post(Entity.json(new NewUser(username, null, null)));
        assertThat(post.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUser(username);
        assertThatDbUser(username).value("name").isEqualTo(USER_LDAP_NODB.name);
        assertThatDbUser(username).value("password").isNotEqualTo(USER_LDAP_NODB.password);
        assertThat(isUserPasswordWhenEncoded(username, USER_LDAP_NODB.password)).isFalse();
        assertThatDbUser(username).value("admin").isEqualTo(false);
        assertThatDbUser(username).value("is_from_ldap").isEqualTo(true);
    }

    @Test
    public void ldapAddUserNotLdap() {
        Response post = appLdap.target("/users").request().post(Entity.json(USER_NOLDAP_NODB));
        assertThat(post.getStatus()).isEqualTo(409); // Conflict

        assertThat(userIsInDb(USER_NOLDAP_NODB.username)).isFalse();
    }

    @Test
    public void ldapAddUserAlreadyInDb() {
        Response post = appLdap.target("/users").request().post(Entity.json(ADMIN_LDAP_DB));
        assertThat(post.getStatus()).isEqualTo(409); // Conflict
    }

    @Test
    public void ldapAddUserNonAdmin() {
        addUser(USER_LDAP_NODB, false);
        login(USER_LDAP_NODB);

        Response post = appLdap.target("/users").request().post(Entity.json(MockLdapServer.LDAP_USER3));
        assertThat(post.getStatus()).isEqualTo(403); // Forbidden

        assertThat(userIsInDb(MockLdapServer.LDAP_USER3.username)).isFalse();
    }

    @Test
    public void ldapChangeUserForbidden() {
        addUser(USER_LDAP_NODB, false);

        final String username = USER_LDAP_NODB.username;
        final String name = USER_LDAP_NODB.name;
        final String password = USER_LDAP_NODB.password;
        final String newName = "New User Name";
        final String newPassword = "New Password";

        Response put = appLdap.target("/users/" + username).request()
                .put(Entity.json(new UpdateUser(newPassword, newName)));
        assertThat(put.getStatus()).isEqualTo(405); // Method not allowed

        assertThatDbUser(username);
        assertThatDbUser(username).value("name").isEqualTo(name);
        assertThatDbUser(username).value("password").isNotEqualTo(password);
        assertThatDbUser(username).value("password").isNotEqualTo(newPassword);
        assertThat(isUserPasswordWhenEncoded(username, password)).isFalse();
        assertThat(isUserPasswordWhenEncoded(username, newPassword)).isFalse();
        assertThatDbUser(username).value("admin").isEqualTo(false);
        assertThatDbUser(username).value("is_from_ldap").isEqualTo(true);
    }

}
