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

import java.util.Arrays;

import org.junit.Before;
import org.junit.Rule;
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

import com.google.common.collect.ImmutableMap;

import javaslang.Tuple;

public abstract class AbstractReadOnlyResourceTest extends AbstractCockpitResourceTest {

    protected static final String SYSINFO = "WORKSPACE TEST SYSINFO";

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    protected final Domain domain = new Domain("dom");

    protected final int containerPort = 7700;

    protected final Container container1 = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    protected final Container container2 = new Container("cont2", "host2", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    protected final Container container3 = new Container("cont3", "host3", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.UNREACHABLE);

    protected final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED);

    protected final ServiceUnit serviceUnit = new ServiceUnit("su", component.getName());

    protected final ServiceAssembly serviceAssembly = new ServiceAssembly("sa", ArtifactState.State.STARTED,
            serviceUnit);

    @Before
    public void setup() {
        // petals
        petals.registerSystemInfo(SYSINFO);
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
}
