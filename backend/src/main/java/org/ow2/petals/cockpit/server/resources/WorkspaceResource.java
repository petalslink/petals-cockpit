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
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.GetWorkspaceTree;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.ImportBus;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.NewWorkspaceClient;
import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinServiceUnit;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinServiceUnit.State;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class WorkspaceResource {

    private final long wsId;

    private final CockpitActors as;

    private final UsersDAO users;

    public WorkspaceResource(CockpitActors as, UsersDAO users, long wsId) {
        this.as = as;
        this.users = users;
        this.wsId = wsId;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public WorkspaceTree get(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
        WorkspaceTree tree = as.call(wsId, new GetWorkspaceTree(profile.getUser().getUsername()))
                .getOrElseThrow(s -> new WebApplicationException(s));

        users.saveLastWorkspace(profile.getUser(), wsId);

        return tree;
    }

    /**
     * Produces {@link WorkspaceEvent}
     */
    @GET
    @Path("/events")
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public EventOutput sse(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
        final EventOutput eo = new EventOutput();

        as.call(wsId, new NewWorkspaceClient(profile.getUser().getUsername(), eo))
                .getOrElseThrow(s -> new WebApplicationException(s));

        return eo;
    }

    @POST
    @Path("/buses")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public BusInProgress addBus(@Pac4JProfile CockpitProfile profile, @Valid NewBus nb) throws InterruptedException {
        return as.call(wsId, new ImportBus(profile.getUser().getUsername(), nb))
                .getOrElseThrow(s -> new WebApplicationException(s));
    }

    @Path("/buses/{bId}")
    public BusResource bus(@PathParam("bId") @Min(1) long bId) {
        return new BusResource(as, wsId, bId);
    }

    public static class MinWorkspace {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public MinWorkspace(long id, String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
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

    public static class NewSUState {

        @Min(1)
        public final long id;

        @NotNull
        @JsonProperty
        public final MinServiceUnit.State state;

        @JsonCreator
        public NewSUState(@JsonProperty("id") long id, @JsonProperty("state") State state) {
            this.id = id;
            this.state = state;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class WorkspaceEvent {

        public static enum Type {
            BUS_IMPORT_ERROR, BUS_IMPORT_OK, SU_STATE_CHANGE
        }

        @JsonProperty
        public final Type event;

        @JsonProperty
        public final Object data;

        public WorkspaceEvent(Type event, Object data) {
            this.event = event;
            this.data = data;
        }

        public static WorkspaceEvent busImportError(BusInError bus) {
            return new WorkspaceEvent(Type.BUS_IMPORT_ERROR, bus);
        }

        public static WorkspaceEvent busImportOk(BusTree bus) {
            return new WorkspaceEvent(Type.BUS_IMPORT_OK, bus);
        }

        public static WorkspaceEvent suStateChange(NewSUState ns) {
            return new WorkspaceEvent(Type.SU_STATE_CHANGE, ns);
        }

        @Override
        public String toString() {
            return "WorkspaceEvent [event=" + event + ", data=" + data + "]";
        }
    }
}
