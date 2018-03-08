/**
 * Copyright (C) 2018 Linagora
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

import org.assertj.core.api.SoftAssertions;
import org.junit.Test;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.resources.EndpointsResource.EndpointOverview;
import org.ow2.petals.cockpit.server.resources.InterfacesResource.InterfaceOverview;
import org.ow2.petals.cockpit.server.resources.ServicesResource.ServiceOverview;

public class ServicesResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public ServicesResourceTest() {
        super(ServicesResource.class, EndpointsResource.class, InterfacesResource.class);
    }

    @Test
    public void getExistingServiceForbidden() {
        resource.setCurrentProfile(new CockpitProfile(anotherUser, false));
        Response get = resource.target("/services/1").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingEndpointForbidden() {
        resource.setCurrentProfile(new CockpitProfile(anotherUser, false));
        Response get = resource.target("/endpoints/1").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingInterfaceForbidden() {
        resource.setCurrentProfile(new CockpitProfile(anotherUser, false));
        Response get = resource.target("/interfaces/1").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingService() {
        ServiceOverview get = resource.target("/services/" + resource.getService("serv1a")).request()
                .get(ServiceOverview.class);

        SoftAssertions a = new SoftAssertions();

        a.assertThat(get.endpoints).size().isEqualTo(2);
        a.assertThat(get.endpoints).contains(
                resource.getEndpoint("edp1a"), 
                resource.getEndpoint("edp3a"));
        
        a.assertThat(get.interfaces).size().isEqualTo(4);
        a.assertThat(get.interfaces).contains(
                resource.getInterface("int1"),
                resource.getInterface("int3"),
                resource.getInterface("int4"),
                resource.getInterface("int6"));
        a.assertAll();
    }

    @Test
    public void getExistingEndpoint() {
        EndpointOverview get = resource.target("/endpoints/" + resource.getEndpoint("edp1a")).request()
                .get(EndpointOverview.class);

        SoftAssertions a = new SoftAssertions();
        a.assertThat(get.service).isEqualTo(resource.getService("serv1a"));
        
        a.assertThat(get.interfaces).size().isEqualTo(3);
        a.assertThat(get.interfaces).contains(
                resource.getInterface("int1"),
                resource.getInterface("int3"),
                resource.getInterface("int4"));
        a.assertAll();
    }

    @Test
    public void getExistingInterface() {
        InterfaceOverview get = resource.target("/interfaces/" + resource.getInterface("int1")).request()
                .get(InterfaceOverview.class);

        SoftAssertions a = new SoftAssertions();
        
        a.assertThat(get.services).size().isEqualTo(2);
        a.assertThat(get.services).contains(
                resource.getService("serv1a"),
                resource.getService("serv1b"));
        
        a.assertThat(get.endpoints).size().isEqualTo(3);
        a.assertThat(get.endpoints).contains(
                resource.getEndpoint("edp1a"), 
                resource.getEndpoint("edp1b"), 
                resource.getEndpoint("edp3b"));
        a.assertAll();
    }

    @Test
    public void getNonExistingServiceNotFound() {
        Response get = resource.target("/services/313249238").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getNonExistingEndpointNotFound() {
        Response get = resource.target("/endpoints/313249238").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getNonExistingInterfaceNotFound() {
        Response get = resource.target("/interface/313249238").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

}
