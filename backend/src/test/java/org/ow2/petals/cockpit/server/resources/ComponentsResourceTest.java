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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.core.Response;

import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;

import io.dropwizard.testing.junit.ResourceTestRule;

public class ComponentsResourceTest extends AbstractDefaultWorkspaceResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ComponentsResource.class);

    @Test
    public void getExistingComponentForbidden() {
        // TODO check assumptions
        Response get = resources.target("/components/" + getId(fComponent)).request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingComponent() {
        // TODO check assumptions
        ComponentOverview get = resources.target("/components/" + getId(component)).request()
                .get(ComponentOverview.class);
    }

    @Test
    public void getNonExistingComponentNotFound() {
        // TODO check assumptions
        Response get = resources.target("/components/313249238").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
