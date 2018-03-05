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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Before;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.endpoint.Endpoint;
import org.ow2.petals.admin.endpoint.Endpoint.EndpointType;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import javaslang.Tuple;

public abstract class AbstractDefaultWorkspaceResourceTest extends AbstractBasicResourceTest {

    protected static final String SYSINFO = "WORKSPACE TEST SYSINFO";

    protected final String anotherUser = "anotheruser";

    protected final Domain domain = new Domain("dom");

    protected final int containerPort = 7700;

    protected final Container container1 = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    protected final Container container2 = new Container("cont2", "host2", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    protected final Container container3 = new Container("cont3", "host3", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.UNREACHABLE);

    protected final SharedLibrary sharedLibrary = new SharedLibrary("sl", "1.0.0");

    protected final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED);

    protected final Component componentWithSL = new Component("compSL", ComponentType.SE,
            ArtifactState.State.STARTED, ImmutableSet.of(sharedLibrary.copy()));

    protected final ServiceUnit serviceUnit = new ServiceUnit("su", component.getName());

    protected final ServiceAssembly serviceAssembly = new ServiceAssembly("sa", ArtifactState.State.STARTED,
            serviceUnit);

    protected final Domain fDomain = new Domain("dom2");

    protected final Container fContainer = new Container("cont2", "", ImmutableMap.of(PortType.JMX, containerPort), "",
            "", State.REACHABLE);

    protected final Component fComponent = new Component("comp2", ComponentType.SE, ArtifactState.State.STARTED);

    protected final ServiceUnit fServiceUnit = new ServiceUnit("su2", "comp2");

    protected final ServiceAssembly fServiceAssembly = new ServiceAssembly("sa2", ArtifactState.State.STARTED,
            fServiceUnit);

    protected final SharedLibrary fSharedLibrary = new SharedLibrary("sl2", "1.0.0");

    protected final List<Endpoint> referenceEndpoints = makeEndpoints();

    public AbstractDefaultWorkspaceResourceTest(Class<?>... ressources) {
        super(ressources);
    }

    @Before
    public void setup() {
        // petals
        resource.petals.registerSystemInfo(SYSINFO);
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container1);
        resource.petals.registerContainer(container2);
        resource.petals.registerContainer(container3);
        resource.petals.registerArtifact(component, container1);
        resource.petals.registerArtifact(componentWithSL, container1);
        resource.petals.registerArtifact(serviceAssembly, container1);
        resource.petals.registerArtifact(sharedLibrary, container1);
        resource.petals.registerEndpoints(referenceEndpoints);

        addUser(anotherUser);

        // forbidden workspace (it is NOT registered in petals admin)
        fDomain.addContainers(fContainer);
        fContainer.addComponent(fComponent);
        fContainer.addServiceAssembly(fServiceAssembly);
        fContainer.addSharedLibrary(fSharedLibrary);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "passphrase")), anotherUser);

        // test workspace
        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
    }

    private List<Endpoint> makeEndpoints() {
        List<Endpoint> e = new ArrayList<Endpoint>();

        final EndpointType type = EndpointType.INTERNAL;
        e.add(new Endpoint("edp1a", type, "cont1", "comp", "serv1a", Arrays.asList("int1", "int3", "int4")));
        e.add(new Endpoint("edp2a", type, "cont1", "comp", "serv2a", Arrays.asList("int2")));
        e.add(new Endpoint("edp1b", type, "cont1", "comp", "serv1b", Arrays.asList("int1")));
        e.add(new Endpoint("edp2b", type, "cont1", "comp", "serv2b", Arrays.asList("int2")));
        e.add(new Endpoint("edp3a", type, "cont1", "comp", "serv1a", Arrays.asList("int6")));
        e.add(new Endpoint("edp3b", type, "cont1", "comp", "serv1b", Arrays.asList("int1")));
        e.add(new Endpoint("edp4a", type, "cont1", "comp", "serv2a", Arrays.asList("int2")));
        e.add(new Endpoint("edp4b", type, "cont1", "comp", "serv2b", Arrays.asList("int2")));

        return e;
    }

}
