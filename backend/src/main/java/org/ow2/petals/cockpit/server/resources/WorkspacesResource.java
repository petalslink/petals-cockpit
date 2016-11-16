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

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.actors.WorkspaceTree;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;

@Singleton
@Path("/workspaces")
public class WorkspacesResource {

    private final WorkspacesDAO workspaces;

    @Inject
    public WorkspacesResource(WorkspacesDAO workspaces) {
        this.workspaces = workspaces;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Workspace create(NewWorkspace ws, @Pac4JProfile CockpitProfile profile) {
        DbWorkspace w = workspaces.create(ws.name, profile.getUser());

        return new Workspace(w.id, w.name, w.users);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Workspace> workspaces(@Pac4JProfile CockpitProfile profile) {
        return workspaces.getUserWorkspaces(profile.getUser()).stream().map(w -> new Workspace(w.id, w.name, w.users))
                .collect(Collectors.toList());
    }

    @Path("/{wsId}")
    public Class<WorkspaceResource> workspaceResource() {
        return WorkspaceResource.class;
    }

    @Singleton
    public static class WorkspaceResource {

        private final WorkspacesDAO workspaces;

        private final BusesDAO buses;

        @Inject
        public WorkspaceResource(WorkspacesDAO workspaces, BusesDAO buses) {
            this.buses = buses;
            this.workspaces = workspaces;
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public WorkspaceTree get(@PathParam("wsId") long wsId, @Pac4JProfile CockpitProfile profile) {
            DbWorkspace w = ResourcesHelpers.getWorkspace(workspaces, wsId, profile);

            return workspaces.getWorkspaceTree(w);
        }

        @GET
        @Path("/events")
        @Produces(SseFeature.SERVER_SENT_EVENTS)
        public EventOutput sse(@PathParam("wsId") long wsId, @Pac4JProfile CockpitProfile profile) {
            DbWorkspace w = ResourcesHelpers.getWorkspace(workspaces, wsId, profile);

            final EventOutput eventOutput = new EventOutput();
            WorkspaceActor.newClient(w, eventOutput);

            return eventOutput;
        }

        @Path("/buses")
        public Class<BusesResource> getBuses() {
            return BusesResource.class;
        }
    }

    public static class NewWorkspace {

        @JsonProperty
        public final String name;

        public NewWorkspace(@NotEmpty @JsonProperty("name") String name) {
            this.name = name;
        }
    }

    public static class MinWorkspace extends NewWorkspace {

        public final long id;

        public MinWorkspace(long id, String name) {
            super(name);
            this.id = id;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class Workspace extends MinWorkspace {

        @JsonProperty
        public final ImmutableList<String> usedBy;

        public Workspace(long id, String name, List<String> usedBy) {
            super(id, name);
            this.usedBy = ImmutableList.copyOf(usedBy);
        }
    }
}
