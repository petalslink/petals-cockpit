/**
 * Copyright (C) 2016 Linagora
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

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.grizzly.http.server.util.Globals;
import org.glassfish.jersey.client.ClientProperties;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;
import org.ow2.petals.cockpit.server.mocks.MockAuthenticator;
import org.ow2.petals.cockpit.server.resources.UserSession.User;
import org.ow2.petals.cockpit.server.security.CockpitExtractor.Authentication;
import org.zapodot.junit.db.EmbeddedDatabaseRule;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.testing.ConfigOverride;
import io.dropwizard.testing.ResourceHelpers;
import io.dropwizard.testing.junit.DropwizardAppRule;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.ClassLoaderResourceAccessor;

public class UserSessionTest {

    public static final String SESSION_COOKIE_NAME = Globals.SESSION_COOKIE_NAME;

    public static class App extends CockpitApplication<CockpitConfiguration> {
        // only needed because of generics
    }

    @Rule
    public EmbeddedDatabaseRule dbRule = EmbeddedDatabaseRule.builder().build();

    @Rule
    public final DropwizardAppRule<CockpitConfiguration> appRule = new DropwizardAppRule<>(App.class,
            ResourceHelpers.resourceFilePath("user-session-tests.yml"),
            ConfigOverride.config("database.url", () -> dbRule.getConnectionJdbcUrl()));

    @Nullable
    private Client client;

    @Before
    public void setUpClient() {
        client = new JerseyClientBuilder(appRule.getEnvironment()).build("test client")
                // sometimes it fails with the default value...
                .property(ClientProperties.READ_TIMEOUT, 1000);
    }

    @Before
    public void setUpDb() throws LiquibaseException {
        // we need a valid empty db for those tests
        new Liquibase("migrations.xml", new ClassLoaderResourceAccessor(), new JdbcConnection(dbRule.getConnection()))
                .update("");
    }

    public Client client() {
        assert client != null;
        return client;
    }

    private Builder request() {
        // jersey client does not keep cookies in redirect...
        return client().target(url("user/session")).property(ClientProperties.FOLLOW_REDIRECTS, false).request();
    }

    private String url(String url) {
        return String.format("http://localhost:%d/api/%s", appRule.getLocalPort(), url);
    }

    @Test
    public void testProtectedUserFail() {
        Response get = client().target(url("user")).request().get();

        assertThat(get.getStatus()).isEqualTo(401);
    }

    @Test
    public void testProtectedUserSucceedAfterLogin() {
        final Response login = request().post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(302);
        final NewCookie cookie = login.getCookies().get(SESSION_COOKIE_NAME);
        assertThat(cookie).isNotNull();

        Response get = client().target(url("user")).request().cookie(cookie).get();
        assertThat(get.getStatus()).isEqualTo(200);
        assertThat(get.readEntity(User.class)).isEqualToComparingFieldByField(MockAuthenticator.ADMIN);
    }

    @Test
    public void testCorrectLogin() {
        final Response login = request().post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(302);
        final NewCookie cookie = login.getCookies().get(SESSION_COOKIE_NAME);
        assertThat(cookie).isNotNull();

        final Response get = request().cookie(cookie).get();
        assertThat(get.getStatus()).isEqualTo(200);
        assertThat(get.readEntity(User.class)).isEqualToComparingFieldByField(MockAuthenticator.ADMIN);
    }

    @Test
    public void testWrongLogin() {
        final Response login = request().post(Entity.json(new Authentication("wrong", "admin")));

        assertThat(login.getStatus()).isEqualTo(302);
        final NewCookie cookie = login.getCookies().get(SESSION_COOKIE_NAME);
        // even in case of failure, pac4j registers a session!
        assertThat(cookie).isNotNull();

        final Response get = request().cookie(cookie).get();
        assertThat(get.getStatus()).isEqualTo(401);
    }

    @Test
    public void testGetNoSession() {
        final Response get = request().get();

        assertThat(get.getStatus()).isEqualTo(401);
    }

    @Test
    public void testLogout() {
        final Response login = request().post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(302);
        final NewCookie cookie = login.getCookies().get(SESSION_COOKIE_NAME);
        assertThat(cookie).isNotNull();

        final Response get = request().cookie(cookie).get();
        assertThat(get.getStatus()).isEqualTo(200);
        assertThat(get.readEntity(User.class)).isEqualToComparingFieldByField(MockAuthenticator.ADMIN);

        final Response logout = request().cookie(cookie).delete();
        // TODO should be 204: https://github.com/pac4j/pac4j/issues/701
        assertThat(logout.getStatus()).isEqualTo(200);

        final Response getWrong = request().cookie(cookie).get();
        assertThat(getWrong.getStatus()).isEqualTo(401);
    }
}
