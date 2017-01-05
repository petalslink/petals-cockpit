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

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbComponent;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/components")
public class ComponentsResource {

    private final BusesDAO buses;

    @Inject
    public ComponentsResource(BusesDAO buses) {
        this.buses = buses;
    }

    @GET
    @Path("/{compId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ComponentOverview getComp(@PathParam("compId") @Min(1) long compId, @Pac4JProfile CockpitProfile profile) {

        DbComponent comp = buses.getComponentsById(compId, profile.getUser().username);

        if (comp == null) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        if (comp.acl == null) {
            throw new WebApplicationException(Status.FORBIDDEN);
        }

        return new ComponentOverview(comp.id, comp.name, comp.state, comp.type);
    }

    public abstract static class MinComponent {

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
        }

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

        public MinComponent(long id, String name, State state, Type type) {
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

    public static class ComponentOverview extends MinComponent {

        @JsonCreator
        public ComponentOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("type") Type type) {
            super(id, name, state, type);
        }
    }
}
