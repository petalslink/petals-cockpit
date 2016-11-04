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
import static org.mockito.Mockito.reset;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

import javax.ws.rs.client.Entity;

import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.InboundEvent;
import org.glassfish.jersey.test.grizzly.GrizzlyTestContainerFactory;
import org.hibernate.validator.constraints.NotEmpty;
import org.junit.After;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.mockito.Mockito;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.security.MockProfileParamValueFactoryProvider;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableModule;

import com.allanbank.mongodb.MongoDatabase;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;

import io.dropwizard.jackson.Jackson;
import io.dropwizard.testing.junit.ResourceTestRule;
import jersey.repackaged.com.google.common.collect.ImmutableMap;

public class ImportBusTest {

    private static MongoDatabase db = Mockito.mock(MongoDatabase.class);

    @ClassRule
    public static ResourceTestRule resources = ResourceTestRule.builder()
            // in memory does not support SSE
            .setTestContainerFactory(new GrizzlyTestContainerFactory())
            .setMapper(Jackson.newObjectMapper().registerModule(new DocumentAssignableModule()))
            // we pass the resource as a provider to get injection in constructor
            .addProvider(WorkspacesResource.class).addProvider(new MockProfileParamValueFactoryProvider.Binder())
            .addProvider(new AbstractBinder() {
                @Override
                protected void configure() {
                    bind(db).to(MongoDatabase.class);
                }
            }).build();

    @ClassRule
    public static final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    @Before
    public void setUp() {
        Domain domain = new Domain("dom");
        Container container = new Container("cont", "host1", ImmutableMap.of(PortType.JMX, 7700), "user", "pass",
                State.REACHABLE);
        domain.addContainers(ImmutableList.of(container));
        petals.registerDomain(domain);
    }

    @After
    public void tearDown() {
        reset(db);
    }

    @Test
    public void testImportBusOk() {
        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/w1/events").request()
                .get(EventInput.class)) {

            ImportBusResponse post = resources.getJerseyTest().target("/workspaces/w1/buses").request().post(
                    Entity.json(new BusesResource.NewBus("host1", 7700, "user", "pass", "??")),
                    ImportBusResponse.class);
            assertThat(post).isNotNull();
            assertThat(post.id).isNotEmpty();

            // TODO add timeout
            expectEvent(eventInput, e -> {
                assertThat(e.getName()).isEqualTo("WORKSPACE_CHANGE");
                ImportBusEvent ev = e.readData(ImportBusEvent.class);
                assertThat(ev.event).isEqualTo("BUS_IMPORT_OK");
                assertThat(ev.data.get("id")).isEqualTo(post.id);
                assertThat(ev.data.get("name")).isEqualTo("dom");
            });
        }
    }

    @Test
    public void testImportBusError() {
        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/w1/events").request()
                .get(EventInput.class)) {

            ImportBusResponse post = resources.getJerseyTest().target("/workspaces/w1/buses").request().post(
                    Entity.json(new BusesResource.NewBus("host2", 7700, "user", "pass", "??")),
                    ImportBusResponse.class);
            assertThat(post).isNotNull();
            assertThat(post.id).isNotEmpty();

            // TODO add timeout
            expectEvent(eventInput, e -> {
                assertThat(e.getName()).isEqualTo("WORKSPACE_CHANGE");
                ImportBusEvent ev = e.readData(ImportBusEvent.class);
                assertThat(ev.event).isEqualTo("BUS_IMPORT_ERROR");
                assertThat(ev.data.get("error")).isEqualTo("Unknown Host");
            });
        }
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

class ImportBusResponse {

    @JsonProperty
    @NotEmpty
    public String id = "";

}


