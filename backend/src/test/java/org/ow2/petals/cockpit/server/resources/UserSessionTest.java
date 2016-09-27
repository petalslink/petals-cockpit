/**
 * Copyright (c) 2016 Linagora
 * 
 * This program/library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 2.1 of the License, or (at your
 * option) any later version.
 * 
 * This program/library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program/library; If not, see http://www.gnu.org/licenses/
 * for the GNU Lesser General Public License version 2.1.
 */
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.core.Feature;
import javax.ws.rs.core.FeatureContext;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.junit.ClassRule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.representations.Authentication;
import org.ow2.petals.cockpit.server.representations.UserData;
import org.ow2.petals.cockpit.server.security.CockpitAuthClient;
import org.pac4j.core.client.Clients;
import org.pac4j.core.config.Config;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.credentials.authenticator.Authenticator;
import org.pac4j.core.exception.BadCredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.jax.rs.features.Pac4JSecurityFeature;
import org.pac4j.jax.rs.features.jersey.Pac4JProfileValueFactoryProvider;

import io.dropwizard.testing.junit.ResourceTestRule;

public class UserSessionTest {

    static final UserData ADMIN = new UserData("admin", "Administrator");

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder()
            .setTestContainerFactory(new GrizzlyWebTestContainerFactory()).addResource(new UserSession())
            .addProvider(pac4jFeature()).build();

    private static Feature pac4jFeature() {
        final CockpitAuthClient cac = new CockpitAuthClient();
        cac.setAuthenticator(new MockAuthenticator());
        final Clients clients = new Clients(cac);
        // it seems needed for it to be used by the callback filter (because it does not have a
        // client name passed as parameter)
        clients.setDefaultClient(cac);
        // this will be used by SSO-type authenticators (appended with client name as parameter),
        // but for now we must give a value for pac4j to be happy
        clients.setCallbackUrl("/user/session");

        final Config config = new Config();
        config.setClients(clients);

        return new Feature() {
            @Override
            public boolean configure(@Nullable FeatureContext context) {
                assert context != null;
                context.register(new Pac4JSecurityFeature(config));
                context.register(new Pac4JProfileValueFactoryProvider.Binder(config));
                return true;
            }
        };
    }

    private static Builder request() {
        return resources.getJerseyTest().target("/user/session").request();
    }

    @Test
    public void testCorrectLogin() {
        final Response login = request().post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.getCookies().get("JSESSIONID")).isNotNull();
        assertThat(login.readEntity(UserData.class)).isEqualToComparingFieldByField(ADMIN);
    }

    @Test
    public void testWrongLogin() {
        final Response login = request().post(Entity.json(new Authentication("wrong", "admin")));

        assertThat(login.getStatus()).isEqualTo(401);
        assertThat(login.getCookies().get("JSESSIONID")).isNotNull();
    }

    @Test
    public void testGetNoSession() {
        final Response get = request().get();

        assertThat(get.getStatus()).isEqualTo(Status.UNAUTHORIZED.getStatusCode());
    }

    @Test
    public void testGetOkSession() {
        final Response login = request().post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.readEntity(UserData.class)).isEqualToComparingFieldByField(ADMIN);

        final NewCookie cookie = login.getCookies().get("JSESSIONID");

        assertThat(request().cookie(cookie).get(UserData.class)).isEqualToComparingFieldByField(ADMIN);
    }

    @Test
    public void testLogout() {
        final Response login = request().post(Entity.json(new Authentication("admin", "admin")));

        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.readEntity(UserData.class)).isEqualToComparingFieldByField(ADMIN);

        final NewCookie cookie = login.getCookies().get("JSESSIONID");

        final Response get = request().cookie(cookie).get();
        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(get.readEntity(UserData.class)).isEqualToComparingFieldByField(ADMIN);

        final Response logout = request().cookie(cookie).delete();
        assertThat(logout.getStatus()).isEqualTo(204);

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
