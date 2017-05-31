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

import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
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
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.google.common.collect.ImmutableSet;

@Singleton
@Path("/buses")
public class BusesResource {

    private final Configuration jooq;

    @Inject
    public BusesResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Path("/{bId}")
    @Produces(MediaType.APPLICATION_JSON)
    public BusOverview overview(@NotNull @PathParam("bId") @Min(1) long bId, @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {

            BusesRecord bus = DSL.using(conf).selectFrom(BUSES).where(BUSES.ID.eq(bId)).fetchOne();

            if (bus == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID))
                    .where(BUSES.ID.eq(bId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return new BusOverview();
        });
    }

    public static class BusMin {

        @NotNull
        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public BusMin(BusesRecord bDb) {
            this(bDb.getId(), bDb.getName());
        }

        @JsonCreator
        private BusMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class BusFull {

        @Valid
        @JsonUnwrapped
        public final BusMin bus;

        @NotNull
        @Min(1)
        public final long workspaceId;

        @JsonProperty
        public final ImmutableSet<String> containers;

        public BusFull(BusesRecord bDb, Set<String> containers) {
            this(new BusMin(bDb), bDb.getWorkspaceId(), containers);
        }

        private BusFull(BusMin bus, long workspaceId, Set<String> containers) {
            this.bus = bus;
            this.workspaceId = workspaceId;
            this.containers = ImmutableSet.copyOf(containers);
        }

        @JsonCreator
        private BusFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new BusMin(0, ""), 0, ImmutableSet.of());
        }

        @JsonProperty
        public String getWorkspaceId() {
            return Long.toString(workspaceId);
        }
    }

    @JsonSerialize
    public static class BusOverview {
        // TODO remove annotation when there will be data
    }
}
