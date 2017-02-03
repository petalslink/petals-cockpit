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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
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
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ChangeState;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.ImmutableMap;

import io.dropwizard.testing.junit.ResourceTestRule;
import javaslang.Tuple;

public class ChangeSUStateTest extends AbstractCockpitResourceTest {

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1", ImmutableMap.of(PortType.JMX, containerPort),
            "user", "pass", State.REACHABLE);

    private final Component component = new Component("comp", ComponentType.SE, ArtifactState.State.STARTED);

    private final ServiceUnit serviceUnit1 = new ServiceUnit("su1", component.getName());

    private final ServiceAssembly serviceAssembly1 = new ServiceAssembly("sa1", ArtifactState.State.STARTED,
            serviceUnit1);

    private final ServiceUnit serviceUnit2 = new ServiceUnit("su2", component.getName());

    private final ServiceAssembly serviceAssembly2 = new ServiceAssembly("sa2", ArtifactState.State.STOPPED,
            serviceUnit2);

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ServiceUnitsResource.class, WorkspaceResource.class);

    @Before
    public void setUp() {
        petals.registerDomain(domain);
        petals.registerContainer(container);
        petals.registerArtifact(component, container);
        petals.registerArtifact(serviceAssembly1, container);
        petals.registerArtifact(serviceAssembly2, container);

        setupWorkspace(1, "test",
                Arrays.asList(Tuple.of(10L, domain, "phrase", Arrays.asList(Tuple.of(20L, container,
                        Arrays.asList(Tuple.of(30L, component,
                                Arrays.asList(Tuple.of(40L, serviceAssembly1), Tuple.of(41L, serviceAssembly2)))))))),
                MockProfileParamValueFactoryProvider.ADMIN.username);
    }

    @Test
    public void changeSU1State() {
        when(buses.updateServiceUnitState(eq(40), any())).thenReturn(1);

        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/40").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Started);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            ServiceUnitOverview put = resources.getJerseyTest().target("/workspaces/1/serviceunits/40").request()
                    .put(Entity.json(new ChangeState(ServiceUnitMin.State.Stopped)), ServiceUnitOverview.class);

            assertThat(put.state).isEqualTo(ServiceUnitMin.State.Stopped);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SU_STATE_CHANGE");
                JsonNode data = e.readData(JsonNode.class);
                a.assertThat(data.get("id").asText()).isEqualTo("40");
                a.assertThat(data.get("state").asText()).isEqualTo(ServiceUnitMin.State.Stopped.name());
            });
        }

        verify(buses).updateServiceUnitState(40, ServiceUnitMin.State.Stopped);
        verify(buses, times(0)).updateServiceUnitState(eq(41), any());
    }

    @Test
    public void changeSU1StateForbidden() {
        setupWorkspace(2, "test2",
                Arrays.asList(Tuple.of(11L, domain, "phrase", Arrays.asList(Tuple.of(21L, container,
                        Arrays.asList(Tuple.of(31L, component,
                                Arrays.asList(Tuple.of(41L, serviceAssembly1), Tuple.of(42L, serviceAssembly2)))))))),
                "anotheruser");

        Response put = resources.getJerseyTest().target("/workspaces/2/serviceunits/41").request()
                .put(Entity.json(new ChangeState(ServiceUnitMin.State.Stopped)));

        assertThat(put.getStatus()).isEqualTo(403);

        verify(buses, times(0)).updateServiceUnitState(eq(41), any());
        verify(buses, times(0)).updateServiceUnitState(eq(41), any());
    }

    @Test
    public void changeSU2StateUnload() {
        when(buses.updateServiceUnitState(eq(40), any())).thenReturn(1);

        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/41").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Stopped);

        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            ServiceUnitOverview put = resources.getJerseyTest().target("/workspaces/1/serviceunits/41").request()
                    .put(Entity.json(new ChangeState(ServiceUnitMin.State.Unloaded)), ServiceUnitOverview.class);

            assertThat(put.state).isEqualTo(ServiceUnitMin.State.Unloaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SU_STATE_CHANGE");
                JsonNode data = e.readData(JsonNode.class);
                a.assertThat(data.get("id").asText()).isEqualTo("41");
                a.assertThat(data.get("state").asText()).isEqualTo(ServiceUnitMin.State.Unloaded.name());
            });
        }

        verify(buses, times(0)).updateServiceUnitState(eq(40), any());
        verify(buses, times(0)).updateServiceUnitState(eq(41), any());
        verify(buses).removeServiceUnit(41);
    }

    @Test
    public void changeSU1StateNoChange() {
        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/40").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Started);

        ServiceUnitOverview put = resources.getJerseyTest().target("/workspaces/1/serviceunits/40").request()
                .put(Entity.json(new ChangeState(ServiceUnitMin.State.Started)), ServiceUnitOverview.class);

        assertThat(put.state).isEqualTo(ServiceUnitMin.State.Started);

        verify(buses, times(0)).updateServiceUnitState(eq(40), any());
        verify(buses, times(0)).updateServiceUnitState(eq(41), any());
    }

    @Test
    public void changeSU1StateConflict() {
        when(buses.updateServiceUnitState(eq(40), any())).thenReturn(1);

        ServiceUnitOverview get1 = resources.getJerseyTest().target("/serviceunits/40").request()
                .get(ServiceUnitOverview.class);
        assertThat(get1.state).isEqualTo(ServiceUnitMin.State.Started);

        Response put = resources.getJerseyTest().target("/workspaces/1/serviceunits/40").request()
                .put(Entity.json(new ChangeState(ServiceUnitMin.State.Unloaded)));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());

        verify(buses, times(0)).updateServiceUnitState(eq(40), any());
        verify(buses, times(0)).updateServiceUnitState(eq(41), any());
    }
}