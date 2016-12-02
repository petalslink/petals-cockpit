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

import java.util.Arrays;

import javax.ws.rs.core.Response;

import org.assertj.core.data.MapEntry;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusOverview;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.ow2.petals.cockpit.server.security.MockProfileParamValueFactoryProvider;

import com.google.common.collect.ImmutableMap;

import javaslang.Tuple;

public class WorkspaceResourceTest extends AbstractWorkspacesResourceTest {

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container1 = new Container("cont", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Container container2 = new Container("cont", "host2", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Container container3 = new Container("cont", "host3", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.UNREACHABLE);

    @Before
    public void setup() {
        // petals
        petals.registerDomain(domain);
        petals.registerContainer(container1);
        petals.registerContainer(container2);
        petals.registerContainer(container3);

        // forbidden workspace (also not registered in petals)
        setupWorkspace(2, "test2",
                Arrays.asList(Tuple.of(2L, new Domain("dom2"), "",
                        Arrays.asList(Tuple.of(2L, new Container("cont2", "",
                                ImmutableMap.of(PortType.JMX, containerPort), "", "", State.REACHABLE))))),
                "anotherusers");

        // test workspace
        setupWorkspace(1, "test", Arrays.asList(Tuple.of(10L, domain, "phrase",
                Arrays.asList(Tuple.of(20L, container1), Tuple.of(21L, container2), Tuple.of(22L, container3)))),
                MockProfileParamValueFactoryProvider.ADMIN.username);
    }

    @Test
    public void getNonExistingWorkspaceNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/3").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getWorkspaceForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingBusForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2/buses/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getNonExistingBusForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2/buses/3").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingContainerForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2/buses/2/containers/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getNonExistingContainerForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2/buses/2/containers/3").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingWorkspace() {
        // TODO check assumptions
        WorkspaceTree tree = resources.getJerseyTest().target("/workspaces/1").request().get(WorkspaceTree.class);

        assertThat(tree.id).isEqualTo(1);
        assertThat(tree.name).isEqualTo("test");
        assertThat(tree.buses).hasSize(1);
        BusTree b = tree.buses.get(0);
        assert b != null;
        assertThat(b.id).isEqualTo(10);
        assertThat(b.name).isEqualTo(domain.getName());
        assertThat(b.containers).hasSize(3);

        ContainerTree c1 = b.containers.get(0);
        assert c1 != null;
        assertThat(c1.id).isEqualTo(20);
        assertThat(c1.name).isEqualTo(container1.getContainerName());

        ContainerTree c2 = b.containers.get(1);
        assert c2 != null;
        assertThat(c2.id).isEqualTo(21);
        assertThat(c2.name).isEqualTo(container2.getContainerName());

        ContainerTree c3 = b.containers.get(2);
        assert c3 != null;
        assertThat(c3.id).isEqualTo(22);
        assertThat(c3.name).isEqualTo(container3.getContainerName());
    }

    @Test
    public void getNonExistingBusNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/1/buses/1").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getNonExistingBusContainerNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/1/buses/1/container/1").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getExistingBus() {
        // TODO check assumptions
        BusOverview get = resources.getJerseyTest().target("/workspaces/1/buses/10").request().get(BusOverview.class);

        assertThat(get.name).isEqualTo(domain.getName());
    }

    @Test
    public void getExistingContainer() {
        // TODO check assumptions
        ContainerOverview get = resources.getJerseyTest().target("/workspaces/1/buses/10/containers/21").request()
                .get(ContainerOverview.class);

        assertThat(get.name).isEqualTo(container2.getContainerName());
        assertThat(get.ip).isEqualTo(container2.getHost());
        assertThat(get.port).isEqualTo(containerPort);
        assertThat(get.reachabilities).containsOnly(
                MapEntry.entry(container1.getContainerName(), container1.getState().toString()),
                MapEntry.entry(container3.getContainerName(), container3.getState().toString()));
    }

    @Test
    public void getNonExistingContainerNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/1/buses/10/containers/1").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
