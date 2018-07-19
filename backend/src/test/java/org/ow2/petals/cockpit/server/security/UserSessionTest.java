/**
 * Copyright (C) 2016-2018 Linagora
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

public class UserSessionTest extends AbstractSecurityTest {

    @Test
    public void protectedUserSucceedAfterLogin() {
        final Response get = app.target("/user").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final CurrentUser login = login(ADMIN).readEntity(CurrentUser.class);
        assertMatches(login, ADMIN, true);

        final CurrentUser get2 = app.target("/user").request().get(CurrentUser.class);
        assertMatches(get2, ADMIN, true);

        final CurrentUser get3 = app.target("/user/session").request().get(CurrentUser.class);
        assertMatches(get3, ADMIN, true);
    }

    @Test
    public void loginUser() {
        final CurrentUser login = login(USER).readEntity(CurrentUser.class);
        assertMatches(login, USER, false);
    }

    @Test
    public void globalFilterWorks() {
        final Response get = app.target("/workspaces").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final CurrentUser login = login(ADMIN).readEntity(CurrentUser.class);
        assertMatches(login, ADMIN, true);

        final Response get2 = app.target("/workspaces").request().get();
        assertThat(get2.getStatus()).isEqualTo(200);
    }

    @Test
    public void wrongLogin() {
        final Response login = login(new Authentication("wrong", "admin"));
        assertThat(login.getStatus()).isEqualTo(401);
    }

    @Test
    public void logout() {
        final CurrentUser login = login(ADMIN).readEntity(CurrentUser.class);
        assertMatches(login, ADMIN, true);

        final CurrentUser get = app.target("/user/session").request().get(CurrentUser.class);
        assertMatches(get, ADMIN, true);

        final Response logout = app.target("/user/session").request().delete();
        // TODO should be 204: https://github.com/pac4j/pac4j/issues/701
        assertThat(logout.getStatus()).isEqualTo(200);

        final Response getWrong = app.target("/user/session").request().get();
        assertThat(getWrong.getStatus()).isEqualTo(401);
    }
}
