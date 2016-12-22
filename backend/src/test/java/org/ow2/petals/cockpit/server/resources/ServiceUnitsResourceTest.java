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

import javax.ws.rs.core.Response;

import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;

import io.dropwizard.testing.junit.ResourceTestRule;

public class ServiceUnitsResourceTest extends AbstractReadOnlyResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ServiceUnitsResource.class);

    @Test
    public void getExistingSUForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/serviceunits/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingSU() {
        // TODO check assumptions
        ServiceUnitOverview get = resources.getJerseyTest().target("/serviceunits/40").request()
                .get(ServiceUnitOverview.class);

        assertThat(get.id).isEqualTo(40);
        assertThat(get.name).isEqualTo(serviceUnit.getName());
        assertThat(get.state.toString()).isEqualTo(serviceAssembly.getState().toString());
        assertThat(get.saName).isEqualTo(serviceAssembly.getName());
    }

    @Test
    public void getNonExistingServiceUnitNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/serviceunits/41").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
