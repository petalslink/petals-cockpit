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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.core.Feature;
import javax.ws.rs.core.FeatureContext;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.grizzly.http.server.util.Globals;
import org.glassfish.jersey.client.ClientProperties;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.junit.ClassRule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.representations.Authentication;
import org.ow2.petals.cockpit.server.representations.UserData;
import org.pac4j.core.config.Config;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.credentials.authenticator.Authenticator;
import org.pac4j.core.exception.BadCredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.jax.rs.features.Pac4JSecurityFeature;
import org.pac4j.jax.rs.features.jersey.Pac4JValueFactoryProvider;

import io.dropwizard.testing.junit.ResourceTestRule;

public class UserSessionTest {

    public static final String SESSION_COOKIE_NAME = Globals.SESSION_COOKIE_NAME;

    public static final UserData ADMIN = new UserData("admin", "Administrator");

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder()
            .setTestContainerFactory(new GrizzlyWebTestContainerFactory()).addResource(new UserSession())
            .addProvider(pac4jFeature()).build();

    private static Feature pac4jFeature() {
        final Config config = new Config();
        CockpitApplication.setupPac4J(config, new MockAuthenticator());

        return new Feature() {
            @Override
            public boolean configure(@Nullable FeatureContext context) {
                assert context != null;
                context.register(new Pac4JSecurityFeature(config));
                context.register(new Pac4JValueFactoryProvider.Binder(config));
                return true;
            }
        };
    }

    private static Builder request() {
        // jersey client does not keep cookies in redirect...
        return resources.getJerseyTest().target("/user/session").property(ClientProperties.FOLLOW_REDIRECTS, false)
                .request();
    }

    @Test
    public void testCorrectLogin() {
        final Response login = request().post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(302);
        final NewCookie cookie = login.getCookies().get(SESSION_COOKIE_NAME);
        assertThat(cookie).isNotNull();

        final Response get = request().cookie(cookie).get();
        assertThat(get.getStatus()).isEqualTo(200);
        assertThat(get.readEntity(UserData.class)).isEqualToComparingFieldByField(ADMIN);
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
        assertThat(get.readEntity(UserData.class)).isEqualToComparingFieldByField(ADMIN);

        final Response logout = request().cookie(cookie).delete();
        // TODO should be 204: https://github.com/pac4j/pac4j/issues/701
        assertThat(logout.getStatus()).isEqualTo(200);

        final Response getWrong = request().cookie(cookie).get();
        assertThat(getWrong.getStatus()).isEqualTo(401);
    }
}

class MockAuthenticator implements Authenticator<@Nullable UsernamePasswordCredentials> {

    @Override
    public void validate(@Nullable UsernamePasswordCredentials credentials, @Nullable WebContext context)
            throws HttpAction {
        assert context != null;
        assert credentials != null;
        if (UserSessionTest.ADMIN.getUsername().equals(credentials.getUsername())) {
            final CommonProfile userProfile = new CommonProfile();
            userProfile.setId(UserSessionTest.ADMIN.getUsername());
            userProfile.addAttribute("display_name", UserSessionTest.ADMIN.getName());
            credentials.setUserProfile(userProfile);
        } else {
            throw new BadCredentialsException("Bad credentials for: " + credentials.getUsername());
        }
    }
}
