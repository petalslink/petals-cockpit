/**
 * Copyright (C) 2016-2017 Linagora
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

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
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
    @Valid
    public Workspace create(@Valid NewWorkspace ws, @Pac4JProfile CockpitProfile profile) {
        DbWorkspace w = workspaces.create(ws.name, profile.getUser());

        return new Workspace(w.id, w.name, Arrays.asList(profile.getUser().username));
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public List<Workspace> workspaces(@Pac4JProfile CockpitProfile profile) {
        return workspaces.getUserWorkspaces(profile.getUser()).stream()
                .map(w -> new Workspace(w.id, w.name, workspaces.getWorkspaceUsers(w.id)))
                .collect(Collectors.toList());
    }

    public static class NewWorkspace {

        @NotEmpty
        @JsonProperty
        public final String name;

        public NewWorkspace(@JsonProperty("name") String name) {
            this.name = name;
        }
    }

    public static class MinWorkspace {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public MinWorkspace(@JsonProperty("id") long id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
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
