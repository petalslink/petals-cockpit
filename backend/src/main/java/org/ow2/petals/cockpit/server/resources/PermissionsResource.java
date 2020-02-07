/**
 * Copyright (C) 2019-2020 Linagora
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

import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.process.internal.RequestScoped;
import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.Result;
import org.jooq.exception.NoDataFoundException;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.pac4j.core.profile.ProfileManager;
import org.pac4j.jax.rs.annotations.Pac4JProfileManager;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;



@RequestScoped
@Path("/users/{username}/permissions")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PermissionsResource {

    private final CockpitProfile profile;

    private final Configuration jooq;

    private final String username;

    @Inject
    public PermissionsResource(@NotEmpty @PathParam("username") String username,
            @Pac4JProfileManager ProfileManager<CockpitProfile> profileManager, Configuration jooq) {
        this.profile = profileManager.get(true).orElseThrow(() -> new WebApplicationException(Status.UNAUTHORIZED));
        this.jooq = jooq;
        this.username = username;
    }

    @PUT
    public void updatePermissionsWorkspace(@Valid @NotEmpty @JsonProperty Map<Long, PermissionsMin> perms) {
        DSL.using(jooq).transaction(conf -> {
            perms.forEach((wsId, permissions) -> {
                DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wsId))
                        .fetchOptional().orElseThrow(() -> new NoDataFoundException("Workspace does not exist."));

                if (!this.profile.isAdmin() && !this.profile.hasPermission(wsId, CockpitProfile.ADMIN_WORKSPACE)) {
                    throw new WebApplicationException(Status.UNAUTHORIZED);
                }

                final Integer currentAdminsWorkspacesCount = DSL.using(conf).selectCount().from(USERS_WORKSPACES)
                        .where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId))
                        .and(USERS_WORKSPACES.ADMIN_WORKSPACE_PERMISSION.eq(true))
                        .fetchOne(0, int.class);
                boolean isAlreadyAdminWorkspace = DSL.using(conf).select(USERS_WORKSPACES.ADMIN_WORKSPACE_PERMISSION)
                        .from(USERS_WORKSPACES).where(USERS_WORKSPACES.USERNAME.eq(username))
                        .and(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)).fetchOne(0, boolean.class);
                boolean willBeAdmin = permissions.adminWorkspace;
                if (currentAdminsWorkspacesCount == 1 && isAlreadyAdminWorkspace && !willBeAdmin) {
                    throw new WebApplicationException("At least one cockpit administrator must remain!",
                            Status.CONFLICT);
                }

                UsersWorkspacesRecord userUpdated = new UsersWorkspacesRecord();
                userUpdated.setAdminWorkspacePermission(permissions.adminWorkspace);
                userUpdated.setDeployArtifactPermission(permissions.deployArtifact);
                userUpdated.setLifecycleArtifactPermission(permissions.lifecycleArtifact);
                DSL.using(jooq).executeUpdate(userUpdated,
                        USERS_WORKSPACES.USERNAME.eq(username).and(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)));

                if (this.profile.getId().equals(this.username)) {
                    this.profile.updatePermissions(conf);
                }
            });

        });
    }

    @GET
    public ViewPermissions getPermissions(@Nullable @QueryParam("wsId") Long wsId) {
        return DSL.using(jooq).transactionResult(conf -> {
            if (wsId != null) {
                UsersWorkspacesRecord wsPermissions = DSL.using(jooq)
                        .selectFrom(USERS_WORKSPACES)
                        .where(USERS_WORKSPACES.USERNAME.eq(username)
                        .and(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)))
                        .fetchOptional().orElseThrow(() -> new NoDataFoundException("Workspace or username is incorrect!"));
                return new ViewPermissions(wsPermissions);
            } else {
                Map<Long, PermissionsMin> allPermissions = new HashMap<Long, PermissionsMin>();
                Result<UsersWorkspacesRecord> permsRow = DSL.using(jooq).selectFrom(USERS_WORKSPACES)
                        .where(USERS_WORKSPACES.USERNAME.eq(username)).fetch();
                permsRow.forEach((row) -> allPermissions.put(row.getWorkspaceId(), new PermissionsMin(row)));
                return new ViewPermissions(allPermissions);
            }
        });
    }

    public static class PermissionsMin {

        @NotNull
        @JsonProperty
        public final boolean adminWorkspace;

        @NotNull
        @JsonProperty
        public final boolean deployArtifact;

        @NotNull
        @JsonProperty
        public final boolean lifecycleArtifact;

        public PermissionsMin(UsersWorkspacesRecord record) {
            this(record.getAdminWorkspacePermission(), record.getDeployArtifactPermission(),
                    record.getLifecycleArtifactPermission());
        }

        @JsonCreator
        public PermissionsMin(@NotNull @JsonProperty("adminWorkspace") boolean adminWorkspace,
                @NotNull @JsonProperty("deployArtifact") boolean deployArtifact,
                @NotNull @JsonProperty("lifecycleArtifact") boolean lifecycleArtifact) {
            this.adminWorkspace = adminWorkspace;
            this.deployArtifact = deployArtifact;
            this.lifecycleArtifact = lifecycleArtifact;
        }
    }

    public static class ViewPermissions {

        @Valid
        @JsonProperty
        public final ImmutableMap<Long, PermissionsMin> permissions;

        @JsonCreator
        public ViewPermissions(@Valid @JsonProperty("permissions") Map<Long, PermissionsMin> permissions) {
            this.permissions = ImmutableMap.copyOf(permissions);
        }

        public ViewPermissions(UsersWorkspacesRecord workspacePermissions) {
            this.permissions = ImmutableMap.of(workspacePermissions.getWorkspaceId(),
                    new PermissionsMin(workspacePermissions));
        }
    }
}
