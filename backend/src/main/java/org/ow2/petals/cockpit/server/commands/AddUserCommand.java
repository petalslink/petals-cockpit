/**
 * Copyright (C) 2016-2020 Linagora
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
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import org.eclipse.jdt.annotation.Nullable;
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
import org.ow2.petals.cockpit.server.services.LdapService;

import com.bendb.dropwizard.jooq.JooqFactory;

import io.dropwizard.cli.ConfiguredCommand;
import io.dropwizard.db.ManagedDataSource;
import io.dropwizard.lifecycle.JettyManaged;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import net.sourceforge.argparse4j.impl.Arguments;
import net.sourceforge.argparse4j.inf.Namespace;
import net.sourceforge.argparse4j.inf.Subparser;

/**
 * This commands adds an user to the database
 *
 * @author vnoel, psouquet
 *
 */
public class AddUserCommand<C extends CockpitConfiguration> extends ConfiguredCommand<C> {

    private boolean ldapUser;

    @Nullable
    private String username;

    @Nullable
    private String name;

    @Nullable
    private String password;

    private boolean admin;

    @Nullable
    private String workspaceName;

    private boolean adminWorkspace;

    private boolean deployArtifact;

    private boolean lifecycleArtifact;

    public AddUserCommand() {
        super("add-user", "Add a user to the database");
    }

    @Override
    public void configure(Subparser subparser) {
        super.configure(subparser);

        subparser.addArgument("-l", "--ldapUser").dest("ldapUser").action(Arguments.storeTrue());

        subparser.addArgument("-u", "--username").dest("username").required(true);
        subparser.addArgument("-n", "--name").dest("name");
        subparser.addArgument("-p", "--password").dest("password");

        subparser.addArgument("-a", "--admin").dest("admin").action(Arguments.storeTrue());

        subparser.addArgument("-w", "--workspacename").dest("workspaceName");

        subparser.addArgument("-A", "--adminWorkspace").dest("adminWorkspace").action(Arguments.storeTrue());
        subparser.addArgument("-D", "--deployArtifact").dest("deployArtifact").action(Arguments.storeTrue());
        subparser.addArgument("-L", "--lifecycleArtifact").dest("lifecycleArtifact").action(Arguments.storeTrue());
    }

    @Override
    protected void run(Bootstrap<C> bootstrap, Namespace namespace, C configuration) throws Exception {

        configuration.getDataSourceFactory().asSingleConnectionPool();

        final Environment environment = new Environment(bootstrap.getApplication().getName(),
                bootstrap.getObjectMapper(), bootstrap.getValidatorFactory().getValidator(),
                bootstrap.getMetricRegistry(), bootstrap.getClassLoader(), bootstrap.getHealthCheckRegistry());

        initArguments(namespace);

        checkArguments();

        if (this.ldapUser) {
            if (configuration.getLdapConfigFactory() == null) {
                throw new AddUserCommandException("LDAP configuration not found");
            }
            LdapService ldapService = new LdapService(configuration);
            assert this.username != null;
            this.name = ldapService.getUserByUsername(this.username).name;
        }

        Configuration jooqConf = new JooqFactory().build(environment, configuration.getDataSourceFactory());

        for (LifeCycle lifeCycle : environment.lifecycle().getManagedObjects()) {
            if (lifeCycle instanceof JettyManaged
                    && ((JettyManaged) lifeCycle).getManaged() instanceof ManagedDataSource) {
                lifeCycle.start();
            }
        }

        try (DSLContext jooq = DSL.using(jooqConf)) {
            jooq.transaction(c -> {

                if (DSL.using(c).fetchExists(USERS, USERS.USERNAME.eq(this.username))) {
                    throw new AddUserCommandException("User " + this.username + " already exists");
                } else {
                    final UsersRecord userRecord = new UsersRecord(this.username,
                            this.password != null ? CockpitAuthenticator.passwordEncoder.encode(this.password)
                                    : LdapConfigFactory.LDAP_PASSWORD,
                            this.name, null, this.admin, this.ldapUser);
                    DSL.using(c).executeInsert(userRecord);
                    System.out.println("Added user " + this.username);

                    if (this.workspaceName != null && !this.workspaceName.isEmpty()) {
                        WorkspacesRecord wsDb = DSL.using(c).fetchOne(WORKSPACES,
                                WORKSPACES.NAME.equalIgnoreCase(this.workspaceName));
                        if (wsDb == null) {
                            wsDb = new WorkspacesRecord();
                            wsDb.setName(this.workspaceName);
                            wsDb.setDescription("Workspace automatically generated for **" + this.username + "**.");
                            wsDb.attach(c);
                            wsDb.insert();

                            System.out.println("Added workspace " + this.workspaceName);
                        }

                        DSL.using(c).executeInsert(new UsersWorkspacesRecord(wsDb.getId(), this.username,
                                this.adminWorkspace, this.deployArtifact, this.lifecycleArtifact));

                        userRecord.setLastWorkspace(wsDb.getId());
                        DSL.using(c).executeUpdate(userRecord);
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
                        throw new AddUserCommandException(e);
                    }
                }
            }
        }
    }

    private void initArguments(Namespace namespace) {
        this.ldapUser = namespace.getBoolean("ldapUser");

        this.username = namespace.getString("username");
        this.name = namespace.getString("name");
        this.password = namespace.getString("password");

        this.admin = namespace.getBoolean("admin");

        this.workspaceName = namespace.getString("workspaceName");

        this.adminWorkspace = namespace.getBoolean("adminWorkspace");
        this.deployArtifact = namespace.getBoolean("deployArtifact");
        this.lifecycleArtifact = namespace.getBoolean("lifecycleArtifact");
    }

    private void checkArguments() throws AddUserCommandException {
        if (this.ldapUser) {
            if (this.password != null) {
                throw new AddUserCommandException("Cannot use -p/--password with -l/--ldapUser");
            }
            if (this.name != null) {
                throw new AddUserCommandException("Cannot use -n/--name with -l/--ldapUser");
            }
        } else {
            if (this.password == null) {
                throw new AddUserCommandException("-p/--password is required");
            }
            if (this.name == null) {
                throw new AddUserCommandException("-n/--name is required");
            }
        }

        if (this.workspaceName == null && (this.adminWorkspace || this.deployArtifact || this.lifecycleArtifact)) {
            throw new AddUserCommandException("Cannot set workspace permissions without -w/--workspacename");
        }
    }

    public static class AddUserCommandException extends Exception {
        public AddUserCommandException(String message) {
            super(message);
        }
    }
}
