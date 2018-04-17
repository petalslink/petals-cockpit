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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.sse.EventInput;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.endpoint.Endpoint;
import org.ow2.petals.admin.endpoint.Endpoint.EndpointType;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentStateChanged;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAStateChanged;

import com.google.common.collect.ImmutableMap;

import javaslang.Tuple;

public class ServicesListTest extends AbstractBasicResourceTest {

    private long wkspId = 1L;
    private final Domain domain = new Domain("dom");
    private final int containerPort = 7700;
    private final Container container = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Component component11 = new Component("comp1", ComponentType.SE, ArtifactState.State.STARTED);

    private final ServiceUnit serviceUnit11 = new ServiceUnit("su11", component11.getName());
    private final ServiceAssembly serviceAssembly11 = new ServiceAssembly("sa11", ArtifactState.State.STARTED,
            serviceUnit11);

    private final ServiceUnit serviceUnit12 = new ServiceUnit("su12", component11.getName());
    private final ServiceAssembly serviceAssembly12 = new ServiceAssembly("sa12", ArtifactState.State.SHUTDOWN,
            serviceUnit12);

    private final ServiceUnit serviceUnit13 = new ServiceUnit("su13", component11.getName());

    private final ServiceAssembly serviceAssembly13 = new ServiceAssembly("sa13", ArtifactState.State.STOPPED,
            serviceUnit13);

    private final Component component12 = new Component("comp2", ComponentType.SE, ArtifactState.State.STOPPED);

    private final Component component13 = new Component("comp3", ComponentType.SE, ArtifactState.State.SHUTDOWN);

    private final List<Endpoint> referenceEndpoints = filterContainer("cont1", makeEndpoints());

    private final Container container2 = new Container("cont2", "host2", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Component component21 = new Component("comp1", ComponentType.BC, ArtifactState.State.STARTED);

    private final Component component22 = new Component("comp2", ComponentType.BC, ArtifactState.State.SHUTDOWN);

    public ServicesListTest() {
        super(ServicesResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerArtifact(component11, container);
        resource.petals.registerArtifact(serviceAssembly11, container);
        resource.petals.registerArtifact(serviceAssembly12, container);
        resource.petals.registerArtifact(serviceAssembly13, container);
        resource.petals.registerArtifact(component12, container);
        resource.petals.registerArtifact(component13, container);

        resource.petals.registerContainer(container2);
        resource.petals.registerArtifact(component21, container2);
        resource.petals.registerArtifact(component22, container2);

        resource.petals.registerEndpoints(referenceEndpoints);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);

    }

    @Test
    public void workspaceFetchesServices() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });
        }
    }

    @Test
    public void changeOnSAStartFromStopped() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });
            addEndpointsToReference(5);

            changeSaState(serviceAssembly12, ServiceAssemblyMin.State.Started);

            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
        assertThatSAState(serviceAssembly12, ArtifactState.State.STARTED);
    }

    @Test
    public void changeOnSAUnloadFromShutdown() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            removeEndpointsFromReference(3);
            changeSaState(serviceAssembly12, ServiceAssemblyMin.State.Unloaded);

            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
        assertNoDbSA(serviceAssembly12);
        assertThat(container.getServiceAssemblies()).doesNotContain(serviceAssembly12);
    }

    @Test
    public void changeOnSAUnloadFromStopped() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            removeEndpointsFromReference(3);
            changeSaState(serviceAssembly13, ServiceAssemblyMin.State.Unloaded);

            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
        assertNoDbSA(serviceAssembly13);
        assertThat(container.getServiceAssemblies()).doesNotContain(serviceAssembly13);
    }

    @Test
    public void noChangeOnSAStop() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            changeSaState(serviceAssembly11, ServiceAssemblyMin.State.Stopped);

            expectNoServicesUpdated(eventInput);
        }
        assertThatSAState(serviceAssembly11, ArtifactState.State.STOPPED);
    }

    @Test
    public void changeOnComponentStartFromShutdown() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });
            addEndpointsToReference(5);

            changeCompState(component13, ComponentMin.State.Started);

            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
        assertThatComponentState(component13, ArtifactState.State.STARTED);
    }

    @Test
    public void changeOnComponentUnload() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            removeEndpointsFromReference(2);

            changeCompState(component12, ComponentMin.State.Unloaded);

            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
        assertNoDbComponent(component12);
        assertThat(container.getComponents()).doesNotContain(component12);
    }


    @Test
    public void changeOnComponentUninstall() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            removeEndpointsFromReference(1);

            changeCompState(component12, ComponentMin.State.Loaded);

            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
        assertThatComponentState(component12, ArtifactState.State.LOADED);
    }

    @Test
    public void noChangeOnComponentStop() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            changeCompState(component11, ComponentMin.State.Stopped);

            expectNoServicesUpdated(eventInput);
        }
        assertThatComponentState(component11, ArtifactState.State.STOPPED);
    }

    @Test
    public void cannotFindMissingComponent() {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            changeCompState(component12, ComponentMin.State.Unloaded);

            // As it is already unloaded, services on comp2 should not be inserted and thus
            // not returned to client, even though returned by Petals API
            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, filterComponent("comp1", referenceEndpoints));
            });
        }
        assertNoDbComponent(component12);
        assertThat(container.getComponents()).doesNotContain(component12);
    }

    @Test
    public void allServicesDissapear() {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            referenceEndpoints.clear();

            changeCompState(component13, ComponentMin.State.Started);
            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });

        }
        assertThatComponentState(component13, ArtifactState.State.STARTED);
    }

    @Test
    public void manageEndpointsTwoContainers() {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            setReference(makeEndpoints());

            changeCompState(component22, ComponentMin.State.Started);
            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });

        }
        assertThatComponentState(component22, ArtifactState.State.STARTED);
    }

    @Test
    public void manageEndpointsMultipleInterfaces() {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            setReference(makeEndpointsMultipleInterfaces());

            changeCompState(component13, ComponentMin.State.Started);
            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
        assertThatComponentState(component13, ArtifactState.State.STARTED);
    }

    // TODO this test would be more relevant in an e2e integration test
    @Test
    public void complexSequenceTwoContainers() {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t.content, wkspId, referenceEndpoints);
            });

            // cont2 start exposing services
            setReference(makeEndpoints());

            changeCompState(component22, ComponentMin.State.Started);
            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });

            // cont1 stop exposing any services
            setReference(filterContainer("cont2", makeEndpoints()));

            changeCompState(component12, ComponentMin.State.Loaded);
            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });

            // cont1 start exposing again
            setReference(makeEndpoints());
            addEndpointsToReference(50);
            changeCompState(component12, ComponentMin.State.Shutdown);
            changeCompState(component12, ComponentMin.State.Started);
            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, wkspId, referenceEndpoints);
            });
        }
    }

    @Test
    public void refreshServices() {
        try (EventInput eventInput = resource.sse(1)) {

            Response post = resource.target("/workspaces/1/servicesrefresh/").request().post(null);

            expectServicesUpdatedAmongNext2(eventInput, (t, a) -> {
                assertWorkspaceContentForServices(a, t, 1, referenceEndpoints);
            });
        }
    }


    public void changeSaState(ServiceAssembly sa, ServiceAssemblyMin.State targetState) {
        SAStateChanged put = resource.target("/workspaces/1/serviceassemblies/" + getId(sa)).request()
                .put(Entity.json(new SAChangeState(targetState)), SAStateChanged.class);

        assertThat(put.state).isEqualTo(targetState);
    }

    public void changeCompState(Component comp, ComponentMin.State targetState) {
        ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(comp)).request()
                .put(Entity.json(new ComponentChangeState(targetState)), ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(targetState);
    }

    private List<Endpoint> makeEndpoints() {
        List<Endpoint> e = new ArrayList<Endpoint>();

        final EndpointType type = EndpointType.INTERNAL;
        e.add(new Endpoint("edp1a", type, "cont1", "comp1", "serv1a", Arrays.asList("int1")));
        e.add(new Endpoint("edp2a", type, "cont1", "comp1", "serv2a", Arrays.asList("int2")));
        e.add(new Endpoint("edp1b", type, "cont1", "comp2", "serv1b", Arrays.asList("int1")));
        e.add(new Endpoint("edp2b", type, "cont1", "comp2", "serv2b", Arrays.asList("int2")));
        e.add(new Endpoint("edp3a", type, "cont2", "comp1", "serv1a", Arrays.asList("int1")));
        e.add(new Endpoint("edp3b", type, "cont2", "comp2", "serv1b", Arrays.asList("int1")));
        e.add(new Endpoint("edp4a", type, "cont2", "comp1", "serv2a", Arrays.asList("int2")));
        e.add(new Endpoint("edp4b", type, "cont2", "comp2", "serv2b", Arrays.asList("int2")));

        return e;
    }

    private List<Endpoint> makeEndpointsMultipleInterfaces() {
        List<Endpoint> e = new ArrayList<Endpoint>();

        final EndpointType type = EndpointType.INTERNAL;
        e.add(new Endpoint("edp1a2", type, "cont1", "comp1", "serv1a", Arrays.asList("int1", "int3")));
        e.add(new Endpoint("edp2a2", type, "cont1", "comp1", "serv2a", Arrays.asList("int2", "int4", "int5")));
        e.add(new Endpoint("edp1b2", type, "cont1", "comp2", "serv1b", Arrays.asList("int1", "int3")));
        e.add(new Endpoint("edp2b2", type, "cont1", "comp2", "serv2b", Arrays.asList("int2")));

        return e;
    }
    
    private void addEndpointsToReference(int edpToAdd) {
        int target = edpToAdd + referenceEndpoints.size();
        for (int i = referenceEndpoints.size() + 1; i <= target; i++) {
            referenceEndpoints.add(new Endpoint("edp" + i, EndpointType.INTERNAL, "cont1", "comp1",
                    "{http://namespace.org/}serv" + i, Arrays.asList("{http://namespace.org/}int" + i)));
        }
    }

    private void removeEndpointsFromReference(int edpToRemove) {
        int target = referenceEndpoints.size() - edpToRemove;
        while (referenceEndpoints.size() > target) {
            if (referenceEndpoints.isEmpty()) {
                break;
            }
            referenceEndpoints.remove(referenceEndpoints.size() - 1);
        }
    }

    @SuppressWarnings("null")
    private List<Endpoint> filterContainer(String containerToKeep, List<Endpoint> endpoints) {
        return endpoints.stream().filter(e -> e.getContainerName().contains(containerToKeep))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    private List<Endpoint> filterComponent(String containerToKeep, List<Endpoint> endpoints) {
        return endpoints.stream().filter(e -> e.getComponentName().contains(containerToKeep))
                .collect(Collectors.toList());
    }

    private void setReference(List<Endpoint> endpoints) {
        referenceEndpoints.clear();
        referenceEndpoints.addAll(endpoints);
    }

}
