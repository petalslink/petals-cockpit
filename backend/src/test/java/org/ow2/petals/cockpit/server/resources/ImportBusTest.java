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
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.ignoreStubs;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

import javax.ws.rs.client.Entity;

import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.InboundEvent;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.hibernate.validator.constraints.NotEmpty;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestRule;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.CockpitApplication.ActorServiceLocator;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusInProgress;
import org.ow2.petals.cockpit.server.security.MockProfileParamValueFactoryProvider;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;

import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.common.test.TestUtil;
import co.paralleluniverse.common.util.Debug;
import io.dropwizard.testing.junit.ResourceTestRule;
import jersey.repackaged.com.google.common.collect.ImmutableMap;

@SuppressWarnings("null")
public class ImportBusTest {

    @Rule
    public TestRule watchman = TestUtil.WATCHMAN;

    private static WorkspacesDAO workspaces = mock(WorkspacesDAO.class,
            withSettings()
                    // .verboseLogging()
                    .defaultAnswer(CALLS_REAL_METHODS));

    private static BusesDAO buses = mock(BusesDAO.class,
            withSettings()
                    // .verboseLogging()
                    .defaultAnswer(CALLS_REAL_METHODS));

    @ClassRule
    public static ResourceTestRule resources = ResourceTestRule.builder()
            // in memory does not support SSE and the no-servlet one does not log...
            .setTestContainerFactory(new GrizzlyWebTestContainerFactory())
            // we pass the resource as a provider to get injection in constructor
            .addProvider(WorkspacesResource.class).addProvider(new MockProfileParamValueFactoryProvider.Binder())
            .addProvider(new ActorServiceLocator()).addProvider(new AbstractBinder() {
                @Override
                protected void configure() {
                    bind(workspaces).to(WorkspacesDAO.class);
                    bind(buses).to(BusesDAO.class);
                    bind(Executors.newSingleThreadExecutor()).named(CockpitApplication.PETALS_ADMIN_ES)
                            .to(ExecutorService.class);
                    bind(Executors.newSingleThreadExecutor()).named(CockpitApplication.JDBC_ES)
                            .to(ExecutorService.class);
                }
            }).build();

    @ClassRule
    public static final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    private static Domain domain = new Domain("dom");

    private static Container container = new Container("cont", "host1", ImmutableMap.of(PortType.JMX, 7700), "user",
            "pass", State.REACHABLE);

    @BeforeClass
    public static void classSetUp() {
        container.addProperty("petals.topology.passphrase", "??");
        domain.addContainers(ImmutableList.of(container));
        petals.registerDomain(domain);
        // ensure this doesn't get called in a non-unit test thread and return false later when clearing the registry!
        assertThat(Debug.isUnitTest()).isTrue();
    }

    @Before
    public void setUp() {
        long workspaceId = 1;
        when(workspaces.findById(workspaceId)).thenReturn(new DbWorkspace(workspaceId, "test",
                Arrays.asList(MockProfileParamValueFactoryProvider.ADMIN.username)));

        int port = container.getPorts().get(PortType.JMX);

        long busId = 4;
        when(buses.createBus(container.getHost(), port, container.getJmxUsername(), container.getJmxPassword(), "??",
                workspaceId)).thenReturn(busId);
        when(buses.createBus("host2", port, container.getJmxUsername(), container.getJmxPassword(), "??", workspaceId))
                .thenReturn(busId + 1);

        long containerId = 45;
        when(buses.createContainer(container.getContainerName(), container.getHost(), port, container.getJmxUsername(),
                container.getJmxPassword(), busId)).thenReturn(containerId);
    }

    @After
    public void tearDown() {
        verifyNoMoreInteractions(ignoreStubs(workspaces));
        verifyNoMoreInteractions(ignoreStubs(buses));

        reset(workspaces);
        reset(buses);

        ActorRegistry.clear();
    }

    @Test
    public void testImportBusOk() {

        int port = container.getPorts().get(PortType.JMX);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1/events").request()
                .get(EventInput.class)) {

            BusInProgress post = resources.getJerseyTest().target("/workspaces/1/buses").request()
                    .post(Entity.json(new NewBus(container.getHost(), port, container.getJmxUsername(),
                            container.getJmxPassword(), "??")), BusInProgress.class);

            assertThat(post.id).isEqualTo(4);

            // TODO add timeout
            expectEvent(eventInput, e -> {
                assertThat(e.getName()).isEqualTo("WORKSPACE_CHANGE");
                ImportBusEvent ev = e.readData(ImportBusEvent.class);
                assertThat(ev.event).isEqualTo("BUS_IMPORT_OK");
                assertThat(ev.data.get("id")).isEqualTo(post.getId());
                assertThat(ev.data.get("name")).isEqualTo(domain.getName());
            });
        }

        // once from the setUp (not sure why) and once when creating the actor
        verify(workspaces, times(2)).findById(1);
        verify(buses).createBus(container.getHost(), port, container.getJmxUsername(), container.getJmxPassword(), "??",
                1);
        verify(buses).saveImport(eq(4L), any());
        verify(buses).updateBus(4, domain.getName());
    }

    @Test
    public void testImportBusError() {

        int port = container.getPorts().get(PortType.JMX);
        String incorrectHost = "host2";

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1/events").request()
                .get(EventInput.class)) {

            BusInProgress post = resources.getJerseyTest().target("/workspaces/1/buses").request().post(Entity.json(
                    new NewBus(incorrectHost, port, container.getJmxUsername(), container.getJmxPassword(), "??")),
                    BusInProgress.class);

            assertThat(post.id).isEqualTo(5);

            // TODO add timeout
            expectEvent(eventInput, e -> {
                assertThat(e.getName()).isEqualTo("WORKSPACE_CHANGE");
                ImportBusEvent ev = e.readData(ImportBusEvent.class);
                assertThat(ev.event).isEqualTo("BUS_IMPORT_ERROR");
                assertThat(ev.data.get("importError")).isEqualTo("Unknown Host");
            });
        }

        // once from the setUp (not sure why) and once when creating the actor
        verify(workspaces, times(2)).findById(1);
        verify(buses).createBus(incorrectHost, port, container.getJmxUsername(), container.getJmxPassword(), "??", 1);
        verify(buses).saveError(5, "Unknown Host");
    }

    private static void expectEvent(EventInput eventInput, Consumer<InboundEvent> c) {
        while (!eventInput.isClosed()) {
            final InboundEvent inboundEvent = eventInput.read();
            if (inboundEvent == null) {
                // connection has been closed
                break;
            }

            c.accept(inboundEvent);

            eventInput.close();
        }
    }
}

class ImportBusEvent {

    @JsonProperty
    @NotEmpty
    public String event = "";

    @JsonProperty
    public Map<?, ?> data = new HashMap<>();
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
