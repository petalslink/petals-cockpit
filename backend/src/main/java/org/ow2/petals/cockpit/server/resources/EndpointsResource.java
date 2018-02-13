/**
 * Copyright (C) 2017-2018 Linagora
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
import static org.ow2.petals.cockpit.server.db.generated.Tables.EDP_INSTANCES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.ENDPOINTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;

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
import org.ow2.petals.cockpit.server.db.generated.tables.records.EndpointsRecord;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Singleton
@Path("/endpoints")
public class EndpointsResource {

    private final Configuration jooq;

    @Inject
    public EndpointsResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Path("/{eId}")
    @Produces(MediaType.APPLICATION_JSON)
    public EndpointOverview overview(@NotNull @PathParam("eId") @Min(1) long eId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            EndpointsRecord endpoint = DSL.using(conf).selectFrom(ENDPOINTS).where(ENDPOINTS.ID.eq(eId)).fetchOne();

            if (endpoint == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(EDP_INSTANCES).onKey().join(ENDPOINTS).onKey()
                    .where(ENDPOINTS.ID.eq(eId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return new EndpointOverview();
        });
    }

    public static class EndpointMin {

        @NotNull
        @Min(1)
        public final long id;

        @NotNull
        @NotEmpty
        @JsonProperty
        public final String name;

        public EndpointMin(EndpointsRecord eDb) {
            this(eDb.getId(), eDb.getName());
        }

        private EndpointMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class EndpointFull {

        @Valid
        @JsonUnwrapped
        public final EndpointMin endpoint;

        @NotNull
        @Min(1)
        public final long containerId;

        @NotNull
        @Min(1)
        public final long componentId;

        public EndpointFull(EndpointsRecord eDb, long containerId, long componentId) {
            this(new EndpointMin(eDb), containerId, componentId);
        }

        private EndpointFull(EndpointMin endpoint, long containerId, long componentId) {
            this.endpoint = endpoint;
            this.containerId = containerId;
            this.componentId = componentId;
        }

        @JsonCreator
        private EndpointFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new EndpointMin(0, ""), 0, 0);
        }

        @JsonProperty
        public String getContainerId() {
            return Long.toString(containerId);
        }

        @JsonProperty
        public String getComponentId() {
            return Long.toString(componentId);
        }

    }

    @JsonSerialize
    public static class EndpointOverview {
        // TODO remove annotation when there will be data
    }
}
