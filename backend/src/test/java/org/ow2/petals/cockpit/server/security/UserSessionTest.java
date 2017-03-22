/**
 * Copyright (C) 2016-2017 Linagora
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

import java.net.CookieHandler;
import java.net.CookieManager;
import java.sql.Connection;

import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.grizzly.http.server.util.Globals;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.junit.After;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.UserSession.User;
import org.ow2.petals.cockpit.server.security.CockpitExtractor.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.zapodot.junit.db.EmbeddedDatabaseRule;
import org.zapodot.junit.db.plugin.InitializationPlugin;
import org.zapodot.junit.db.plugin.LiquibaseInitializer;

import io.dropwizard.testing.ConfigOverride;
import io.dropwizard.testing.ResourceHelpers;
import io.dropwizard.testing.junit.DropwizardAppRule;

public class UserSessionTest extends AbstractTest {

    public static final String SESSION_COOKIE_NAME = Globals.SESSION_COOKIE_NAME;

    public static final User ADMIN = new User("admin", "Administrator", null);

    public static class App extends CockpitApplication<CockpitConfiguration> {
        // only needed because of generics
    }

    @ClassRule
    public static final EmbeddedDatabaseRule dbRule = EmbeddedDatabaseRule.builder()
            .initializedByPlugin(LiquibaseInitializer.builder().withChangelogResource("migrations.xml").build())
            .initializedByPlugin(new InitializationPlugin() {
                @Override
                public void connectionMade(@Nullable String name, @Nullable Connection connection) {
                    assert connection != null;
                    // we must use the JDBC URL because if not the insertion is only visible when accessing the db with
                    // connection.. https://github.com/zapodot/embedded-db-junit/issues/7
                    try (DSLContext using = DSL.using(dbRule.getConnectionJdbcUrl())) {
                        using.executeInsert(new UsersRecord(ADMIN.id, new BCryptPasswordEncoder().encode(ADMIN.id),
                                ADMIN.name, ADMIN.lastWorkspace));
                    }
                }
            }).build();

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    @Rule
    public final DropwizardAppRule<CockpitConfiguration> appRule = new DropwizardAppRule<>(App.class,
            ResourceHelpers.resourceFilePath("user-session-tests.yml"),
            ConfigOverride.config("database.url", () -> dbRule.getConnectionJdbcUrl()));

    @Before
    public void setUpCookieHandler() {
        // Used by Jersey Client to store cookies
        CookieHandler.setDefault(new CookieManager());
    }

    @After
    public void cleanUpCookieHandler() {
        CookieHandler.setDefault(null);
    }

    public WebTarget target(String url) {
        return appRule.client().target(String.format("http://localhost:%d/api%s", appRule.getLocalPort(), url));
    }

    @Test
    public void testProtectedUserSucceedAfterLogin() {

        final Response get = target("/user").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final Response login = target("/user/session").request()
                .post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response get2 = target("/user").request().get();
        assertThat(get2.getStatus()).isEqualTo(200);
        assertThat(get2.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response get3 = target("/user/session").request().get();
        assertThat(get3.getStatus()).isEqualTo(200);
        assertThat(get3.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);
    }

    @Test
    public void testWrongLogin() {
        final Response login = target("/user/session").request()
                .post(Entity.json(new Authentication("wrong", "admin")));
        assertThat(login.getStatus()).isEqualTo(401);
    }

    @Test
    public void testLogout() {
        final Response login = target("/user/session").request()
                .post(Entity.json(new Authentication("admin", "admin")));
        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response logout = target("/user/session").request().delete();
        // TODO should be 204: https://github.com/pac4j/pac4j/issues/701
        assertThat(logout.getStatus()).isEqualTo(200);

        final Response getWrong = target("/user/session").request().get();
        assertThat(getWrong.getStatus()).isEqualTo(401);
    }
}
