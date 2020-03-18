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
package org.ow2.petals.cockpit.server.zldap.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.NonNull;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.SystemOutRule;
import org.ow2.petals.cockpit.server.CockpitTestLogFilter;
import org.ow2.petals.cockpit.server.mocks.MockLdapServer;
import org.ow2.petals.cockpit.server.resources.SetupResource.UserSetup;
import org.ow2.petals.cockpit.server.zldap.AbstractLdapTest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LdapSetupResourceTest extends AbstractLdapTest {

    @Rule
    public final SystemOutRule systemOutRule = new SystemOutRule().enableLog();

    Logger log = LoggerFactory.getLogger(LdapSetupResourceTest.class);

    @Test
    public void setupWrongToken() {
        Response post = appLdap.target("/setup").request()
                .post(Entity.json(new UserSetup("wrongtoken", "user", null, null)));

        assertThat(post.getStatus()).isEqualTo(403); // Forbidden
    }

    @Test
    public void setupUserWithUserInDb() {
        addUser(MockLdapServer.LDAP_USER1.username);
        Response post = appLdap.target("/setup").request()
                .post(Entity.json(new UserSetup(getTokenFromLogs(), MockLdapServer.LDAP_USER2.username, null, null)));

        assertThat(post.getStatus()).isEqualTo(204); // Success: No Content
        assertThat(userIsInDb(MockLdapServer.LDAP_USER2.username)).isTrue();
        assertThat(userIsInDb(MockLdapServer.LDAP_USER1.username)).isTrue();
    }

    @Test
    public void setupUserWithAdminInDb() {
        addUser(MockLdapServer.LDAP_USER1);
        Response post = appLdap.target("/setup").request()
                .post(Entity.json(new UserSetup(getTokenFromLogs(), MockLdapServer.LDAP_USER2.username, null, null)));

        assertThat(post.getStatus()).isEqualTo(404); // Not Found
        assertThat(userIsInDb(MockLdapServer.LDAP_USER2.username)).isFalse();
        assertThat(userIsInDb(MockLdapServer.LDAP_USER1.username)).isTrue();
    }

    @Test
    public void setupUserNoLdapDb() {
        addUser(MockLdapServer.LDAP_USER2.username);
        Response post = appLdap.target("/setup").request()
                .post(Entity.json(new UserSetup(getTokenFromLogs(), USER_NOLDAP_DB.username, null, null)));

        assertThat(post.getStatus()).isEqualTo(409); // Conflict
    }

    @Test
    public void setupUserNoLdapNoDb() {
        Response post = appLdap.target("/setup").request()
                .post(Entity.json(new UserSetup(getTokenFromLogs(),
                        USER_NOLDAP_NODB.username, null, null)));

        assertThat(post.getStatus()).isEqualTo(409); // Conflict
    }

    @Test
    public void setupUserLdapDb() {
        addUser(MockLdapServer.LDAP_USER2.username);
        Response post = appLdap.target("/setup").request().post(Entity.json(
                new UserSetup(getTokenFromLogs(), MockLdapServer.LDAP_USER2.username, null, null)));

        assertThat(post.getStatus()).isEqualTo(409); // Conflict
    }

    @Test
    public void setupUserLdapTwice() {
        final String tokenFromLogs = getTokenFromLogs();

        Response post = appLdap.target("/setup").request().post(Entity.json(
                new UserSetup(tokenFromLogs, MockLdapServer.LDAP_USER1.username, null, null)));

        assertThat(post.getStatus()).isEqualTo(204); // Success: No Content
        assertThat(userIsInDb(MockLdapServer.LDAP_USER1.username)).isTrue();

        Response post2 = appLdap.target("/setup").request().post(Entity.json(
                new UserSetup(tokenFromLogs, MockLdapServer.LDAP_USER1.username, null, null)));

        assertThat(post2.getStatus()).isEqualTo(404); // Not Found
    }

    private @NonNull String getTokenFromLogs() {
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            log.error("Safety thread sleep failed : {}", e.getMessage());
        }

        String token = CockpitTestLogFilter.token;
        assertThat(token).isNotNull();
        assertThat(token.length()).isEqualTo(20);
        return token;
    }
}
