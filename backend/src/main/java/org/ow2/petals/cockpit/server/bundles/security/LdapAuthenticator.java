/**
 * Copyright (C) 2016-2018 Linagora
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

import javax.ws.rs.core.MediaType;

import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ldaptive.ConnectionConfig;
import org.ldaptive.Credential;
import org.ldaptive.DefaultConnectionFactory;
import org.ldaptive.LdapException;
import org.ldaptive.auth.AuthenticationRequest;
import org.ldaptive.auth.AuthenticationResponse;
import org.ldaptive.auth.Authenticator;
import org.ldaptive.auth.BindAuthenticationHandler;
import org.ldaptive.auth.FormatDnResolver;
import org.ow2.petals.cockpit.server.LDAPConfigFactory;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.exception.AccountNotFoundException;
import org.pac4j.core.exception.CredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.pac4j.jax.rs.pac4j.JaxRsContext;
import org.pac4j.ldap.profile.service.LdapProfileService;

public class LdapAuthenticator extends LdapProfileService {

    private Authenticator auth;

    public LdapAuthenticator(LDAPConfigFactory ldapConf) {
        ConnectionConfig connConfig = new ConnectionConfig(ldapConf.getUrl());
        connConfig.setUseStartTLS(false);

        FormatDnResolver dnResolver = new FormatDnResolver();
        dnResolver.setFormat(ldapConf.getFormatDn());

        BindAuthenticationHandler authHandler = new BindAuthenticationHandler(new DefaultConnectionFactory(connConfig));

        auth = new Authenticator(dnResolver, authHandler);
    }

    @Override
    public void validate(UsernamePasswordCredentials credentials, WebContext context)
            throws HttpAction, CredentialsException {
        String username = credentials.getUsername();

        Configuration conf = ((JaxRsContext) context).getProviders()
                .getContextResolver(Configuration.class, MediaType.WILDCARD_TYPE).getContext(null);
        UsersRecord user = DSL.using(conf).selectFrom(USERS).where(USERS.USERNAME.eq(username)).fetchOne();

        if (user != null) {
            try {
                AuthenticationResponse response = this.auth
                        .authenticate(new AuthenticationRequest(username, new Credential(credentials.getPassword())));

                if (response.getResult()) { // authentication succeeded
                    credentials.setUserProfile(new CockpitProfile(username, user.getAdmin()));
                } else { // authentication failed
                    throw new CredentialsException("Auth failed: " + response.getMessage());
                }
            } catch (LdapException e) {
                throw new CredentialsException("LdapException: " + e.getMessage());
            }
        } else {
            throw new AccountNotFoundException("No account found for: " + username);
        }
    }
}
