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

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusTree;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonProperty;

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

        return new Workspace(Long.toString(w.getId()), w.getName(), w.getUsers());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Workspace[] workspaces(@Pac4JProfile CockpitProfile profile) {
        return workspaces.getUserWorkspaces(profile.getUser()).stream()
                .map(w -> new Workspace(Long.toString(w.getId()), w.getName(), w.getUsers()))
                .toArray(Workspace[]::new);
    }

    @Path("/{wsId}")
    public Class<WorkspaceResource> workspaceResource() {
        return WorkspaceResource.class;
    }

    @Singleton
    public static class WorkspaceResource {

        private final WorkspacesDAO workspaces;

        @Inject
        public WorkspaceResource(WorkspacesDAO workspaces) {
            assert workspaces != null;
            this.workspaces = workspaces;
        }

        private DbWorkspace getWorkspace(long wsId, CockpitProfile profile) {
            DbWorkspace w = workspaces.findById(wsId);

            if (w == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            // TODO I should be able to easily use contains on the list...
            if (!w.getUsers().stream().anyMatch(u -> u.equals(profile.getUser().getUsername()))) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return w;
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public WorkspaceTree get(@PathParam("wsId") long wsId, @Pac4JProfile CockpitProfile profile) {
            DbWorkspace w = getWorkspace(wsId, profile);

            return new WorkspaceTree(Long.toString(w.getId()), w.getName());

        }

        @GET
        @Path("/events")
        @Produces(SseFeature.SERVER_SENT_EVENTS)
        public EventOutput sse(@PathParam("wsId") long wsId, @Pac4JProfile CockpitProfile profile) {
            // this validates the workspace
            getWorkspace(wsId, profile);

            final EventOutput eventOutput = new EventOutput();
            WorkspaceActor.send(wsId, new WorkspaceActor.NewClient(eventOutput));
            return eventOutput;
        }

        @Path("/buses")
        public Class<BusesResource> getBuses() {
            return BusesResource.class;
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

    public static class MinWorkspace extends NewWorkspace {

        private final String id;

        public MinWorkspace(String id, String name) {
            super(name);
            this.id = id;
        }

        @JsonProperty
        public String getId() {
            return id;
        }
    }

    public static class Workspace extends MinWorkspace {

        private final List<String> usedBy;

        public Workspace(@NotEmpty @JsonProperty("id") String id, @NotEmpty @JsonProperty("name") String name,
                @NotEmpty @JsonProperty("usedBy") List<String> usedBy) {
            super(id, name);
            this.usedBy = usedBy;
        }

        @JsonProperty
        public List<String> getUsedBy() {
            return usedBy;
        }
    }

    public static class WorkspaceTree extends MinWorkspace {

        private final BusTree[] busesInProgress;

        private final BusTree[] buses;

        public WorkspaceTree(String id, String name) {
            this(id, name, new BusTree[] {}, new BusTree[] {});
        }

        public WorkspaceTree(String id, String name, BusTree[] buses, BusTree[] busesInProgress) {
            super(id, name);
            this.buses = buses;
            this.busesInProgress = busesInProgress;
        }

        @JsonProperty
        public BusTree[] getBuses() {
            return buses;
        }

        @JsonProperty
        public BusTree[] getBusesInProgress() {
            return busesInProgress;
        }
    }
}
