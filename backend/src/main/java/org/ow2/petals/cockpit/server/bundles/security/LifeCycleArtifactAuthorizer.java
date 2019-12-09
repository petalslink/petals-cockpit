/**
 * Copyright (C) 2019 Linagora
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

import java.util.List;
import java.util.Set;

import org.pac4j.core.authorization.authorizer.Authorizer;
import org.pac4j.core.context.WebContext;

public class LifeCycleArtifactAuthorizer<U extends CockpitProfile> implements Authorizer<U> {

    @Override
    public boolean isAuthorized(WebContext context, List<U> profiles) {
        long wsId = Long.parseLong((context.getPath().split("workspaces/")[1].split("/"))[0]);
        for (U profile : profiles) {
            Set<String> permissions = profile.getWorkspacePermissions(wsId);
            if (context.getRequestContent().contains("Unloaded")) {
                return permissions.contains(CockpitProfile.DEPLOY_ARTIFACT_PERMISSION);
            }
            return permissions.contains(CockpitProfile.LIFECYCLE_ARTIFACT_PERMISSION);
        }
        return false;
    }

}
