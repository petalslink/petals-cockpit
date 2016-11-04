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
package org.ow2.petals.cockpit.server.security;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.resources.UserSession.UserData;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.credentials.authenticator.Authenticator;
import org.pac4j.core.exception.BadCredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.pac4j.core.profile.CommonProfile;

public class MockAuthenticator implements Authenticator<@Nullable UsernamePasswordCredentials> {

    public static final UserData ADMIN = new UserData("admin", "Administrator");

    @Override
    public void validate(@Nullable UsernamePasswordCredentials credentials, @Nullable WebContext context)
            throws HttpAction {
        assert context != null;
        assert credentials != null;
        if (ADMIN.getUsername().equals(credentials.getUsername())) {
            final CommonProfile userProfile = new CommonProfile();
            userProfile.setId(ADMIN.getUsername());
            userProfile.addAttribute("display_name", ADMIN.getName());
            credentials.setUserProfile(userProfile);
        } else {
            throw new BadCredentialsException("Bad credentials for: " + credentials.getUsername());
        }
    }
}
