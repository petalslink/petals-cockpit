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

import java.util.List;
import java.util.UUID;

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
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;

import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
public class BusesResource {

    @Path("/{bId}")
    public Class<BusResource> busResource() {
        return BusResource.class;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Bus addBus(@PathParam("wsId") long wsId, NewBus nb) {
        String stringId = UUID.randomUUID().toString();
        // TODO validate that ws exists?
        WorkspaceActor.send(wsId, new WorkspaceActor.ImportBus(stringId, nb));
        return new Bus(stringId);
    }

    public static class BusResource {

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public BusConfig get(@PathParam("bId") String bId) {
            // TODO
            return new BusConfig(bId);
        }

        @DELETE
        public void delete(@PathParam("bId") String bId) {
            // TODO
        }
    }

    public static class NewBus {

        private final String ip;

        private final int port;

        private final String username;

        private final String password;

        private final String passphrase;

        public NewBus(@NotEmpty @JsonProperty("ip") String ip, @NotEmpty @JsonProperty("port") int port,
                @NotEmpty @JsonProperty("username") String username,
                @NotEmpty @JsonProperty("password") String password,
                @NotEmpty @JsonProperty("passphrase") String passphrase) {
            this.ip = ip;
            this.port = port;
            this.username = username;
            this.password = password;
            this.passphrase = passphrase;
        }

        public String getIp() {
            return ip;
        }

        public int getPort() {
            return port;
        }

        public String getUsername() {
            return username;
        }

        public String getPassword() {
            return password;
        }

        public String getPassphrase() {
            return passphrase;
        }
    }

    public static class Bus {

        private final String id;

        public Bus(String id) {
            this.id = id;
        }

        @JsonProperty
        public String getId() {
            return id;
        }
    }

    public static class BusConfig extends Bus {

        public BusConfig(String id) {
            super(id);
        }

    }

    public static class BusTree extends Bus {

        @JsonProperty
        private final String name;

        @JsonProperty
        private final List<ContainerTree> containers;

        public BusTree(String id, String name, List<ContainerTree> containers) {
            super(id);
            this.name = name;
            this.containers = containers;
        }
    }

    public static class ContainerTree {

        public enum State {
            Deployed
        }

        @JsonProperty
        private final String id;

        @JsonProperty
        private final String name;

        @JsonProperty
        private final State state;

        @JsonProperty
        private final List<ComponentTree> components;

        public ContainerTree(String id, String name, State state, List<ComponentTree> components) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.components = components;
        }
    }

    public static class ComponentTree {

        public enum State {
            Loaded, Started, Stopped, Shutdown, Unknown;
            
            public static State from(ArtifactState.State state) {
                switch (state) {
                    case LOADED: return Loaded;
                    case STARTED: return Started;
                    case STOPPED: return Stopped;
                    case SHUTDOWN: return Shutdown;
                    case UNKNOWN: return Unknown;
                    default:
                        throw new AssertionError();
                }
            }
        }

        @JsonProperty
        private final String id;

        @JsonProperty
        private final String name;

        @JsonProperty
        private final State state;

        @JsonProperty
        private final List<SUTree> serviceUnits;

        public ComponentTree(String id, String name, State state, List<SUTree> serviceUnits) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.serviceUnits = serviceUnits;
        }
    }

    public static class SUTree {

        public enum State {
            Loaded, Started, Stopped, Shutdown, Unknown;
            
            public static State from(ArtifactState.State state) {
                switch (state) {
                    case LOADED: return Loaded;
                    case STARTED: return Started;
                    case STOPPED: return Stopped;
                    case SHUTDOWN: return Shutdown;
                    case UNKNOWN: return Unknown;
                    default:
                        throw new AssertionError();
                }
            }
        }

        @JsonProperty
        private final String id;

        @JsonProperty
        private final String name;

        @JsonProperty
        private final State state;

        public SUTree(String id, String name, State state) {
            this.id = id;
            this.name = name;
            this.state = state;
        }
    }
}
