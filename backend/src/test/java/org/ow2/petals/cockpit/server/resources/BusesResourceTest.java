/**
 * Copyright (C) 2016-2020 Linagora
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
import org.ow2.petals.cockpit.server.resources.BusesResource.BusOverview;

@SuppressWarnings("null")
public class BusesResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public BusesResourceTest() {
        super(BusesResource.class);
    }

    @Test
    public void getExistingBusForbidden() {
        // TODO check assumptions
        Response get = resource.target("/buses/" + getId(fDomain)).request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getNonExistingBusNotFound() {
        // TODO check assumptions
        Response get = resource.target("/buses/32432").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getExistingBus() {
        // TODO check assumptions
        BusOverview get = resource.target("/buses/" + getId(domain)).request().get(BusOverview.class);

        assertThat(get).isNotNull();
    }
}
