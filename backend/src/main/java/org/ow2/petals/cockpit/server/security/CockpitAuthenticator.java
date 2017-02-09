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

import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import javax.ws.rs.core.MediaType;

import org.jooq.Configuration;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.credentials.authenticator.AbstractUsernamePasswordAuthenticator;
import org.pac4j.core.credentials.password.SpringSecurityPasswordEncoder;
import org.pac4j.core.exception.AccountNotFoundException;
import org.pac4j.core.exception.BadCredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.pac4j.jax.rs.pac4j.JaxRsContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CockpitAuthenticator extends AbstractUsernamePasswordAuthenticator {

    @Override
    protected void internalInit(WebContext context) {
        setPasswordEncoder(new SpringSecurityPasswordEncoder(new BCryptPasswordEncoder()));

        assert context instanceof JaxRsContext;

        super.internalInit(context);
    }

    @Override
    public void validate(UsernamePasswordCredentials credentials, WebContext context) throws HttpAction {
        init(context);

        final String username = credentials.getUsername();

        // can't be null according to CockpitExtractor!
        assert username != null;

        Configuration conf = ((JaxRsContext) context).getProviders()
                .getContextResolver(Configuration.class, MediaType.WILDCARD_TYPE).getContext(null);

        Record1<String> pw = DSL.using(conf).select(USERS.PASSWORD).from(USERS).where(USERS.USERNAME.eq(username))
                .fetchOne();

        if (pw != null) {
            if (!getPasswordEncoder().matches(credentials.getPassword(), pw.value1())) {
                throw new BadCredentialsException("Bad credentials for: " + username);
            } else {
                credentials.setUserProfile(new CockpitProfile(username));
            }
        } else {
            throw new AccountNotFoundException("No account found for: " + username);
        }
    }
}
