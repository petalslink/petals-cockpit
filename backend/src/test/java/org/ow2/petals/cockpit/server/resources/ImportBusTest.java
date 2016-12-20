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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import javax.ws.rs.client.Entity;

import org.glassfish.jersey.media.sse.EventInput;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBusImported;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbContainer;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.mocks.MockProfileParamValueFactoryProvider;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;

import com.fasterxml.jackson.annotation.JsonProperty;

import jersey.repackaged.com.google.common.collect.ImmutableMap;

public class ImportBusTest extends AbstractWorkspacesResourceTest {

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    @Before
    public void setUp() {
        // petals
        container.addProperty("petals.topology.passphrase", "phrase");
        petals.registerDomain(domain);
        petals.registerContainer(container);

        // mocks
        long workspaceId = 1;
        DbWorkspace w = new DbWorkspace(workspaceId, "test",
                Arrays.asList(MockProfileParamValueFactoryProvider.ADMIN.username));

        doReturn(w).when(workspaces).getWorkspaceById(workspaceId);

        doReturn(new WorkspaceTree(workspaceId, "test", Arrays.asList(), Arrays.asList())).when(workspaces)
                .getWorkspaceTree(w);

        long busId = 4;
        when(buses.createBus(container.getHost(), containerPort, container.getJmxUsername(), container.getJmxPassword(),
                "phrase", workspaceId)).thenReturn(busId);
        when(buses.createBus("host2", containerPort, container.getJmxUsername(), container.getJmxPassword(), "phrase",
                workspaceId)).thenReturn(busId + 1);

        when(buses.getBusById(busId)).thenReturn(new DbBusImported(busId, container.getHost(), containerPort,
                container.getJmxUsername(), container.getJmxPassword(), "phrase", domain.getName()));

        long containerId = 45;
        when(buses.createContainer(container.getContainerName(), container.getHost(), containerPort,
                container.getJmxUsername(), container.getJmxPassword(), busId)).thenReturn(containerId);
        when(buses.getContainerById(containerId)).thenReturn(new DbContainer(containerId, container.getContainerName(),
                container.getHost(), containerPort, container.getJmxUsername(), container.getJmxPassword()));

    }

    @Test
    public void testImportBusOk() {
        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1").request()
                .get(EventInput.class)) {

            expectWorkspaceTree(eventInput);

            BusInProgress post = resources.getJerseyTest()
                    .target("/workspaces/1/buses").request().post(Entity.json(new NewBus(container.getHost(),
                            containerPort, container.getJmxUsername(), container.getJmxPassword(), "phrase")),
                            BusInProgress.class);

            assertThat(post.id).isEqualTo(4);

            // TODO add timeout
            expectWorkspaceEvent(eventInput, (e, a) -> {
                a.assertThat(e.event).isEqualTo("BUS_IMPORT_OK");
                a.assertThat(e.data.get("id")).isEqualTo(post.getId());
                a.assertThat(e.data.get("name")).isEqualTo(domain.getName());
            });
        }

        // let's just ensure that the bus is created and updated in the db
        verify(buses).createBus(container.getHost(), containerPort, container.getJmxUsername(),
                container.getJmxPassword(), "phrase", 1);
        verify(buses).saveImport(eq(4L), any());
        verify(buses).updateBus(4, domain.getName());
    }

    @Test
    public void testImportBusError() {
        String incorrectHost = "host2";

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1").request()
                .get(EventInput.class)) {

            expectWorkspaceTree(eventInput);

            BusInProgress post = resources.getJerseyTest().target("/workspaces/1/buses").request()
                    .post(Entity.json(new NewBus(incorrectHost, containerPort, container.getJmxUsername(),
                            container.getJmxPassword(), "phrase")), BusInProgress.class);

            assertThat(post.id).isEqualTo(5);

            // TODO add timeout
            expectWorkspaceEvent(eventInput, (e, a) -> {
                a.assertThat(e.event).isEqualTo("BUS_IMPORT_ERROR");
                a.assertThat(e.data.get("importError")).isEqualTo("Unknown Host");
            });
        }

        // let's just ensure that the bus is created and updated in the db
        verify(buses).createBus(incorrectHost, containerPort, container.getJmxUsername(), container.getJmxPassword(),
                "phrase", 1);
        verify(buses).saveError(5, "Unknown Host");
    }

    @Test
    public void importBusErrorSA() {
        petals.registerArtifact(new Component("comp", ComponentType.BC), container);
        petals.registerArtifact(
                new ServiceAssembly("sa", new ServiceUnit("su1", "comp"), new ServiceUnit("su2", "comp")), container);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1").request()
                .get(EventInput.class)) {

            expectWorkspaceTree(eventInput);

            BusInProgress post = resources.getJerseyTest()
                    .target("/workspaces/1/buses").request().post(Entity.json(new NewBus(container.getHost(),
                            containerPort, container.getJmxUsername(), container.getJmxPassword(), "phrase")),
                            BusInProgress.class);

            assertThat(post.id).isEqualTo(4);

            // TODO add timeout
            expectWorkspaceEvent(eventInput, (e, a) -> {
                a.assertThat(e.event).isEqualTo("BUS_IMPORT_ERROR");
                a.assertThat((String) e.data.get("importError"))
                        .contains("Buses with not-single SU SAs are not supported");
            });
        }
    }
}

/**
 * We can't use {@link BusesResource.NewBus} because it won't serialize the passwords (on purpose!!)
 */
class NewBus {

    @JsonProperty
    public final String ip;

    @JsonProperty
    public final int port;

    @JsonProperty
    public final String username;

    @JsonProperty
    public final String password;

    @JsonProperty
    public final String passphrase;

    public NewBus(String ip, int port, String username, String password, String passphrase) {
        this.ip = ip;
        this.port = port;
        this.username = username;
        this.password = password;
        this.passphrase = passphrase;
    }
}
