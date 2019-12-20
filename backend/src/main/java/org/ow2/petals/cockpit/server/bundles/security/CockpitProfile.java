/**
 * Copyright (C) 2016-2019 Linagora
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
package org.ow2.petals.cockpit.server.bundles.security;

import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.jooq.Configuration;
import org.jooq.Result;
import org.jooq.exception.NoDataFoundException;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.pac4j.core.context.Pac4jConstants;
import org.pac4j.core.profile.CommonProfile;

public class CockpitProfile extends CommonProfile {

    public final static String ADMIN = "ADMIN";

    public final static String ADMIN_WORKSPACE = "ADMIN_WORKSPACE";

    public final static String DEPLOY_ARTIFACT_PERMISSION = "DEPLOY_ARTIFACT";

    public final static String LIFECYCLE_ARTIFACT_PERMISSION = "LIFECYCLEMANAGER_ARTIFACT";

    private Map<Long, Set<String>> permissions = new HashMap<Long, Set<String>>();

    CockpitProfile() {
        // needed because UserProfile is Externalizable
    }

    public CockpitProfile(String username, Configuration conf) {
        setId(username);
        addAttribute(Pac4jConstants.USERNAME, username);
        this.updatePermissions(conf);
    }

    public boolean isAdmin() {
        return getRoles().contains(ADMIN);
    }

    public boolean hasPermission(Long wsId, String permission) {
        if (this.permissions.containsKey(wsId)) {
            final Set<String> workspacePermissions = this.permissions.get(wsId);
            assert workspacePermissions != null;
            return workspacePermissions.contains(permission);
        }
        return false;
    }

    public void updatePermissions(Configuration jooq) {
        DSL.using(jooq).transaction(conf -> {
            this.permissions = getPermissionsMap(conf, this.getId());
            boolean admin = DSL.using(conf).select(USERS.ADMIN).from(USERS).where(USERS.USERNAME.eq(this.getId()))
                    .fetchOptional().orElseThrow(() -> new NoDataFoundException("Admin field is missing !"))
                    .into(Boolean.class).booleanValue();
            if (admin) {
                addRole(ADMIN);
            } else {
                this.getRoles().remove(ADMIN);
            }
        });
    }

    private Map<Long, Set<String>> getPermissionsMap(Configuration jooq, String username) {
        return DSL.using(jooq).transactionResult(conf -> {
            Map<Long, Set<String>> permissionsMap = new HashMap<>();
            Result<UsersWorkspacesRecord> permRow = DSL.using(jooq).selectFrom(USERS_WORKSPACES)
                    .where(USERS_WORKSPACES.USERNAME.eq(username)).fetch();
            for (UsersWorkspacesRecord usWs : permRow) {
                Set<String> permissions = new HashSet<>();
                if (usWs.getAdminWorkspacePermission()) {
                    permissions.add(ADMIN_WORKSPACE);
                }
                if (usWs.getDeployArtifactPermission()) {
                    permissions.add(DEPLOY_ARTIFACT_PERMISSION);
                }
                if (usWs.getLifecycleArtifactPermission()) {
                    permissions.add(LIFECYCLE_ARTIFACT_PERMISSION);
                }
                permissionsMap.put(usWs.getWorkspaceId(), permissions);
            }
            return permissionsMap;
        });
    }

    public Set<String> getWorkspacePermissions(long wsId) {
        return permissions.getOrDefault(wsId, new HashSet<String>());
    }
}
