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

import java.util.Map;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.actors.ContainerActor;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;

@Singleton
public class ContainersResource {

    @Path("/{cId}")
    public Class<ContainerResource> containerResource() {
        return ContainerResource.class;
    }

    public static class ContainerResource {

        private final CockpitActors as;

        @Inject
        public ContainerResource(CockpitActors as) {
            this.as = as;
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        @Valid
        public ContainerOverview get(@PathParam("wsId") @Min(1) long wsId, @PathParam("bId") @Min(1) long bId,
                @PathParam("cId") @Min(1) long cId, @Pac4JProfile CockpitProfile profile) throws InterruptedException {
            return as.call(wsId, new ContainerActor.GetOverview(profile.getUser().getUsername(), bId, cId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }
    }

    public static class ContainerOverview {

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotEmpty
        @JsonProperty
        public final String ip;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int port;

        @JsonProperty
        public final ImmutableMap<String, String> reachabilities;

        public ContainerOverview(String name, String ip, int port, Map<String, String> reachabilities) {
            this.name = name;
            this.ip = ip;
            this.port = port;
            this.reachabilities = ImmutableMap.copyOf(reachabilities);
        }
    }
}
