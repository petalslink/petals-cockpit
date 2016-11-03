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
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;

import com.allanbank.mongodb.MongoCollection;
import com.allanbank.mongodb.MongoDatabase;
import com.allanbank.mongodb.bson.element.ObjectId;
import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
public class BusesResource {

    private final MongoCollection db;

    @Inject
    public BusesResource(MongoDatabase db) {
        assert db != null;
        this.db = db.getCollection("buses");
    }

    @Path("/{bId}")
    public Class<BusResource> busResource() {
        return BusResource.class;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Bus addBus(@PathParam("wsId") String wsId, NewBus nb) {
        ObjectId id = new ObjectId();
        String stringId = id.toHexString();
        WorkspaceActor.send(wsId, new WorkspaceActor.ImportBus(stringId, nb));
        return new Bus(stringId);
    }

    public static class BusResource {

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public BusTree get(@PathParam("bId") String bId) {
            // TODO
            return new BusTree(bId);
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

    public static class BusTree extends Bus {

        public BusTree(String id) {
            super(id);
        }

    }
}
