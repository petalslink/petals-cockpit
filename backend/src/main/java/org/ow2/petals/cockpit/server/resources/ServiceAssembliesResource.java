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
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_SERVICEASSEMBLIES_CONTAINER_ID;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;

import java.util.Set;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
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
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.google.common.collect.ImmutableSet;

@Singleton
@Path("/serviceassemblies")
public class ServiceAssembliesResource {

    private final Configuration jooq;

    @Inject
    public ServiceAssembliesResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Path("/{saId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ServiceAssemblyOverview overview(@NotNull @PathParam("saId") @Min(1) long saId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            ServiceassembliesRecord sa = DSL.using(conf).selectFrom(SERVICEASSEMBLIES)
                    .where(SERVICEASSEMBLIES.ID.eq(saId)).fetchOne();

            if (sa == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(SERVICEASSEMBLIES).onKey(FK_SERVICEASSEMBLIES_CONTAINER_ID)
                    .where(SERVICEASSEMBLIES.ID.eq(saId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return new ServiceAssemblyOverview();
        });
    }

    public static class ServiceAssemblyMin {
        public enum State {
            Unloaded, Started, Stopped, Shutdown, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    case LOADED:
                        throw new AssertionError("Loaded state does not exist for SAs");
                    default:
                        throw new AssertionError("impossible");
                }
            }
        }

        @NotNull
        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public ServiceAssemblyMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ServiceAssemblyFull {

        @Valid
        @JsonUnwrapped
        public final ServiceAssemblyMin serviceAssembly;

        @NotNull
        @Min(1)
        public final long containerId;

        @NotNull
        @JsonProperty
        public final ServiceAssemblyMin.State state;

        @JsonProperty
        public final ImmutableSet<String> serviceUnits;

        public ServiceAssemblyFull(ServiceAssemblyMin serviceAssembly, long containerId, ServiceAssemblyMin.State state,
                Set<String> serviceUnits) {
            this.serviceAssembly = serviceAssembly;
            this.containerId = containerId;
            this.state = state;
            this.serviceUnits = ImmutableSet.copyOf(serviceUnits);
        }

        @JsonCreator
        private ServiceAssemblyFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new ServiceAssemblyMin(0, ""), 0, ServiceAssemblyMin.State.Unknown, ImmutableSet.of());
        }

        @JsonProperty
        public String getContainerId() {
            return Long.toString(containerId);
        }
    }

    @JsonSerialize
    public static class ServiceAssemblyOverview {
        // TODO remove annotation when there will be data
    }
}
