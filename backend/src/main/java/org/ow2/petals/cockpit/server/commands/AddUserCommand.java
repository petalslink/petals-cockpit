/**
 * Copyright (C) 2016 Linagora
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

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;
import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.skife.jdbi.v2.DBI;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import io.dropwizard.Application;
import io.dropwizard.Configuration;
import io.dropwizard.cli.EnvironmentCommand;
import io.dropwizard.jdbi.DBIFactory;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.util.Generics;
import net.sourceforge.argparse4j.inf.Namespace;
import net.sourceforge.argparse4j.inf.Subparser;

/**
 * This commands creates a Demo workspace in the database
 * 
 * @author vnoel
 *
 */
public class AddUserCommand<C extends CockpitConfiguration> extends EnvironmentCommand<C> {

    private static final PasswordEncoder pwEncoder = new BCryptPasswordEncoder();

    private Application<C> app;

    public AddUserCommand(Application<C> app) {
        super(app, "add-user", "Add a user to the database");
        this.app = app;
    }

    @Override
    protected Class<C> getConfigurationClass() {
        // because we subclass the configuration type in the application, the command itself has not enough information
        return Generics.getTypeParameter(app.getClass(), Configuration.class);
    }

    @Override
    public void configure(@Nullable Subparser subparser) {
        super.configure(subparser);
        assert subparser != null;

        subparser.addArgument("-u", "--username").dest("username").required(true);
        subparser.addArgument("-n", "--name").dest("name").required(true);
        subparser.addArgument("-p", "--password").dest("password").required(true);
    }

    @Override
    protected void run(@Nullable Bootstrap<C> bootstrap, @Nullable Namespace namespace, C configuration)
            throws Exception {

        configuration.getDataSourceFactory().asSingleConnectionPool();

        super.run(bootstrap, namespace, configuration);
    }

    @Override
    protected void run(@Nullable Environment environment, @Nullable Namespace namespace, @NonNull C configuration)
            throws Exception {
        assert namespace != null;
        assert environment != null;

        final String username = namespace.getString("username");
        // it is required
        assert username != null;

        String password = namespace.getString("password");
        // required
        assert password != null;

        String name = namespace.getString("name");
        // required
        assert name != null;

        final DBIFactory factory = new DBIFactory();
        final DBI jdbi = factory.build(environment, configuration.getDataSourceFactory(), "cockpit");

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
    }
}
