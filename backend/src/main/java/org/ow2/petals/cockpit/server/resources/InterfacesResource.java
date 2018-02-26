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
import static org.ow2.petals.cockpit.server.db.generated.Tables.INTERFACES;
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
import org.ow2.petals.cockpit.server.db.generated.tables.records.InterfacesRecord;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Singleton
@Path("/interfaces")
public class InterfacesResource {

    private final Configuration jooq;

    @Inject
    public InterfacesResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Path("/{iId}")
    @Produces(MediaType.APPLICATION_JSON)
    public InterfaceOverview overview(@NotNull @PathParam("iId") @Min(1) long iId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            InterfacesRecord interfaceRec = DSL.using(conf).selectFrom(INTERFACES).where(INTERFACES.ID.eq(iId))
                    .fetchOne();

            if (interfaceRec == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(EDP_INSTANCES).onKey().join(INTERFACES).onKey()
                    .where(INTERFACES.ID.eq(iId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return new InterfaceOverview();
        });
    }

    public static class InterfaceMin {

        @NotNull
        @Min(1)
        public final long id;

        @NotNull
        @NotEmpty
        @JsonProperty
        public final String name;

        public InterfaceMin(InterfacesRecord iDb) {
            this(iDb.getId(), iDb.getName());
        }

        private InterfaceMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class InterfaceFull {

        @Valid
        @JsonUnwrapped
        public final InterfaceMin interface_;

        @NotNull
        @Min(1)
        public final Set<String> componentIds;

        public InterfaceFull(InterfacesRecord iDb, Set<String> componentIds) {
            this(new InterfaceMin(iDb), componentIds);
        }

        public InterfaceFull(InterfacesRecord iDb, String componentId) {
            this(new InterfaceMin(iDb), new HashSet<String>());
            this.componentIds.add(componentId);
        }

        private InterfaceFull(InterfaceMin intf, Set<String> componentId) {
            this.interface_ = intf;
            this.componentIds = new HashSet<String>(componentId);
        }

        @JsonCreator
        private InterfaceFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new InterfaceMin(0, ""), new HashSet<String>());
        }

        public void addComponent(Long componentId) {
            this.componentIds.add(String.valueOf(componentId));
        }

        public void addComponents(Set<String> componentIds) {
            this.componentIds.addAll(componentIds);
        }

        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            long id = interface_.id;
            String name = interface_.name;
            result = prime * result + ((componentIds == null) ? 0 : componentIds.hashCode());
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
            InterfaceFull other = (InterfaceFull) obj;
            if (!componentIds.equals(other.componentIds))
                return false;
            if (interface_.id != other.interface_.id)
                return false;
            if (!interface_.name.equals(other.interface_.name))
                return false;
            return true;
        }
    }

    @JsonSerialize
    public static class InterfaceOverview {
        // TODO remove annotation when there will be data
    }
}
