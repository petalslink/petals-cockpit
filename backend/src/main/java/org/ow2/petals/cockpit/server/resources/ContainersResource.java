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

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.admin.api.ContainerAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.admin.api.exception.ContainerAdministrationException;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbContainer;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;

import javaslang.Tuple;
import javaslang.control.Option;

@Singleton
@Path("/containers")
public class ContainersResource {

    private final BusesDAO buses;

    private final PetalsAdministrationFactory adminFactory;

    @Inject
    public ContainersResource(BusesDAO buses, PetalsAdministrationFactory adminFactory) {
        this.buses = buses;
        this.adminFactory = adminFactory;
    }

    @GET
    @Path("/{cId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public ContainerOverview get(@PathParam("cId") @Min(1) long cId, @Pac4JProfile CockpitProfile profile)
            throws ContainerAdministrationException {

        DbContainer container = buses.getContainerById(cId, profile.getUser().username);

        if (container == null) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        if (container.acl == null) {
            throw new WebApplicationException(Status.FORBIDDEN);
        }

        PetalsAdministration petals = adminFactory.newPetalsAdministrationAPI();
        petals.connect(container.ip, container.port, container.username, container.password);
        try {
            ContainerAdministration admin = petals.newContainerAdministration();
            Domain domain = admin.getTopology(null, false);
            String sysInfo = admin.getSystemInfo();

            Map<String, Long> ids = buses.getContainersByBus(container.busId).stream()
                    .collect(Collectors.toMap(c -> c.name, c -> c.id));

            Map<String, String> reachabilities = javaslang.collection.List.ofAll(domain.getContainers())
                    // remove myself
                    .filter(c -> !Objects.equals(container.name, c.getContainerName()))
                    // get the ids (if they exist) TODO what do I do with unknown container names?
                    .flatMap(c -> Option.of(ids.get(c.getContainerName())).map(i -> Tuple.of(i, c)))
                    // transform to a reachability information
                    .toJavaMap(p -> p.map((i, c) -> Tuple.of(Long.toString(i), c.getState().name())));
            return new ContainerOverview(container.id, container.name, container.ip, container.port, reachabilities,
                    sysInfo);
        } finally {
            if (petals.isConnected()) {
                petals.disconnect();
            }
        }
    }

    public abstract static class MinContainer {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public MinContainer(long id, String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ContainerOverview extends MinContainer {

        @NotEmpty
        @JsonProperty
        public final String ip;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int port;

        @JsonProperty
        public final ImmutableMap<String, String> reachabilities;

        @NotNull
        @JsonProperty
        public final String systemInfo;

        @JsonCreator
        public ContainerOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("ip") String ip, @JsonProperty("port") int port,
                @JsonProperty("reachabilities") Map<String, String> reachabilities,
                @JsonProperty("systemInfo") String systemInfo) {
            super(id, name);
            this.ip = ip;
            this.port = port;
            this.reachabilities = ImmutableMap.copyOf(reachabilities);
            this.systemInfo = systemInfo;
        }
    }
}
