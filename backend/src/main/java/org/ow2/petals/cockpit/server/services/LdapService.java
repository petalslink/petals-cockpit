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
import java.util.Collection;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

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
import org.ow2.petals.cockpit.server.bundles.security.LdapAuthenticator;
import org.ow2.petals.cockpit.server.resources.LdapResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class LdapService {

    private static final Logger LOG = LoggerFactory.getLogger(LdapService.class);

    private ConnectionFactory connectionFactory;

    private LdapConfigFactory ldapConf;

    @Inject
    public LdapService(CockpitConfiguration conf) {
        this.ldapConf = conf.getLdapConfigFactory();
        this.connectionFactory = LdapAuthenticator.getConnectionFactoryInstance();
    }

    public List<LdapResource.LdapUser> getUsersByNameOrUsername(String searchParam) throws LdapException {
        assert searchParam != null && !searchParam.isEmpty() && !searchParam.matches("[()=*]");

        Connection conn = this.connectionFactory.getConnection();
        try {
            String usernameAttr = ldapConf.getUsernameAttribute();
            String nameAttr = ldapConf.getNameAttribute();

            conn.open();

            bindToConnection(conn);

            SearchOperation search = new SearchOperation(conn);

            String ldapFilter = String.format("(|(%s=*%s*)(%s=*%s*))", usernameAttr, searchParam, nameAttr,
                    searchParam);
            LOG.debug("ldap search filter: " + ldapFilter);

            SearchResult result = search.execute(new SearchRequest(ldapConf.getUsersDn(), ldapFilter)).getResult();

            Collection<LdapEntry> entries = result.getEntries();
            List<LdapResource.LdapUser> ldapUsers = new ArrayList<LdapResource.LdapUser>(entries.size());
            for (LdapEntry entry : result.getEntries()) {
                LOG.debug("attributes(" + entry.getAttributeNames().length + "): ");
                for (LdapAttribute attr : entry.getAttributes()) {
                    LOG.debug("  " + attr.getName() + ": " + attr.getStringValue());
                }
                String username = entry.getAttribute(usernameAttr).getStringValue();
                String name = entry.getAttribute(nameAttr).getStringValue();
                ldapUsers.add(new LdapResource.LdapUser(username, name));
            }

            return ldapUsers;
        } finally {
            conn.close();
        }
    }

    private void bindToConnection(Connection conn) throws LdapException {
        BindOperation bind = new BindOperation(conn);

        String bindDn = String.format(ldapConf.getPrincipalDn());
        bind.execute(new BindRequest(bindDn, new Credential(ldapConf.getPrincipalPassword())));
    }
}
