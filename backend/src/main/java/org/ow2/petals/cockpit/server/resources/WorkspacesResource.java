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
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.allanbank.mongodb.MongoCollection;
import com.allanbank.mongodb.MongoDatabase;
import com.allanbank.mongodb.MongoIterator;
import com.allanbank.mongodb.bson.Document;
import com.allanbank.mongodb.bson.Element;
import com.allanbank.mongodb.bson.builder.BuilderFactory;
import com.allanbank.mongodb.bson.element.ArrayElement;
import com.allanbank.mongodb.bson.element.ObjectIdElement;
import com.allanbank.mongodb.builder.QueryBuilder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/workspaces")
public class WorkspacesResource {

    private final MongoCollection db;

    @Inject
    public WorkspacesResource(MongoDatabase db) {
        assert db != null;
        this.db = db.getCollection("workspaces");
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Workspace create(NewWorkspace ws, @Pac4JProfile CommonProfile profile) {
        Document d = BuilderFactory.start().add("name", ws.getName()).add("users", BuilderFactory.a(profile.getId()))
                .build();
        db.insert(d);
        return Workspace.from(d);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Workspace> workspaces(@Pac4JProfile CommonProfile profile) {
        try (MongoIterator<Document> wss = db.find(QueryBuilder.where("users").all(profile.getId()))) {
            return StreamSupport.stream(wss.spliterator(), false).map(Workspace::from).collect(Collectors.toList());
        }
    }

    @Path("/{wsId}")
    public Class<WorkspaceResource> workspaceResource() {
        return WorkspaceResource.class;
    }

    @Singleton
    public static class WorkspaceResource {

        @GET
        public WorkspaceTree get(@PathParam("wsId") String wsId) {
            // TODO
            return new WorkspaceTree();
        }
    }

    public static class NewWorkspace {

        private final String name;

        public NewWorkspace(@NotEmpty @JsonProperty("name") String name) {
            this.name = name;
        }

        @JsonProperty
        public String getName() {
            return name;
        }
    }

    public static class Workspace extends NewWorkspace {

        private final String id;

        private final String[] usedBy;

        public Workspace(String id, String name, String[] usedBy) {
            super(name);
            this.id = id;
            this.usedBy = usedBy;
        }

        @JsonProperty
        public String getId() {
            return id;
        }

        @JsonProperty
        public String[] getUsedBy() {
            return usedBy;
        }

        public static Workspace from(Document d) {
            String id = d.get(ObjectIdElement.class, "_id").getId().toHexString();
            String name = d.get("name").getValueAsString();
            String[] usedBy = d.get(ArrayElement.class, "users").getEntries().stream().map(Element::getValueAsString)
                    .toArray(String[]::new);
            return new Workspace(id, name, usedBy);
        }
    }

    public static class WorkspaceTree {

    }
}
