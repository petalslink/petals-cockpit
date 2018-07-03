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
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.ldaptive.ConnectionConfig;
import org.ldaptive.DefaultConnectionFactory;
import org.ldaptive.auth.Authenticator;
import org.ldaptive.auth.BindAuthenticationHandler;
import org.ldaptive.auth.FormatDnResolver;
import org.ow2.petals.cockpit.server.LdapConfigFactory;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.exception.CredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.pac4j.core.exception.MultipleAccountsFoundException;
import org.pac4j.core.exception.TechnicalException;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.jax.rs.pac4j.JaxRsContext;
import org.pac4j.ldap.profile.service.LdapProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LdapAuthenticator extends LdapProfileService {

    protected static final Logger LOG = LoggerFactory.getLogger(LdapAuthenticator.class);

    private static DefaultConnectionFactory connectionFactory;

    private String nameAttr;

    public LdapAuthenticator(LdapConfigFactory ldapConf) {
        final String usersDn = ldapConf.getUsersDn();
        final String usernameAttr = ldapConf.getUsernameAttribute();
        nameAttr = ldapConf.getNameAttribute();
        final String passwordAttr = ldapConf.getPasswordAttribute();
        assert usernameAttr != null && !usernameAttr.isEmpty();
        assert usersDn != null && !usersDn.isEmpty();

        ConnectionConfig connConfig = new ConnectionConfig(ldapConf.getUrl());
        connConfig.setUseStartTLS(false);

        FormatDnResolver dnResolver = new FormatDnResolver();
        dnResolver.setFormat(usernameAttr + "=%s," + usersDn);

        connectionFactory = new DefaultConnectionFactory(connConfig);
        BindAuthenticationHandler authHandler = new BindAuthenticationHandler(connectionFactory);

        this.setUsersDn(usersDn);
        this.setUsernameAttribute(usernameAttr);
        this.setAttributes(nameAttr);
        if (passwordAttr != null && !passwordAttr.isEmpty()) {
            this.setPasswordAttribute(passwordAttr);
        }
        this.setConnectionFactory(connectionFactory);
        this.setLdapAuthenticator(new Authenticator(dnResolver, authHandler));
    }

    @Override
    public void validate(UsernamePasswordCredentials credentials, WebContext context)
            throws HttpAction, CredentialsException {
        String username = credentials.getUsername();

        Configuration conf = ((JaxRsContext) context).getProviders()
                .getContextResolver(Configuration.class, MediaType.WILDCARD_TYPE).getContext(null);
        final DSLContext ctx = DSL.using(conf);

        if (ctx.fetchExists(ctx.select().from(USERS).where(USERS.USERNAME.eq(username)).andNot(USERS.IS_FROM_LDAP))) {
            throw new MultipleAccountsFoundException("User " + username + " is already registered as not LDAP user");
        }

        try {
            super.validate(credentials, context);

            UsersRecord user = ctx.selectFrom(USERS).where(USERS.USERNAME.eq(username)).and(USERS.IS_FROM_LDAP)
                    .fetchOne();
            if (user == null) {
                user = ctx.transactionResult(c -> {
                    UsersRecord tempUser = new UsersRecord(username, "ldap", getName(credentials), null, false, true);
                    DSL.using(c).executeInsert(tempUser);
                    return tempUser;
                });
                assert user != null;

                LOG.info("LDAP user {} was automatically inserted in DB.", username);
            }

            credentials.setUserProfile(new CockpitProfile(username, user.getAdmin()));
            LOG.debug("LDAP user {} credentials validated.", username);

        } catch (TechnicalException e) {
            LOG.debug("LDAP technical exception during " + username + " credential validation", e.getCause());
            throw e;
        }
    }

    private String getName(UsernamePasswordCredentials credentials) {
        final CommonProfile profile = credentials.getUserProfile();
        assert profile != null;

        Object attribute = profile.getAttribute(nameAttr);
        if (attribute != null && attribute instanceof String && !((String) attribute).isEmpty()) {
            return (String) attribute;
        } else {
            return credentials.getUsername();
        }
    }

    public static DefaultConnectionFactory getConnectionFactoryInstance() {
        return connectionFactory;
    }
}
