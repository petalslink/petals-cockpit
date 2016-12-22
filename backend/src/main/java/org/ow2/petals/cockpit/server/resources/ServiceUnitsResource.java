/**
 * Copyright (C) 2016 Linagora
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
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbServiceUnit;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/serviceunits")
public class ServiceUnitsResource {

    private final BusesDAO buses;

    @Inject
    public ServiceUnitsResource(BusesDAO buses) {
        this.buses = buses;
    }

    @GET
    @Path("/{suId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ServiceUnitOverview getSU(@PathParam("suId") @Min(1) long suId, @Pac4JProfile CockpitProfile profile) {

        DbServiceUnit su = buses.getServiceUnitById(suId, profile.getUser().getUsername());

        if (su == null) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        if (su.acl == null) {
            throw new WebApplicationException(Status.FORBIDDEN);
        }

        return new ServiceUnitOverview(su.id, su.name, su.state, su.saName);
    }

    public abstract static class MinServiceUnit {
        public enum State {
            Unloaded, Started, Stopped, Shutdown, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    case LOADED:
                        throw new AssertionError("Loaded state does not exist for SA/SU");
                    default:
                        throw new AssertionError("impossible");
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
        public final String saName;

        public MinServiceUnit(long id, String name, State state, String saName) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.saName = saName;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ServiceUnitOverview extends MinServiceUnit {

        public ServiceUnitOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("saName") String saName) {
            super(id, name, state, saName);
        }
    }
}
