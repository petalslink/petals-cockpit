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
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyOverview;

import io.dropwizard.testing.junit.ResourceTestRule;

public class ServiceAssembliesResourceTest extends AbstractDefaultWorkspaceResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ServiceAssembliesResource.class);

    @Test
    public void getExistingSAForbidden() {
        // TODO check assumptions
        Response get = resources.target("/serviceassemblies/" + getId(fServiceAssembly)).request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingSA() {
        // TODO check assumptions
        ServiceAssemblyOverview get = resources.target("/serviceassemblies/" + getId(serviceAssembly)).request()
                .get(ServiceAssemblyOverview.class);
    }

    @Test
    public void getNonExistingSANotFound() {
        // TODO check assumptions
        Response get = resources.target("/serviceassemblies/4139439").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
