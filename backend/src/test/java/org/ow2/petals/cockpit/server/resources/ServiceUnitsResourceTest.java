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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.core.Response;

import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;

public class ServiceUnitsResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public ServiceUnitsResourceTest() {
        super(ServiceUnitsResource.class);
    }

    @Test
    public void getExistingSUForbidden() {
        // TODO check assumptions
        Response get = resource.target("/serviceunits/" + getId(fServiceUnit)).request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingSU() {
        // TODO check assumptions
        ServiceUnitOverview get = resource.target("/serviceunits/" + getId(serviceUnit)).request()
                .get(ServiceUnitOverview.class);
    }

    @Test
    public void getNonExistingSUNotFound() {
        // TODO check assumptions
        Response get = resource.target("/serviceunits/419832492").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
