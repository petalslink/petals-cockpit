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
package org.ow2.petals.cockpit.server.security;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.core.Response;

import org.junit.Test;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.resources.UserSession.CurrentUser;

/**
 * Could not consistently run these test without making UserSessionTest and UsersResourceSecurityTest fail as side
 * effect... Something to do with CockpitApplicationRule instantiating conflicting DropwizardAppRule (I suppose).
 * 
 * As a workaround, the tests are run alphabetically and a Z was added to make it run last ... see:
 * https://groups.google.com/forum/#!topic/dropwizard-user/hb79pf_gXjg
 */
public class ZLdapUserSessionTest extends AbstractLdapTest {

    @Test
    public void testLDAPProtectedUserSucceedAfterLogin() {
        final Response get = this.appLdap.target("/user").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final CurrentUser login = login(USER_LDAP_DB).readEntity(CurrentUser.class);
        assertMatches(login, USER_LDAP_DB, true);

        final CurrentUser get2 = this.appLdap.target("/user").request().get(CurrentUser.class);
        assertMatches(get2, USER_LDAP_DB, true);

        final CurrentUser get3 = this.appLdap.target("/user/session").request().get(CurrentUser.class);
        assertMatches(get3, USER_LDAP_DB, true);
    }

    @Test
    public void testLDAPLoginNotAdmin() {
        this.addUser(USER_LDAP_NODB, false);
        final CurrentUser login = login(USER_LDAP_NODB).readEntity(CurrentUser.class);
        assertMatches(login, USER_LDAP_NODB, false);
    }

    @Test
    public void testLDAPLoginUnknownUser() {
        assertThat(userIsInDb(USER_NOLDAP_NODB.username)).isFalse();
        final Response login = login(new Authentication(USER_NOLDAP_NODB.username, USER_NOLDAP_NODB.password));
        assertThat(login.getStatus()).isEqualTo(401);
        assertThat(userIsInDb(USER_LDAP_NODB.username)).isFalse();
    }

    @Test
    public void testLDAPLoginDbOnlyUser() {
        assertThat(userIsInDb(USER_NOLDAP_DB.username)).isTrue();
        final Response login = login(new Authentication(USER_NOLDAP_DB.username, USER_NOLDAP_DB.password));
        assertThat(login.getStatus()).isEqualTo(401);
        assertThat(userIsInDb(USER_NOLDAP_DB.username)).isTrue();
    }

    @Test
    public void testLDAPLoginLdapOnlyUser() {
        assertThat(userIsInDb(USER_LDAP_NODB.username)).isFalse();

        final Response login = login(USER_LDAP_NODB);
        assertThat(login.getStatus()).isEqualTo(200);

        CurrentUser user = login.readEntity(CurrentUser.class);
        assertMatches(user, USER_LDAP_NODB, false);

        assertThat(userIsInDb(USER_LDAP_NODB.username)).isTrue();
    }

    @Test
    public void testLDAPGlobalFilterWorks() {
        final Response get = this.appLdap.target("/workspaces").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final CurrentUser login = login(USER_LDAP_DB).readEntity(CurrentUser.class);
        assertMatches(login, USER_LDAP_DB, true);

        final Response get2 = this.appLdap.target("/workspaces").request().get();
        assertThat(get2.getStatus()).isEqualTo(200);
    }

    @Test
    public void testLDAPLogout() {
        final CurrentUser login = login(USER_LDAP_DB).readEntity(CurrentUser.class);
        assertMatches(login, USER_LDAP_DB, true);

        final CurrentUser get = this.appLdap.target("/user/session").request().get(CurrentUser.class);
        assertMatches(get, USER_LDAP_DB, true);

        final Response logout = this.appLdap.target("/user/session").request().delete();
        // TODO should be 204: https://github.com/pac4j/pac4j/issues/701
        assertThat(logout.getStatus()).isEqualTo(200);

        final Response getWrong = this.appLdap.target("/user/session").request().get();
        assertThat(getWrong.getStatus()).isEqualTo(401);
    }
}
