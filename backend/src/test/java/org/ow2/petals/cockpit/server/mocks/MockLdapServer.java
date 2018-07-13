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
package org.ow2.petals.cockpit.server.mocks;

import java.util.Collection;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;

import com.unboundid.ldap.listener.InMemoryDirectoryServer;
import com.unboundid.ldap.listener.InMemoryDirectoryServerConfig;
import com.unboundid.ldap.listener.InMemoryListenerConfig;
import com.unboundid.ldap.sdk.LDAPException;
import com.unboundid.ldif.LDIFException;

public final class MockLdapServer {

    public final static String BASE_DN = "dc=example,dc=com";
    public final static String BASE_PEOPLE_DN = "ou=people,dc=example,dc=com";
    public final static int PORT = 33389;
    public final static String CN = "cn";
    public final static String SN = "sn";
    public final static String PASSWORD = "userPassword";

    public final static String ADMIN_USERNAME = "adminUid";
    public final static String ADMIN_NAME = "adminName";
    public final static String ADMIN_PASSWORD = "adminpass";

    public final static String BIND_USERNAME = "bind";
    public final static String BIND_PASSWORD = "bindpass";

    public final static NewUser ADMIN = new NewUser(ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME);
    public final static NewUser LDAP_USER1 = new NewUser("user1", "password1", "Jean-Michel Bonsoir");
    public final static NewUser LDAP_USER2 = new NewUser("user2", "password2", "Jean-Louis Bonjour");
    public final static NewUser LDAP_USER3 = new NewUser("user3", "password3", "Marianne Adieu");

    @Nullable
    private InMemoryDirectoryServer ds;

    public void start() {
        try {
            setDs(new InMemoryDirectoryServer(makeDSConfig()));
            getDs().add("dn: " + BASE_DN, "objectClass: organizationalUnit", "objectClass: top");
            getDs().add("dn: " + BASE_PEOPLE_DN, "objectClass: organizationalUnit");

            this.addUser(ADMIN);
            this.addUser(LDAP_USER1);
            this.addUser(LDAP_USER2);
            this.addUser(LDAP_USER3);

            // Debug.setEnabled(true);

            getDs().startListening();

        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void stop() {
        getDs().shutDown(true);
    }

    public void addUsers(Collection<NewUser> users) {
        if (users.size() == 0) {
            return;
        }
        users.stream().forEach(user -> {
            try {
                this.addUser(user);
            } catch (final Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    private void addUser(NewUser user) throws LDIFException, LDAPException {
        getDs().add("dn: " + CN + "=" + user.username + "," + BASE_PEOPLE_DN,
                CN + ": " + user.username,
                SN + ": " + user.name,
                PASSWORD +  ": " + user.password,
                "objectClass: person");
    }

    private InMemoryDirectoryServerConfig makeDSConfig() throws LDAPException {
        final InMemoryDirectoryServerConfig dsConfig = new InMemoryDirectoryServerConfig(BASE_DN);

        dsConfig.setSchema(null);
        dsConfig.setEnforceAttributeSyntaxCompliance(false);
        dsConfig.setEnforceSingleStructuralObjectClass(false);
        dsConfig.setListenerConfigs(new InMemoryListenerConfig("myListener", null, PORT, null, null, null));

        dsConfig.addAdditionalBindCredentials(CN + "=" + ADMIN_USERNAME + "," + BASE_PEOPLE_DN, ADMIN_PASSWORD);
        dsConfig.addAdditionalBindCredentials(CN + "=" + BIND_USERNAME + "," + BASE_PEOPLE_DN, BIND_PASSWORD);
        dsConfig.addAdditionalBindCredentials(CN + "=" + LDAP_USER1.username + "," + BASE_PEOPLE_DN, LDAP_USER1.password);
        dsConfig.addAdditionalBindCredentials(CN + "=" + LDAP_USER2.username + "," + BASE_PEOPLE_DN, LDAP_USER2.password);
        dsConfig.addAdditionalBindCredentials(CN + "=" + LDAP_USER3.username + "," + BASE_PEOPLE_DN, LDAP_USER3.password);

        return dsConfig;
    }


    protected InMemoryDirectoryServer getDs() {
        assert ds != null;
        return ds;
    }

    protected void setDs(InMemoryDirectoryServer ds) {
        this.ds = ds;
    }

}
