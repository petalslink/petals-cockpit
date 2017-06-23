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

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.services.PetalsAdmin;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

import javaslang.Tuple2;
import javaslang.control.Option;

@Singleton
@Path("/containers")
public class ContainersResource {

    private final Configuration jooq;

    private final PetalsAdmin petals;

    @Inject
    public ContainersResource(Configuration jooq, PetalsAdmin petals) {
        this.jooq = jooq;
        this.petals = petals;
    }

    @GET
    @Path("/{cId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ContainerOverview overview(@NotNull @PathParam("cId") @Min(1) long cId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            ContainersRecord container = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(cId)).fetchOne();

            if (container == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID)
                    .where(CONTAINERS.ID.eq(cId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            Tuple2<List<Container>, String> infos = petals.getContainerInfos(container.getIp(), container.getPort(),
                    container.getUsername(), container.getPassword());

            Map<String, Long> ids;
            try (Stream<ContainersRecord> s = DSL.using(conf).selectFrom(CONTAINERS)
                    .where(CONTAINERS.BUS_ID.eq(container.getBusId())).stream()) {
                ids = s.collect(Collectors.toMap(ContainersRecord::getName, ContainersRecord::getId));
            }

            List<String> reachabilities = javaslang.collection.List.ofAll(infos._1())
                    // remove myself
                    .filter(c -> !Objects.equals(container.getName(), c.getContainerName()))
                    // keep the reachable containers
                    .filter(c -> c.getState() == Container.State.REACHABLE)
                    // get the ids (if they exist) TODO what do I do with unknown container names?
                    .flatMap(c -> Option.of(ids.get(c.getContainerName())))
                    // convert it to strings
                    .map(String::valueOf).toJavaList();

            return new ContainerOverview(container.getIp(), container.getPort(), reachabilities, infos._2());
        });
    }

    public static class ContainerMin {

        @NotNull
        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public ContainerMin(ContainersRecord cDb) {
            this(cDb.getId(), cDb.getName());
        }

        @JsonCreator
        private ContainerMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ContainerFull {

        @Valid
        @JsonUnwrapped
        public final ContainerMin container;

        @NotNull
        @Min(1)
        public final long busId;

        @JsonProperty
        public final ImmutableSet<String> components;

        @JsonProperty
        public final ImmutableSet<String> serviceAssemblies;

        @JsonProperty
        public final ImmutableSet<String> sharedLibraries;

        private ContainerFull(ContainerMin container, long busId, Set<String> components,
                Set<String> serviceAssemblies, Set<String> sharedLibraries) {
            this.container = container;
            this.busId = busId;
            this.components = ImmutableSet.copyOf(components);
            this.serviceAssemblies = ImmutableSet.copyOf(serviceAssemblies);
            this.sharedLibraries = ImmutableSet.copyOf(sharedLibraries);
        }

        public ContainerFull(ContainersRecord cDb, Set<String> components, Set<String> serviceAssemblies,
                Set<String> sharedLibraries) {
            this(new ContainerMin(cDb), cDb.getBusId(), components, serviceAssemblies, sharedLibraries);
        }

        @JsonCreator
        private ContainerFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new ContainerMin(0, ""), 0, ImmutableSet.of(), ImmutableSet.of(), ImmutableSet.of());
        }

        @JsonProperty
        public String getBusId() {
            return Long.toString(busId);
        }
    }

    public static class ContainerOverview {

        @NotEmpty
        @JsonProperty
        public final String ip;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int port;

        @JsonProperty
        public final ImmutableList<String> reachabilities;

        @NotNull
        @JsonProperty
        public final String systemInfo;

        @JsonCreator
        public ContainerOverview(@JsonProperty("ip") String ip, @JsonProperty("port") int port,
                @JsonProperty("reachabilities") List<String> reachabilities,
                @JsonProperty("systemInfo") String systemInfo) {
            this.ip = ip;
            this.port = port;
            this.reachabilities = ImmutableList.copyOf(reachabilities);
            this.systemInfo = systemInfo;
        }
    }
}
