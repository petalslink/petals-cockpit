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
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
public class BusesResource {

    private final WorkspacesDAO workspaces;

    @Inject
    public BusesResource(WorkspacesDAO workspaces) {
        this.workspaces = workspaces;
    }

    @Path("/{bId}")
    public Class<BusResource> busResource() {
        return BusResource.class;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public BusInProgress addBus(@PathParam("wsId") long wsId, @Pac4JProfile CockpitProfile profile, NewBus nb) {
        DbWorkspace w = ResourcesHelpers.getWorkspace(workspaces, wsId, profile);

        return WorkspaceActor.importBus(w, nb);
    }

    public static class BusResource {

        private final BusesDAO buses;

        @Inject
        public BusResource(BusesDAO buses) {
            this.buses = buses;
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public BusConfig get(@PathParam("bId") long bId) {
            // TODO
            return new BusConfig(bId);
        }

        @DELETE
        public void delete(@PathParam("bId") String bId) {
            // TODO validate workspace and access right!
            buses.delete(bId);
        }
    }

    public static class NewBus {

        @JsonProperty
        public final String importIp;

        @JsonProperty
        public final int importPort;

        @JsonProperty
        public final String importUsername;

        @JsonIgnore
        public final String importPassword;

        @JsonIgnore
        public final String importPassphrase;

        public NewBus(@NotEmpty @JsonProperty("ip") String ip, @NotEmpty @JsonProperty("port") int port,
                @NotEmpty @JsonProperty("username") String username,
                @NotEmpty @JsonProperty("password") String password,
                @NotEmpty @JsonProperty("passphrase") String passphrase) {
            this.importIp = ip;
            this.importPort = port;
            this.importUsername = username;
            this.importPassword = password;
            this.importPassphrase = passphrase;
        }
    }

    public static class BusInProgress extends NewBus {

        public final long id;

        @JsonCreator
        private BusInProgress(@NotEmpty @JsonProperty("id") String id, @NotEmpty @JsonProperty("ip") String ip,
                @NotEmpty @JsonProperty("port") int port, @NotEmpty @JsonProperty("username") String username) {
            this(Long.valueOf(id), ip, port, username);
        }

        public BusInProgress(long id, String ip, int port, String username) {
            super(ip, port, username, "", "");
            this.id = id;
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

    public static class BusConfig {

        public final long id;

        public BusConfig(long id) {
            this.id = id;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }

    }
}
