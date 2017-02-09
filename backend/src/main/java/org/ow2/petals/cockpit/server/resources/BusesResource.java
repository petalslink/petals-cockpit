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

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.validation.constraints.Min;
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
    @Valid
    public BusOverview get(@PathParam("bId") @Min(1) long bId, @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {

            BusesRecord bus = DSL.using(conf).selectFrom(BUSES).where(BUSES.ID.eq(bId)).fetchOne();

            if (bus == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select()
                    .from(USERS_WORKSPACES).join(BUSES).on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID))
                    .where(BUSES.ID.eq(bId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return new BusOverview(bus.getId(), bus.getName());
        });
    }

    public static class BusMin {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @JsonCreator
        public BusMin(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class BusOverview extends BusMin {

        @JsonCreator
        public BusOverview(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            super(id, name);
        }
    }
}
