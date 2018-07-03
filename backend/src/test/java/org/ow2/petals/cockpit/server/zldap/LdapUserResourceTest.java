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

import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.LdapResource.LdapUser;
import org.ow2.petals.cockpit.server.security.AbstractLdapTest;

public class LdapUserResourceTest extends AbstractLdapTest {

    @Test
    public void testLdapGetUsersOneResult() {
        login(USER_LDAP_DB);
        List<LdapUser> users = appLdap.target("/ldap/users?name=bonjour").request()
                .get(new GenericType<List<LdapUser>>() {
                });

        assertThat(users).isNotNull();
        assertThat(users.size()).isEqualTo(1);
        assertThat(users).contains(USER2);
    }

    @Test
    public void testLdapGetUsersMultipleResults() {
        login(USER_LDAP_DB);
        List<LdapUser> users = appLdap.target("/ldap/users?name=user").request().get(new GenericType<List<LdapUser>>() {
        });

        assertThat(users).isNotNull();
        assertThat(users.size()).isEqualTo(3);
        assertThat(users).contains(USER1, USER2, USER3);
    }

    @Test
    public void testLdapGetUsersNoResult() {
        login(USER_LDAP_DB);
        List<LdapUser> users = appLdap.target("/ldap/users?name=alexandre").request()
                .get(new GenericType<List<LdapUser>>() {
                });

        assertThat(users).isNotNull();
        assertThat(users.size()).isEqualTo(0);
    }

    @Test
    public void testLdapGetUsersNoParameter() {
        login(USER_LDAP_DB);
        Response get = appLdap.target("/ldap/users").request().get();
        assertThat(get.getStatus()).isEqualTo(400); // bad request
    }

    @Test
    public void testLdapGetUsersEmptyName() {
        login(USER_LDAP_DB);
        Response get = appLdap.target("/ldap/users?name=").request().get();
        assertThat(get.getStatus()).isEqualTo(400); // bad request
    }

    @Test
    public void testLdapGetUsersInjection() {
        login(USER_LDAP_DB);
        Response get = appLdap.target("/ldap/users?name=)(cn=").request().get();
        assertThat(get.getStatus()).isEqualTo(400); // bad request
    }
}
