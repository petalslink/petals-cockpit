/**
 * Copyright (C) 2018-2019 Linagora
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
package org.ow2.petals.cockpit.server.rules;

import java.util.ArrayList;
import java.util.Collection;

import org.eclipse.jdt.annotation.Nullable;
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.ow2.petals.cockpit.server.mocks.MockLdapServer;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;

import io.dropwizard.testing.ConfigOverride;

public class CockpitLdapApplicationRule extends CockpitApplicationRule {

    public final MockLdapServer ldapServer = new MockLdapServer();

    private Collection<NewUser> users = new ArrayList<NewUser>();

    public CockpitLdapApplicationRule(Collection<NewUser> ldapUsers, ConfigOverride... configOverrides) {
        super("application-tests-ldap.yml", configOverrides);
        users = ldapUsers;
    }

    public CockpitLdapApplicationRule(ConfigOverride... configOverrides) {
        super("application-tests-ldap.yml", configOverrides);
    }

    @Override
    @Nullable
    public Statement apply(@Nullable Statement base, @Nullable Description description) {
        Statement superStatement = super.apply(base, description);
        assert superStatement != null;
        assert base != null;
        assert description != null;

        final TestRule ldapServerAround = RulesHelper.around(() -> {
            ldapServer.start();
            ldapServer.addUsers(users);
        }, () -> {
            ldapServer.stop();
        });

        return RulesHelper.chain(superStatement, description, ldapServerAround);
    }

}
