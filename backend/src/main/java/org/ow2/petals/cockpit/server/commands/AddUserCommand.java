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
package org.ow2.petals.cockpit.server.commands;

import java.util.Optional;

import org.eclipse.jetty.util.component.LifeCycle;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.skife.jdbi.v2.DBI;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import io.dropwizard.cli.ConfiguredCommand;
import io.dropwizard.db.ManagedDataSource;
import io.dropwizard.jdbi.DBIFactory;
import io.dropwizard.lifecycle.JettyManaged;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import net.sourceforge.argparse4j.inf.Namespace;
import net.sourceforge.argparse4j.inf.Subparser;

/**
 * This commands creates a Demo workspace in the database
 * 
 * @author vnoel
 *
 */
public class AddUserCommand<C extends CockpitConfiguration> extends ConfiguredCommand<C> {

    private static final PasswordEncoder pwEncoder = new BCryptPasswordEncoder();

    public AddUserCommand() {
        super("add-user", "Add a user to the database");
    }

    @Override
    public void configure(Subparser subparser) {
        super.configure(subparser);

        subparser.addArgument("-u", "--username").dest("username").required(true);
        subparser.addArgument("-n", "--name").dest("name").required(true);
        subparser.addArgument("-p", "--password").dest("password").required(true);
    }

    @Override
    protected void run(Bootstrap<C> bootstrap, Namespace namespace, C configuration)
            throws Exception {

        configuration.getDataSourceFactory().asSingleConnectionPool();
        
        final Environment environment = new Environment(bootstrap.getApplication().getName(),
                bootstrap.getObjectMapper(),
                bootstrap.getValidatorFactory().getValidator(),
                bootstrap.getMetricRegistry(),
                bootstrap.getClassLoader(),
                bootstrap.getHealthCheckRegistry());
        
        final String username = namespace.getString("username");
        // it is required
        assert username != null;

        String password = namespace.getString("password");
        // required
        assert password != null;

        String name = namespace.getString("name");
        // required
        assert name != null;

        final DBI jdbi = new DBIFactory().build(environment, configuration.getDataSourceFactory(), "cockpit");

        for (LifeCycle lifeCycle : environment.lifecycle().getManagedObjects()) {
            if (lifeCycle instanceof JettyManaged
                    && ((JettyManaged) lifeCycle).getManaged() instanceof ManagedDataSource) {
                lifeCycle.start();
            }
        }

        try {
            jdbi.withHandle(h -> {
                UsersDAO users = h.attach(UsersDAO.class);
                Optional<DbUser> mu = users.create(username, pwEncoder.encode(password), name);
                if (mu.isPresent()) {
                    System.out.println("Added user " + username);
                } else {
                    System.err.println("User " + username + " already exists");
                }
                return null;
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
