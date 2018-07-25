/**
 * Copyright (C) 2018 Linagora
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
package org.ow2.petals.cockpit.server.services;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.ldaptive.BindOperation;
import org.ldaptive.BindRequest;
import org.ldaptive.Connection;
import org.ldaptive.ConnectionFactory;
import org.ldaptive.Credential;
import org.ldaptive.LdapAttribute;
import org.ldaptive.LdapEntry;
import org.ldaptive.LdapException;
import org.ldaptive.SearchOperation;
import org.ldaptive.SearchRequest;
import org.ldaptive.SearchResult;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.LdapConfigFactory;
import org.ow2.petals.cockpit.server.resources.LdapResource;
import org.ow2.petals.cockpit.server.resources.LdapResource.LdapUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class LdapService {

    private static final Logger LOG = LoggerFactory.getLogger(LdapService.class);

    @Nullable
    private ConnectionFactory connectionFactory;

    @Nullable
    private LdapConfigFactory ldapConf;

    @Inject
    public LdapService(CockpitConfiguration conf) {
        final LdapConfigFactory ldapc = conf.getLdapConfigFactory();
        if (ldapc != null) {
            ldapConf = ldapc;
            connectionFactory = ldapc.buildConnectionFactory();
        }
    }

    public List<LdapResource.LdapUser> getUsersByNameOrUsername(String searchParam) throws LdapException {
        assert searchParam != null && !searchParam.isEmpty() && !searchParam.matches("[()=*]");
        String usernameAttr = getLdapConf().getUsernameAttribute();
        String nameAttr = getLdapConf().getNameAttribute();

        String ldapFilter = String.format("(|(%s=*%s*)(%s=*%s*))", usernameAttr, searchParam, nameAttr, searchParam);
        SearchResult result = searchWithFilter(ldapFilter);

        return extractLdapUsers(usernameAttr, nameAttr, result);
    }

    public LdapUser getUserByUsername(String username) throws LdapException {
        assert username != null && !username.isEmpty();
        String usernameAttr = getLdapConf().getUsernameAttribute();

        String ldapFilter = String.format("(%s=%s)", usernameAttr, username);
        SearchResult result = searchWithFilter(ldapFilter);

        List<LdapUser> users = extractLdapUsers(result);

        if (users.size() == 0) {
            throw new WebApplicationException("Conflict: user not found on LDAP server.", Status.CONFLICT);
        }
        if (users.size() > 1) {
            throw new WebApplicationException("Conflict: multiple users found, usernameAttribute may not be unique.",
                    Status.CONFLICT);
        }
        assert users.size() == 1;

        return users.stream().findFirst().get();
    }

    private List<LdapResource.LdapUser> extractLdapUsers(SearchResult result) {
        return this.extractLdapUsers(getLdapConf().getUsernameAttribute(), getLdapConf().getNameAttribute(), result);
    }

    private List<LdapResource.LdapUser> extractLdapUsers(String usernameAttr, String nameAttr, SearchResult result) {
        assert result != null;
        List<LdapResource.LdapUser> ldapUsers = new ArrayList<LdapResource.LdapUser>(result.getEntries().size());

        for (LdapEntry entry : result.getEntries()) {

            if (LOG.isDebugEnabled()) {
                LOG.debug("attributes(" + entry.getAttributeNames().length + "): ");
                for (LdapAttribute attr : entry.getAttributes()) {
                    LOG.debug("  " + attr.getName() + ": " + attr.getStringValue());
                }
            }

            String username = entry.getAttribute(usernameAttr).getStringValue();
            String name = entry.getAttribute(nameAttr).getStringValue();
            assert name != null && username != null;
            ldapUsers.add(new LdapResource.LdapUser(username, name));
        }
        return ldapUsers;
    }

    private SearchResult searchWithFilter(String ldapFilter) throws LdapException {
        LOG.debug("ldap search filter: " + ldapFilter);
        Connection conn = getConnectionFactory().getConnection();
        try {
            conn.open();
            bindToConnection(conn);

            SearchResult result = (new SearchOperation(conn))
                    .execute(new SearchRequest(getLdapConf().getUsersDn(), ldapFilter)).getResult();

            return result;
        } finally {
            conn.close();
        }
    }

    private void bindToConnection(Connection conn) throws LdapException {
        BindOperation bind = new BindOperation(conn);
        String bindDn = String.format(getLdapConf().getPrincipalDn());
        bind.execute(new BindRequest(bindDn, new Credential(getLdapConf().getPrincipalPassword())));
    }

    private ConnectionFactory getConnectionFactory() {
        assert connectionFactory != null;
        return connectionFactory;
    }

    private LdapConfigFactory getLdapConf() {
        assert ldapConf != null;
        return ldapConf;
    }

}
