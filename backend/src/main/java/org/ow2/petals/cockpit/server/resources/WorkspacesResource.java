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

import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_USERS_WORKSPACES_USERNAME;
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_USERS_WORKSPACES_WORKSPACE_ID;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
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

    private final Configuration jooq;

    @Inject
    public WorkspacesResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Workspace create(@NotNull @Valid NewWorkspace ws, @Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            WorkspacesRecord wsDb = new WorkspacesRecord(null, ws.name);
            wsDb.attach(conf);
            wsDb.insert();

            DSL.using(conf).executeInsert(new UsersWorkspacesRecord(wsDb.getId(), profile.getId()));

            return new Workspace(wsDb.getId(), wsDb.getName(), ImmutableList.of(profile.getId()));
        });
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Workspaces workspaces(@Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            ImmutableMap.Builder<String, Workspace> wss = ImmutableMap.builder();
            // we need a normal Map because ImmutableMap does not accept duplicate put
            // and with multiple workspaces it can be the case...
            Map<String, UserMin> users = new HashMap<>();

            for (WorkspacesRecord w : DSL.using(conf).select().from(WORKSPACES).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_WORKSPACES_WORKSPACE_ID).where(USERS_WORKSPACES.USERNAME.eq(profile.getId()))
                    .fetchInto(WORKSPACES)) {

                ImmutableList.Builder<String> wsUsers = ImmutableList.builder();
                for (UsersRecord u : DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                        .onKey(FK_USERS_WORKSPACES_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(w.getId()))
                        .fetchInto(USERS)) {
                    wsUsers.add(u.getUsername());
                    users.put(u.getUsername(), new UserMin(u.getUsername(), u.getName()));
                }

                wss.put(String.valueOf(w.getId()), new Workspace(w.getId(), w.getName(), wsUsers.build()));
            }

            return new Workspaces(wss.build(), users);
        });
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

        @NotNull
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
        public Workspaces(@JsonProperty("workspaces") Map<String, Workspace> workspaces,
                @JsonProperty("users") Map<String, UserMin> users) {
            this.workspaces = ImmutableMap.copyOf(workspaces);
            this.users = ImmutableMap.copyOf(users);
        }
    }
}
