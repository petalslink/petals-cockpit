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
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.BusActor;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
public class BusesResource {

    private final CockpitActors as;

    @Inject
    public BusesResource(CockpitActors as) {
        this.as = as;
    }

    @Path("/{bId}")
    public Class<BusResource> busResource() {
        return BusResource.class;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public BusInProgress addBus(@PathParam("wsId") @Min(1) long wsId, @Pac4JProfile CockpitProfile profile,
            @Valid NewBus nb) throws InterruptedException {
        return as.call(wsId, new WorkspaceActor.ImportBus(profile.getUser().getUsername(), nb))
                .getOrElseThrow(s -> new WebApplicationException(s));
    }

    public static class BusResource {

        private final CockpitActors as;

        @Inject
        public BusResource(CockpitActors as) {
            this.as = as;
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        @Valid
        public BusOverview get(@PathParam("wsId") @Min(1) long wsId, @PathParam("bId") @Min(1) long bId,
                @Pac4JProfile CockpitProfile profile) throws InterruptedException {
            return as.call(wsId, new BusActor.GetOverview(profile.getUser().getUsername(), bId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }

        @DELETE
        public void delete(@PathParam("wsId") @Min(1) long wsId, @Pac4JProfile CockpitProfile profile,
                @PathParam("bId") @Min(1) long bId) throws InterruptedException {
            as.call(wsId, new WorkspaceActor.DeleteBus(profile.getUser().getUsername(), bId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }

        @Path("/containers")
        public Class<ContainersResource> getContainers() {
            return ContainersResource.class;
        }
    }

    public static class NewBus {

        @NotEmpty
        @JsonProperty
        public final String ip;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int port;

        @NotEmpty
        @JsonProperty
        public final String username;

        @NotEmpty
        @JsonProperty
        public final String password;

        @NotEmpty
        @JsonProperty
        public final String passphrase;

        public NewBus(@JsonProperty("ip") String ip, @JsonProperty("port") int port,
                @JsonProperty("username") String username, @JsonProperty("password") String password,
                @JsonProperty("passphrase") String passphrase) {
            this.ip = ip;
            this.port = port;
            this.username = username;
            this.password = password;
            this.passphrase = passphrase;
        }
    }

    public static class BusInProgress {

        @NotEmpty
        @JsonProperty
        public final String importIp;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int importPort;

        @NotEmpty
        @JsonProperty
        public final String importUsername;

        @Min(1)
        public final long id;

        @JsonCreator
        private BusInProgress(@JsonProperty("id") String id, @JsonProperty("ip") String ip,
                @JsonProperty("port") int port, @JsonProperty("username") String username) {
            this(Long.valueOf(id), ip, port, username);
        }

        public BusInProgress(long id, String ip, int port, String username) {
            this.id = id;
            this.importIp = ip;
            this.importPort = port;
            this.importUsername = username;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }

    }

    public static class BusInError extends BusInProgress {

        @JsonProperty
        public final String importError;

        public BusInError(long id, String ip, int port, String username, String error) {
            super(id, ip, port, username);
            this.importError = error;
        }
    }

    public static class BusOverview {

        @NotEmpty
        @JsonProperty
        public final String name;

        @JsonCreator
        public BusOverview(@JsonProperty("name") String name) {
            this.name = name;
        }
    }
}
