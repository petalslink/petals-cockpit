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
import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.credentials.authenticator.AbstractUsernamePasswordAuthenticator;
import org.pac4j.core.credentials.password.SpringSecurityPasswordEncoder;
import org.pac4j.core.exception.AccountNotFoundException;
import org.pac4j.core.exception.BadCredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CockpitAuthenticator extends AbstractUsernamePasswordAuthenticator {

    protected final UsersDAO users;

    public CockpitAuthenticator(UsersDAO users) {
        this.users = users;
    }

    @Override
    protected void internalInit(@Nullable WebContext context) {
        setPasswordEncoder(new SpringSecurityPasswordEncoder(new BCryptPasswordEncoder()));
        
        super.internalInit(context);
    }

    @Override
    public void validate(@Nullable UsernamePasswordCredentials credentials, @Nullable WebContext context)
            throws HttpAction {
        assert credentials != null;

        init(context);

        final String username = credentials.getUsername();

        final DbUser user = users.findByUsername(username);

        if (user != null) {
            if (!getPasswordEncoder().matches(credentials.getPassword(), user.getPassword())) {
                throw new BadCredentialsException("Bad credentials for: " + username);
            } else {
                credentials.setUserProfile(new CockpitProfile(user));
            }
        } else {
            throw new AccountNotFoundException("No account found for: " + username);
        }
    }
}
