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

import org.pac4j.core.authorization.authorizer.Authorizer;
import org.pac4j.core.context.WebContext;

public class GenericAuthorizer<U extends CockpitProfile> implements Authorizer<U> {

    private String permission;

    public GenericAuthorizer(String permission) {
        this.permission = permission;
    }

    @Override
    public boolean isAuthorized(WebContext context, List<U> profiles) {
        long wsId = Long.parseLong((context.getPath().split("workspaces/")[1].split("/"))[0]);
        return profiles.stream().anyMatch(profile -> profile.getWorkspacePermissions(wsId).contains(this.permission));
    }

}
