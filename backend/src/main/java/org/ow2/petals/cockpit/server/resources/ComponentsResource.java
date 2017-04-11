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

import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_COMPONENTS_CONTAINERS_ID;
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_CONTAINERS_BUSES_ID;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;

import javax.inject.Inject;
import javax.inject.Singleton;
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
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/components")
public class ComponentsResource {

    private final Configuration jooq;

    @Inject
    public ComponentsResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Path("/{compId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ComponentOverview getComp(@NotNull @PathParam("compId") @Min(1) long compId,
            @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            ComponentsRecord comp = DSL.using(conf).selectFrom(COMPONENTS).where(COMPONENTS.ID.eq(compId)).fetchOne();

            if (comp == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(COMPONENTS).onKey(FK_COMPONENTS_CONTAINERS_ID)
                    .where(COMPONENTS.ID.eq(compId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId()))).fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return new ComponentOverview(comp.getId(), comp.getName(), ComponentMin.State.valueOf(comp.getState()),
                    ComponentMin.Type.valueOf(comp.getType()));
        });
    }

    public static class ComponentMin {

        public enum State {
            Unloaded, Loaded, Shutdown, Stopped, Started, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case LOADED:
                        return Loaded;
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    default:
                        throw new AssertionError("impossible");
                }
            }
        }

        public enum Type {
            BC, SE;

            @Nullable
            public static Type from(String type) {
                switch (type.toUpperCase()) {
                    case "BC":
                        return BC;
                    case "SE":
                        return SE;
                    default:
                        return null;
                }
            }

            public static Type from(Component.ComponentType type) {
                switch (type) {
                    case BC:
                        return BC;
                    case SE:
                        return SE;
                    default:
                        throw new AssertionError();
                }
            }

            public Component.ComponentType to() {
                switch (this) {
                    case BC:
                        return Component.ComponentType.BC;
                    case SE:
                        return Component.ComponentType.SE;
                    default:
                        throw new AssertionError();
                }
            }
        }

        @NotNull
        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotNull
        @JsonProperty
        public final State state;

        @NotNull
        @JsonProperty
        public final Type type;

        @JsonCreator
        public ComponentMin(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("type") Type type) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.type = type;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ComponentOverview extends ComponentMin {

        @JsonCreator
        public ComponentOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("type") Type type) {
            super(id, name, state, type);
        }
    }
}
