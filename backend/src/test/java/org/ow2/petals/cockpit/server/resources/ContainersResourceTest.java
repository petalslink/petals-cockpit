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
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerOverview;

public class ContainersResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public ContainersResourceTest() {
        super(ContainersResource.class);
    }

    @Test
    public void getExistingContainerForbidden() {
        // TODO check assumptions
        Response get = resource.target("/containers/" + getId(fContainer)).request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingContainer() {
        // TODO check assumptions
        ContainerOverview get = resource.target("/containers/" + getId(container2)).request()
                .get(ContainerOverview.class);

        assertThat(get.isReachable).isTrue();
        assertThat(get.ip).isEqualTo(container2.getHost());
        assertThat(get.port).isEqualTo(containerPort);
        assertThat(get.reachabilities).containsOnly("" + getId(container1));
        assertThat(get.systemInfo).isEqualTo(SYSINFO);
    }

    @Test
    public void getExistingContainerUnreachable() {
        ContainerOverview get = resource.target("/containers/" + getId(container3)).request()
                .get(ContainerOverview.class);

        assertThat(get.isReachable).isFalse();
        assertThat(get.ip).isEqualTo(container3.getHost());
        assertThat(get.port).isEqualTo(containerPort);
        assertThat(get.reachabilities).isNull();
        assertThat(get.systemInfo).isNull();
    }

    @Test
    public void getNonExistingContainerNotFound() {
        // TODO check assumptions
        Response get = resource.target("/containers/342942").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

}
