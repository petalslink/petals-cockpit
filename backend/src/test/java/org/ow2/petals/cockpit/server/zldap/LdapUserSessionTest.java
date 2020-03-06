/**
 * Copyright (C) 2018-2020 Linagora
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

import javax.ws.rs.core.Response;

import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.resources.UserSession.CurrentUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Could not consistently run these test without making UserSessionTest and UsersResourceSecurityTest fail as side
 * effect... Something to do with CockpitApplicationRule instantiating conflicting DropwizardAppRule (I suppose).
 *
 * As a workaround, the tests are run alphabetically and a Z was added to make it run last ... see:
 * https://groups.google.com/forum/#!topic/dropwizard-user/hb79pf_gXjg
 */
public class LdapUserSessionTest extends AbstractLdapTest {

    Logger log = LoggerFactory.getLogger(LdapUserSessionTest.class);

    @Before
    public void setUpDb() {
        addUser(ADMIN_LDAP_DB);
        addUser(USER_NOLDAP_DB);
    }

    @Test
    public void ldapProtectedUserSucceedAfterLogin() {
        final Response get = appLdap.target("/user").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final CurrentUser login = login(ADMIN_LDAP_DB).readEntity(CurrentUser.class);
        assertMatches(login, ADMIN_LDAP_DB, true);

        final CurrentUser get2 = appLdap.target("/user").request().get(CurrentUser.class);
        assertMatches(get2, ADMIN_LDAP_DB, true);

        final CurrentUser get3 = appLdap.target("/user/session").request().get(CurrentUser.class);
        assertMatches(get3, ADMIN_LDAP_DB, true);
    }

    @Test
    public void ldapLoginWrongPassword() {
        final Response login = login(new Authentication(ADMIN_LDAP_DB.username, "oops"));
        assertThat(login.getStatus()).isEqualTo(401);
    }

    @Test
    public void ldapLoginNotAdmin() {
        this.addUser(USER_LDAP_NODB);
        final CurrentUser login = login(USER_LDAP_NODB).readEntity(CurrentUser.class);
        assertMatches(login, USER_LDAP_NODB, false);
    }

    @Test
    public void ldapLoginUnknownUser() {
        assertThat(userIsInDb(USER_NOLDAP_NODB.username)).isFalse();
        final Response login = login(USER_NOLDAP_NODB.username, USER_NOLDAP_NODB.password);
        assertThat(login.getStatus()).isEqualTo(401);
        assertThat(userIsInDb(USER_LDAP_NODB.username)).isFalse();
    }

    @Test
    public void ldapLoginDbOnlyUser() {
        assertThat(userIsInDb(USER_NOLDAP_DB.username)).isTrue();
        final Response login = login(USER_NOLDAP_DB.username, USER_NOLDAP_DB.password);
        assertThat(login.getStatus()).isEqualTo(401);
        assertThat(userIsInDb(USER_NOLDAP_DB.username)).isTrue();
    }

    @Test
    public void ldapLoginLdapOnlyUser() {
        assertThat(userIsInDb(USER_LDAP_NODB.username)).isFalse();

        final Response login = login(USER_LDAP_NODB);
        assertThat(login.getStatus()).isEqualTo(200);

        CurrentUser user = login.readEntity(CurrentUser.class);
        assertMatches(user, USER_LDAP_NODB, false);

        assertThat(userIsInDb(USER_LDAP_NODB.username)).isTrue();
    }

    @Test
    public void ldapGlobalFilterWorks() {
        final Response get = appLdap.target("/workspaces").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final CurrentUser login = login(ADMIN_LDAP_DB).readEntity(CurrentUser.class);
        assertMatches(login, ADMIN_LDAP_DB, true);

        final Response get2 = appLdap.target("/workspaces").request().get();
        assertThat(get2.getStatus()).isEqualTo(200);
    }

    @Test
    public void ldapLogout() {
        final CurrentUser login = login(ADMIN_LDAP_DB).readEntity(CurrentUser.class);
        assertMatches(login, ADMIN_LDAP_DB, true);

        final CurrentUser get = appLdap.target("/user/session").request().get(CurrentUser.class);
        assertMatches(get, ADMIN_LDAP_DB, true);

        final Response logout = appLdap.target("/user/session").request().delete();
        assertThat(logout.getStatus()).isEqualTo(204);

        final Response getWrong = appLdap.target("/user/session").request().get();
        assertThat(getWrong.getStatus()).isEqualTo(401);
    }
}
