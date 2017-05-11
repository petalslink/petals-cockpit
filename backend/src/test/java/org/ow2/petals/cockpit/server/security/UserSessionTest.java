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

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.UserSession.User;
import org.ow2.petals.cockpit.server.rules.CockpitApplicationRule;
import org.ow2.petals.cockpit.server.security.CockpitExtractor.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserSessionTest extends AbstractTest {

    public static final User ADMIN = new User("admin", "Administrator", null);

    @Rule
    public final CockpitApplicationRule app = new CockpitApplicationRule();

    @Before
    public void setUpDb() {
        app.db().executeInsert(new UsersRecord(ADMIN.id, new BCryptPasswordEncoder().encode(ADMIN.id), ADMIN.name,
                ADMIN.lastWorkspace));
    }

    @Test
    public void testProtectedUserSucceedAfterLogin() {

        final Response get = this.app.target("/user").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final Response login = this.app.target("/user/session").request()
                .post(Entity.json(new Authentication("admin", "admin")));
        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response get2 = this.app.target("/user").request().get();
        assertThat(get2.getStatus()).isEqualTo(200);
        assertThat(get2.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response get3 = this.app.target("/user/session").request().get();
        assertThat(get3.getStatus()).isEqualTo(200);
        assertThat(get3.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);
    }

    @Test
    public void testGlobalFilterWorks() {
        final Response get = this.app.target("/workspaces").request().get();
        assertThat(get.getStatus()).isEqualTo(401);

        final Response login = this.app.target("/user/session").request()
                .post(Entity.json(new Authentication("admin", "admin")));
        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response get2 = this.app.target("/workspaces").request().get();
        assertThat(get2.getStatus()).isEqualTo(200);
    }

    @Test
    public void testWrongLogin() {
        final Response login = this.app.target("/user/session").request()
                .post(Entity.json(new Authentication("wrong", "admin")));
        assertThat(login.getStatus()).isEqualTo(401);
    }

    @Test
    public void testLogout() {
        final Response login = this.app.target("/user/session").request()
                .post(Entity.json(new Authentication("admin", "admin")));
        assertThat(login.getStatus()).isEqualTo(200);
        assertThat(login.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response getOk = this.app.target("/user/session").request().get();
        assertThat(getOk.getStatus()).isEqualTo(200);
        assertThat(getOk.readEntity(User.class)).isEqualToComparingFieldByField(ADMIN);

        final Response logout = this.app.target("/user/session").request().delete();
        // TODO should be 204: https://github.com/pac4j/pac4j/issues/701
        assertThat(logout.getStatus()).isEqualTo(200);

        final Response getWrong = this.app.target("/user/session").request().get();
        assertThat(getWrong.getStatus()).isEqualTo(401);
    }
}
