/**
 * Copyright (C) 2017 Linagora
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

import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICES;

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
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServicesRecord;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Singleton
@Path("/services")
public class ServicesResource {

    private final Configuration jooq;

    @Inject
    public ServicesResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Path("/{suId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ServiceOverview overview(@NotNull @PathParam("sId") @Min(1) long sId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            ServicesRecord service = DSL.using(conf).selectFrom(SERVICES).where(SERVICES.ID.eq(sId)).fetchOne();

            if (service == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            // TODO: once service is linked to a bus ? container ? component ? check user clearance.
            //
            // Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
            // .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
            // .onKey(FK_CONTAINERS_BUSES_ID).join(SERVICEUNITS).onKey(FK_SERVICEUNITS_CONTAINER_ID)
            // .where(SERVICEUNITS.ID.eq(sId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();
            //
            // if (user == null) {
            // throw new WebApplicationException(Status.FORBIDDEN);
            // }

            return new ServiceOverview();
        });
    }

    public static class ServiceMin {

        @NotNull
        @Min(1)
        public final long id;

        @NotNull
        @NotEmpty
        @JsonProperty
        public final String name;

        public ServiceMin(ServicesRecord sDb) {
            this(sDb.getId(), sDb.getName());
        }

        private ServiceMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ServiceFull {

        @Valid
        @JsonUnwrapped
        public final ServiceMin service;

        @NotNull
        @Min(1)
        public final long containerId;

        @NotNull
        @Min(1)
        public final long componentId;


        public ServiceFull(ServicesRecord sDb, long containerId, long componentId) {
            this(new ServiceMin(sDb), containerId, componentId);
        }

        private ServiceFull(ServiceMin service, long containerId, long componentId) {
            this.service = service;
            this.containerId = containerId;
            this.componentId = componentId;
        }

        @JsonCreator
        private ServiceFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new ServiceMin(0, ""), 0, 0);
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
    public static class ServiceOverview {
        // TODO remove annotation when there will be data
    }
}
