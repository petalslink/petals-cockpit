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

import java.util.List;
import java.util.Map;
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
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.UserSession.UserMin;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

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

        return new Workspace(w.id, w.name, ImmutableList.of(profile.getUser().username));
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public Workspaces workspaces(@Pac4JProfile CockpitProfile profile) {
        // TODO this should be done in a transaction...
        ImmutableMap.Builder<String, Workspace> wss = ImmutableMap.builder();
        ImmutableMap.Builder<String, UserMin> users = ImmutableMap.builder();

        workspaces.getUserWorkspaces(profile.getUser()).stream().forEach(w -> {
            List<DbUser> dbUsers = workspaces.getWorkspaceUsers(w.id);

            List<String> wsUsers = dbUsers.stream().map(DbUser::getUsername).collect(ImmutableList.toImmutableList());
            wss.put(String.valueOf(w.id), new Workspace(w.id, w.name, wsUsers));
            users.putAll(dbUsers.stream()
                    .collect(Collectors.toMap(DbUser::getUsername, u -> new UserMin(u.username, u.name))));
        });

        return new Workspaces(wss.build(), users.build());
    }

    public static class NewWorkspace {

        @NotEmpty
        @JsonProperty
        public final String name;

        @JsonCreator
        public NewWorkspace(@JsonProperty("name") String name) {
            this.name = name;
        }
    }

    public static class Workspace {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @JsonProperty
        public final ImmutableList<String> users;

        @JsonCreator
        public Workspace(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("users") List<String> users) {
            this.id = id;
            this.name = name;
            this.users = ImmutableList.copyOf(users);
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class Workspaces {

        @JsonProperty
        public final ImmutableMap<String, Workspace> workspaces;

        @Valid
        @JsonProperty
        public final ImmutableMap<String, UserMin> users;

        @JsonCreator
        public Workspaces(Map<String, Workspace> workspaces, Map<String, UserMin> users) {
            this.workspaces = ImmutableMap.copyOf(workspaces);
            this.users = ImmutableMap.copyOf(users);
        }
    }
}
