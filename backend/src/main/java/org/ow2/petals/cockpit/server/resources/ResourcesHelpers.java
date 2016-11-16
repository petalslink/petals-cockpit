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

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.security.CockpitProfile;

public class ResourcesHelpers {

    private ResourcesHelpers() {
        // helper class
    }

    public static DbWorkspace getWorkspace(WorkspacesDAO workspaces, long wsId, CockpitProfile profile) {
        DbWorkspace w = workspaces.findById(wsId);

        if (w == null) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        if (!w.users.stream().anyMatch(profile.getUser().username::equals)) {
            throw new WebApplicationException(Status.FORBIDDEN);
        }

        return w;
    }
}
