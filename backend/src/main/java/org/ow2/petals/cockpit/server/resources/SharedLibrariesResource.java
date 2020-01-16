/**
 * Copyright (C) 2017-2020 Linagora
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
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_SHAREDLIBRARIES_CONTAINER_ID;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES;
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
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.google.common.collect.ImmutableSet;

@Singleton
@Path("/sharedlibraries")
public class SharedLibrariesResource {

    private final Configuration jooq;

    @Inject
    public SharedLibrariesResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Path("/{slId}")
    @Produces(MediaType.APPLICATION_JSON)
    public SharedLibraryOverview overview(@NotNull @PathParam("slId") @Min(1) long slId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            SharedlibrariesRecord sl = DSL.using(conf).selectFrom(SHAREDLIBRARIES).where(SHAREDLIBRARIES.ID.eq(slId))
                    .fetchOne();

            if (sl == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(SHAREDLIBRARIES).onKey(FK_SHAREDLIBRARIES_CONTAINER_ID)
                    .where(SHAREDLIBRARIES.ID.eq(slId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return new SharedLibraryOverview();
        });
    }

    public static class SharedLibraryMin {

        public enum State {
            Unloaded, Loaded;
        }

        @NotNull
        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotEmpty
        @JsonProperty
        public final String version;

        public SharedLibraryMin(SharedlibrariesRecord slDb) {
            this(slDb.getId(), slDb.getName(), slDb.getVersion());
        }

        private SharedLibraryMin(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("version") String version) {
            this.id = id;
            this.name = name;
            this.version = version;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class SharedLibraryFull {

        @Valid
        @JsonUnwrapped
        public final SharedLibraryMin sharedLibrary;

        @NotNull
        @Min(1)
        public final long containerId;

        @JsonProperty
        public final ImmutableSet<String> components;

        public SharedLibraryFull(SharedlibrariesRecord slDb, Set<String> components) {
            this(new SharedLibraryMin(slDb), slDb.getContainerId(), components);
        }

        private SharedLibraryFull(SharedLibraryMin SharedLibrary, long containerId, Set<String> components) {
            this.sharedLibrary = SharedLibrary;
            this.containerId = containerId;
            this.components = ImmutableSet.copyOf(components);
        }

        @JsonCreator
        private SharedLibraryFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new SharedLibraryMin(0, "", ""), 0, ImmutableSet.of());
        }

        @JsonProperty
        public String getContainerId() {
            return Long.toString(containerId);
        }
    }

    @JsonSerialize
    public static class SharedLibraryOverview {
        // TODO remove annotation when there will be data
    }
}
