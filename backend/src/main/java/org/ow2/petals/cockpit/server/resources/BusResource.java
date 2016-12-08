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

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.BusActor.GetBusOverview;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.DeleteBus;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class BusResource {

    private final long wsId;

    private final long bId;

    private final CockpitActors as;

    public BusResource(CockpitActors as, long wsId, long bId) {
        this.as = as;
        this.wsId = wsId;
        this.bId = bId;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public BusOverview get(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
        return as.call(wsId, new GetBusOverview(profile.getUser().getUsername(), bId))
                .getOrElseThrow(s -> new WebApplicationException(s));
    }

    @DELETE
    public void delete(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
        as.call(wsId, new DeleteBus(profile.getUser().getUsername(), bId))
                .getOrElseThrow(s -> new WebApplicationException(s));
    }

    @Path("/containers/{cId}")
    public ContainerResource container(@PathParam("cId") @Min(1) long cId) {
        return new ContainerResource(as, wsId, bId, cId);
    }

    public static class MinBus {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @JsonCreator
        public MinBus(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class BusOverview extends MinBus {

        @JsonCreator
        public BusOverview(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            super(id, name);
        }
    }
}
