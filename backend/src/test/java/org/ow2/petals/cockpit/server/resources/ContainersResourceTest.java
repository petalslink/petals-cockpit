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

import org.assertj.core.data.MapEntry;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerOverview;

import io.dropwizard.testing.junit.ResourceTestRule;

public class ContainersResourceTest extends AbstractDefaultWorkspaceResourceTest {

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ContainersResource.class);

    @Test
    public void getExistingContainerForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/containers/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingContainer() {
        // TODO check assumptions
        ContainerOverview get = resources.getJerseyTest().target("/containers/21").request()
                .get(ContainerOverview.class);

        assertThat(get.id).isEqualTo(21);
        assertThat(get.name).isEqualTo(container2.getContainerName());
        assertThat(get.ip).isEqualTo(container2.getHost());
        assertThat(get.port).isEqualTo(containerPort);
        assertThat(get.reachabilities).containsOnly(MapEntry.entry("20", container1.getState().name()),
                MapEntry.entry("22", container3.getState().name()));
        assertThat(get.systemInfo).isEqualTo(SYSINFO);
    }

    @Test
    public void getNonExistingContainerNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/containers/1").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
