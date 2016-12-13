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
import static org.mockito.Mockito.verify;

import java.util.Arrays;

import javax.ws.rs.core.Response;

import org.assertj.core.data.MapEntry;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.mocks.MockProfileParamValueFactoryProvider;
import org.ow2.petals.cockpit.server.resources.BusResource.BusOverview;
import org.ow2.petals.cockpit.server.resources.ContainerResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.ContainerResource.ContainerOverview;
import org.ow2.petals.cockpit.server.resources.ContainerResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ComponentTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.SUTree;

import com.google.common.collect.ImmutableMap;

import javaslang.Tuple;

public class WorkspaceResourceTest extends AbstractWorkspacesResourceTest {

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container1 = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Container container2 = new Container("cont2", "host2", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Container container3 = new Container("cont3", "host3", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.UNREACHABLE);

    private final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED);

    private final ServiceUnit serviceUnit = new ServiceUnit("su", component.getName());

    private final ServiceAssembly serviceAssembly = new ServiceAssembly("sa", ArtifactState.State.STARTED, serviceUnit);

    @Before
    public void setup() {
        // petals
        petals.registerDomain(domain);
        petals.registerContainer(container1);
        petals.registerContainer(container2);
        petals.registerContainer(container3);
        petals.registerArtifact(component, container1);
        petals.registerArtifact(serviceAssembly, container1);

        // forbidden workspace (it is NOT registered in petals admin)
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(2L, new Domain("dom2"), "", Arrays.asList(Tuple.of(2L,
                new Container("cont2", "", ImmutableMap.of(PortType.JMX, containerPort), "", "", State.REACHABLE),
                Arrays.asList(Tuple.of(2L, new Component("", ComponentType.SE, ArtifactState.State.STARTED),
                        Arrays.asList(Tuple.of(2L,
                                new ServiceAssembly("", ArtifactState.State.STARTED, new ServiceUnit("", "")))))))))),
                "anotherusers");

        // test workspace
        setupWorkspace(1, "test",
                Arrays.asList(Tuple.of(10L, domain, "phrase",
                        Arrays.asList(
                                Tuple.of(20L, container1,
                                        Arrays.asList(Tuple.of(30L, component,
                                                Arrays.asList(Tuple.of(40L, serviceAssembly))))),
                                Tuple.of(21L, container2, Arrays.asList()),
                                Tuple.of(22L, container3, Arrays.asList())))),
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
    public void getExistingComponentForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2/buses/2/containers/2/components/2").request()
                .get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getNonExistingComponentForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/2/buses/2/containers/2/components/3").request()
                .get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingSUForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest()
                .target("/workspaces/2/buses/2/containers/2/components/2/serviceunits/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getNonExistingSUForbidden() {
        // TODO check assumptions
        Response get = resources.getJerseyTest()
                .target("/workspaces/2/buses/2/containers/2/components/2/serviceunits/3").request().get();

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
        assertThat(c1.components).hasSize(1);

        ContainerTree c2 = b.containers.get(1);
        assert c2 != null;
        assertThat(c2.id).isEqualTo(21);
        assertThat(c2.name).isEqualTo(container2.getContainerName());
        assertThat(c2.components).hasSize(0);

        ContainerTree c3 = b.containers.get(2);
        assert c3 != null;
        assertThat(c3.id).isEqualTo(22);
        assertThat(c3.name).isEqualTo(container3.getContainerName());
        assertThat(c3.components).hasSize(0);

        ComponentTree comp = c1.components.get(0);
        assert comp != null;
        assertThat(comp.id).isEqualTo(30);
        assertThat(comp.name).isEqualTo(component.getName());
        assertThat(comp.state.toString()).isEqualTo(component.getState().toString());
        assertThat(comp.serviceUnits).hasSize(1);

        SUTree su = comp.serviceUnits.get(0);
        assert su != null;
        assertThat(su.id).isEqualTo(40);
        assertThat(su.name).isEqualTo(serviceUnit.getName());
        assertThat(su.state.toString()).isEqualTo(serviceAssembly.getState().toString());
        assertThat(su.saName).isEqualTo(serviceAssembly.getName());

        // ensure that calling get workspace tree set the last workspace in the db
        verify(users).saveLastWorkspace(MockProfileParamValueFactoryProvider.ADMIN, 1);
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

        assertThat(get.id).isEqualTo(10);
        assertThat(get.name).isEqualTo(domain.getName());
    }

    @Test
    public void getExistingContainer() {
        // TODO check assumptions
        ContainerOverview get = resources.getJerseyTest().target("/workspaces/1/buses/10/containers/21").request()
                .get(ContainerOverview.class);

        assertThat(get.id).isEqualTo(21);
        assertThat(get.name).isEqualTo(container2.getContainerName());
        assertThat(get.ip).isEqualTo(container2.getHost());
        assertThat(get.port).isEqualTo(containerPort);
        assertThat(get.reachabilities).containsOnly(MapEntry.entry("20", container1.getState().name()),
                MapEntry.entry("22", container3.getState().name()));
    }

    @Test
    public void getNonExistingContainerNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/1/buses/10/containers/1").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getExistingComponent() {
        // TODO check assumptions
        ComponentOverview get = resources.getJerseyTest().target("/workspaces/1/buses/10/containers/20/components/30")
                .request().get(ComponentOverview.class);

        assertThat(get.id).isEqualTo(30);
        assertThat(get.name).isEqualTo(component.getName());
        assertThat(get.state.toString()).isEqualTo(component.getState().toString());
        assertThat(get.type.toString()).isEqualTo(component.getComponentType().toString());
    }

    @Test
    public void getNonExistingComponentNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest().target("/workspaces/1/buses/10/containers/20/components/31").request()
                .get();

        assertThat(get.getStatus()).isEqualTo(404);
    }

    @Test
    public void getExistingSU() {
        // TODO check assumptions
        ServiceUnitOverview get = resources.getJerseyTest()
                .target("/workspaces/1/buses/10/containers/20/components/30/serviceunits/40").request()
                .get(ServiceUnitOverview.class);

        assertThat(get.id).isEqualTo(40);
        assertThat(get.name).isEqualTo(serviceUnit.getName());
        assertThat(get.state.toString()).isEqualTo(serviceAssembly.getState().toString());
        assertThat(get.saName).isEqualTo(serviceAssembly.getName());
    }

    @Test
    public void getNonExistingServiceUnitNotFound() {
        // TODO check assumptions
        Response get = resources.getJerseyTest()
                .target("/workspaces/1/buses/10/containers/20/components/30/serviceunits/41").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
