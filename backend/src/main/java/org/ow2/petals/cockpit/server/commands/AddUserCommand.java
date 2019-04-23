/**
 * Copyright (C) 2016-2019 Linagora
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
package org.ow2.petals.cockpit.server.commands;

import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import org.eclipse.jetty.util.component.LifeCycle;
import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.LdapConfigFactory;
import org.ow2.petals.cockpit.server.bundles.security.CockpitAuthenticator;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;

import com.bendb.dropwizard.jooq.JooqFactory;

import io.dropwizard.cli.ConfiguredCommand;
import io.dropwizard.db.ManagedDataSource;
import io.dropwizard.lifecycle.JettyManaged;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import net.sourceforge.argparse4j.impl.Arguments;
import net.sourceforge.argparse4j.inf.MutuallyExclusiveGroup;
import net.sourceforge.argparse4j.inf.Namespace;
import net.sourceforge.argparse4j.inf.Subparser;

/**
 * This commands adds an user to the database
 *
 * @author vnoel, psouquet
 *
 */
public class AddUserCommand<C extends CockpitConfiguration> extends ConfiguredCommand<C> {

    public AddUserCommand() {
        super("add-user", "Add a user to the database");
    }

    @Override
    public void configure(Subparser subparser) {
        super.configure(subparser);

        subparser.addArgument("-u", "--username").dest("username").required(true);
        subparser.addArgument("-n", "--name").dest("name").required(true);
        MutuallyExclusiveGroup meg = subparser.addMutuallyExclusiveGroup().required(true);
        meg.addArgument("-p", "--password").dest("password");
        meg.addArgument("-l", "--ldapUser").dest("ldapUser").action(Arguments.storeTrue());
        subparser.addArgument("-a", "--admin").dest("admin").action(Arguments.storeTrue());
        subparser.addArgument("-w", "--workspacename").dest("workspaceName").required(false);
    }

    @Override
    protected void run(Bootstrap<C> bootstrap, Namespace namespace, C configuration) throws Exception {

        configuration.getDataSourceFactory().asSingleConnectionPool();

        final Environment environment = new Environment(bootstrap.getApplication().getName(),
                bootstrap.getObjectMapper(), bootstrap.getValidatorFactory().getValidator(),
                bootstrap.getMetricRegistry(), bootstrap.getClassLoader(), bootstrap.getHealthCheckRegistry());

        final String username = namespace.getString("username");
        // it is required
        assert username != null;

        final String name = namespace.getString("name");
        // required
        assert name != null;

        final String password = namespace.getString("password");

        final Boolean ldapUser = namespace.getBoolean("ldapUser");
        assert ldapUser != null;

        final Boolean admin = namespace.getBoolean("admin");
        assert admin != null;

        // either ldap user or user with password
        assert ldapUser ^ password != null;

        String workspaceName = namespace.getString("workspaceName");

        Configuration jooqConf = new JooqFactory().build(environment, configuration.getDataSourceFactory());

        for (LifeCycle lifeCycle : environment.lifecycle().getManagedObjects()) {
            if (lifeCycle instanceof JettyManaged
                    && ((JettyManaged) lifeCycle).getManaged() instanceof ManagedDataSource) {
                lifeCycle.start();
            }
        }

        try (DSLContext jooq = DSL.using(jooqConf)) {
            jooq.transaction(c -> {

                if (DSL.using(c).fetchExists(USERS, USERS.USERNAME.eq(username))) {
                    System.err.println("User " + username + " already exists");
                } else {
                    final UsersRecord userRecord = new UsersRecord(username,
                            password != null ? CockpitAuthenticator.passwordEncoder.encode(password)
                                    : LdapConfigFactory.LDAP_PASSWORD,
                            name, null, admin, ldapUser);
                    DSL.using(c).executeInsert(userRecord);
                    System.out.println("Added user " + username);

                    if (workspaceName != null && !workspaceName.isEmpty()) {
                        WorkspacesRecord wsDb = new WorkspacesRecord();
                        wsDb.setName(workspaceName);
                        wsDb.setDescription("Workspace automatically generated for **" + username + "**.");
                        wsDb.attach(c);
                        wsDb.insert();

                        DSL.using(c)
                                .executeInsert(new UsersWorkspacesRecord(wsDb.getId(), username, true, true, true));

                        userRecord.setLastWorkspace(wsDb.getId());
                        DSL.using(c).executeUpdate(userRecord);

                        System.out.println("Added workspace " + workspaceName);
                    }

                }
            });
        } finally {
            for (LifeCycle lifeCycle : environment.lifecycle().getManagedObjects()) {
                if (lifeCycle instanceof JettyManaged
                        && ((JettyManaged) lifeCycle).getManaged() instanceof ManagedDataSource) {
                    try {
                        lifeCycle.stop();
                    } catch (Exception e) {
                        System.err.println("Exception caught on datasource close: " + e.getMessage());
                    }
                }
            }
        }
    }
}
