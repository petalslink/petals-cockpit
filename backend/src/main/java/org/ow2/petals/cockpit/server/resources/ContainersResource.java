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

import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_CONTAINERS_BUSES_ID;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
import org.jooq.Configuration;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.ContainerAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
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

    private final Configuration jooq;

    private final PetalsAdministrationFactory adminFactory;

    @Inject
    public ContainersResource(Configuration jooq, PetalsAdministrationFactory adminFactory) {
        this.jooq = jooq;
        this.adminFactory = adminFactory;
    }

    @GET
    @Path("/{cId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public ContainerOverview get(@PathParam("cId") @Min(1) long cId, @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            ContainersRecord container = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(cId)).fetchOne();

            if (container == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select()
                    .from(USERS_WORKSPACES)
                    .join(BUSES).on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID))
                    .join(CONTAINERS).onKey(FK_CONTAINERS_BUSES_ID)
                    .where(CONTAINERS.ID.eq(cId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            PetalsAdministration petals = adminFactory.newPetalsAdministrationAPI();
            petals.connect(container.getIp(), container.getPort(), container.getUsername(), container.getPassword());
            try {
                ContainerAdministration admin = petals.newContainerAdministration();
                Domain domain = admin.getTopology(null, false);
                String sysInfo = admin.getSystemInfo();

                Map<String, Long> ids;
                try (Stream<ContainersRecord> s = DSL.using(conf).selectFrom(CONTAINERS)
                        .where(CONTAINERS.BUS_ID.eq(container.getBusId())).stream()) {
                    ids = s.collect(Collectors.toMap(ContainersRecord::getName, ContainersRecord::getId));
                }

                Map<String, String> reachabilities = javaslang.collection.List.ofAll(domain.getContainers())
                        // remove myself
                        .filter(c -> !Objects.equals(container.getName(), c.getContainerName()))
                        // get the ids (if they exist) TODO what do I do with unknown container names?
                        .flatMap(c -> Option.of(ids.get(c.getContainerName())).map(i -> Tuple.of(i, c)))
                        // transform to a reachability information
                        .toJavaMap(p -> p.map((i, c) -> Tuple.of(Long.toString(i), c.getState().name())));
                return new ContainerOverview(container.getId(), container.getName(), container.getIp(),
                        container.getPort(), reachabilities,
                        sysInfo);
            } finally {
                if (petals.isConnected()) {
                    petals.disconnect();
                }
            }
        });
    }

    public static class ContainerMin {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @JsonCreator
        public ContainerMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ContainerOverview extends ContainerMin {

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
