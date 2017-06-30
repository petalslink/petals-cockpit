/**
 * Copyright (C) 2017 Linagora
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
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.UserSession.CurrentUser;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;
import org.ow2.petals.cockpit.server.rules.CockpitApplicationRule;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class AbstractSecurityTest extends AbstractTest {

    public static final NewUser ADMIN = new NewUser("admin", "adminpass", "Administrator");

    public static final NewUser USER = new NewUser("user", "userpass", "Normal user");

    @Rule
    public final CockpitApplicationRule app = new CockpitApplicationRule();

    protected void addUser(String username) {
        addUser(new NewUser(username, username, "..."), false);
    }

    protected void addUser(NewUser user, boolean isAdmin) {
        app.db().executeInsert(new UsersRecord(user.username, new BCryptPasswordEncoder().encode(user.password),
                user.name, null, isAdmin));
    }

    @Before
    public void setUpDb() {
        addUser(ADMIN, true);
        addUser(USER, false);
    }

    protected Response login(Authentication auth) {
        return this.app.target("/user/session").request()
                // we need another object because we can have subclasses passed to this method
                .post(Entity.json(new Authentication(auth.username, auth.password)));
    }

    protected void assertMatches(CurrentUser user, NewUser expected, boolean isAdmin) {
        assertThat(user.id).isEqualTo(expected.username);
        assertThat(user.name).isEqualTo(expected.name);
        assertThat(user.isAdmin).isEqualTo(isAdmin);
    }
}