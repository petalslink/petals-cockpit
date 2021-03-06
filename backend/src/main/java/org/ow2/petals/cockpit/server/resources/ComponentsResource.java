/**
 * Copyright (C) 2016-2020 Linagora
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

import java.util.Map;
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
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.State;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.Type;
import org.ow2.petals.cockpit.server.services.PetalsAdmin;
import org.ow2.petals.jbi.descriptor.original.generated.ComponentType;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

@Singleton
@Path("/components")
public class ComponentsResource {

    private final Configuration jooq;

    private final PetalsAdmin petals;

    @Inject
    public ComponentsResource(Configuration jooq, PetalsAdmin petals) {
        this.jooq = jooq;
        this.petals = petals;
    }

    @GET
    @Path("/{compId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ComponentOverview overview(@NotNull @PathParam("compId") @Min(1) long compId,
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

            ContainersRecord container = DSL.using(conf).selectFrom(CONTAINERS)
                    .where(CONTAINERS.ID.eq(comp.getContainerId())).fetchOne();
            assert container != null;

            ComponentMin.Type type = ComponentMin.Type.from(comp.getType());
            assert type != null;

            Map<String, String> parameters = petals.getParameters(container.getIp(), container.getPort(),
                    container.getUsername(), container.getPassword(), comp.getName(), type.to());

            return new ComponentOverview(parameters);
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

            public static Type from(ComponentType type) {
                switch (type) {
                    case BINDING_COMPONENT:
                        return BC;
                    case SERVICE_ENGINE:
                        return SE;
                    default:
                        throw new AssertionError();
                }
            }

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
        public final Type type;

        public ComponentMin(ComponentsRecord compDb) {
            this(compDb.getId(), compDb.getName(), ComponentMin.Type.valueOf(compDb.getType()));
        }

        @JsonCreator
        private ComponentMin(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("type") Type type) {
            this.id = id;
            this.name = name;
            this.type = type;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ComponentFull {

        @Valid
        @JsonUnwrapped
        public final ComponentMin component;

        @NotNull
        @Min(1)
        public final long containerId;

        @NotNull
        @JsonProperty
        public final State state;

        @JsonProperty
        public final ImmutableSet<String> serviceUnits;

        @JsonProperty
        public final ImmutableSet<String> sharedLibraries;

        private ComponentFull(ComponentMin component, long containerId, State state, Set<String> serviceUnits,
                Set<String> sharedLibraries) {
            this.component = component;
            this.containerId = containerId;
            this.state = state;
            this.serviceUnits = ImmutableSet.copyOf(serviceUnits);
            this.sharedLibraries = ImmutableSet.copyOf(sharedLibraries);
        }

        public ComponentFull(ComponentsRecord compDb, Set<String> serviceUnits, Set<String> sharedLibraries) {
            this(new ComponentMin(compDb), compDb.getContainerId(), ComponentMin.State.valueOf(compDb.getState()),
                    serviceUnits, sharedLibraries);
        }

        @JsonCreator
        private ComponentFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new ComponentMin(0, "", Type.BC), 0, ComponentMin.State.Unknown, ImmutableSet.of(), ImmutableSet.of());
        }

        @JsonProperty
        public String getContainerId() {
            return Long.toString(containerId);
        }
    }

    public static class ComponentOverview {

        @NotNull
        @JsonProperty
        public final ImmutableMap<String, String> parameters;

        @JsonCreator
        public ComponentOverview(@JsonProperty("parameters") Map<String, String> parameters) {
            this.parameters = ImmutableMap.copyOf(parameters);
        }
    }
}
