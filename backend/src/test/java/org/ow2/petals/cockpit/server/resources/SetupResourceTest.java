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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.SetupResource.UserSetup;
import org.ow2.petals.cockpit.server.rules.CockpitResourceRule;

public class SetupResourceTest extends AbstractCockpitResourceTest {

    public SetupResourceTest() {
        super(SetupResource.class);
    }

    @Test
    public void testDisabled() {
        Response post = resource.target("/setup").request()
                .post(Entity.json(new UserSetup(CockpitResourceRule.ADMIN_TOKEN, "user", "pass", "name")));

        assertThat(post.getStatus()).isEqualTo(404);
    }

    @Test
    public void testForbiddenEvenIfDisabled() {
        Response post = resource.target("/setup").request()
                .post(Entity.json(new UserSetup("wrong", "user", "pass", "name")));

        assertThat(post.getStatus()).isEqualTo(403);
    }

    @Test
    public void testForbidden() {
        resource.db().deleteFrom(USERS).execute();
        assertThat(table(USERS)).hasNumberOfRows(0);

        Response post = resource.target("/setup").request().post(Entity.json(new UserSetup("wrong", "b", "c", "d")));

        assertThat(post.getStatus()).isEqualTo(403);
    }

    @Test
    public void testSuccessAndGone() {
        resource.db().deleteFrom(USERS).where(USERS.USERNAME.eq(ADMIN)).execute();
        assertThat(table(USERS)).hasNumberOfRows(0);

        Response post = resource.target("/setup").request()
                .post(Entity.json(new UserSetup(CockpitResourceRule.ADMIN_TOKEN, "user", "pass", "name")));

        assertThat(post.getStatus()).isEqualTo(204);

        assertThat(requestUser("user")).hasNumberOfRows(1);

        Response post2 = resource.target("/setup").request()
                .post(Entity.json(new UserSetup(CockpitResourceRule.ADMIN_TOKEN, "user", "pass", "name")));

        assertThat(post2.getStatus()).isEqualTo(404);
    }
}
