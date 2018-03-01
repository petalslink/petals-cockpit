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
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;

import java.util.HashSet;
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

import org.eclipse.jdt.annotation.Nullable;
import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.Record;
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
    @Path("/{sId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ServiceOverview overview(@NotNull @PathParam("sId") @Min(1) long sId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            ServicesRecord service = DSL.using(conf).selectFrom(SERVICES).where(SERVICES.ID.eq(sId)).fetchOne();

            if (service == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(EDP_INSTANCES).onKey().join(SERVICES).onKey()
                    .where(SERVICES.ID.eq(sId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();
            
             if (user == null) {
             throw new WebApplicationException(Status.FORBIDDEN);
             }

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
        public final Set<String> components;

        public ServiceFull(ServicesRecord sDb, Set<String> componentIds) {
            this(new ServiceMin(sDb), componentIds);
        }

        public ServiceFull(ServicesRecord sDb, String componentId) {
            this(new ServiceMin(sDb), new HashSet<String>());
            this.components.add(componentId);
        }

        private ServiceFull(ServiceMin service, Set<String> componentIds) {
            this.service = service;
            this.components = new HashSet<String>(componentIds);
        }

        @JsonCreator
        private ServiceFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new ServiceMin(0, ""), new HashSet<String>());
        }

        public void addComponent(Long componentId) {
            this.components.add(String.valueOf(componentId));
        }

        public void addComponents(Set<String> componentIds) {
            this.components.addAll(componentIds);
        }

        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            long id = service.id;
            String name = service.name;
            result = prime * result + ((components == null) ? 0 : components.hashCode());
            result = prime * result + (int) (id ^ (id >>> 32));
            result = prime * result + ((name == null) ? 0 : name.hashCode());
            return result;
        }

        @Override
        public boolean equals(@Nullable Object obj) {
            if (this == obj)
                return true;
            if (obj == null)
                return false;
            if (getClass() != obj.getClass())
                return false;
            ServiceFull other = (ServiceFull) obj;
            if (!components.equals(other.components))
                return false;
            if (service.id != other.service.id)
                return false;
            if (!service.name.equals(other.service.name))
                return false;
            return true;
        }
    }

    @JsonSerialize
    public static class ServiceOverview {
        // TODO remove annotation when there will be data
    }
}
