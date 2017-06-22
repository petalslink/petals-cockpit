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
package org.ow2.petals.cockpit.server.security;

import org.pac4j.core.context.Pac4jConstants;
import org.pac4j.core.profile.CommonProfile;

public class CockpitProfile extends CommonProfile {

    public final static String IS_ADMIN = "isAdmin";

    CockpitProfile() {
        // needed because UserProfile is Externalizable
    }

    public CockpitProfile(String username, boolean isAdmin) {
        setId(username);
        addAttribute(Pac4jConstants.USERNAME, username);
        addAttribute(IS_ADMIN, isAdmin);
    }

    public boolean isAdmin() {
        Object ia = getAttribute(IS_ADMIN);
        if (!(ia instanceof Boolean)) {
            return false;
        } else {
            return (Boolean) ia;
        }
    }

}
