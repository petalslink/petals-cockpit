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
package org.ow2.petals.cockpit.server;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.stream.Collectors;

import javax.inject.Singleton;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.handler.HandlerWrapper;
import org.eclipse.jetty.server.session.SessionHandler;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.commands.AddUserCommand;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.resources.BusesResource;
import org.ow2.petals.cockpit.server.resources.ComponentsResource;
import org.ow2.petals.cockpit.server.resources.ContainersResource;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource;
import org.ow2.petals.cockpit.server.resources.UserSession;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource;
import org.ow2.petals.cockpit.server.security.CockpitAuthClient;
import org.ow2.petals.cockpit.server.security.CockpitAuthenticator;
import org.pac4j.core.client.Client;
import org.pac4j.core.config.Config;
import org.pac4j.core.matching.ExcludedPathMatcher;
import org.pac4j.dropwizard.Pac4jBundle;
import org.pac4j.dropwizard.Pac4jFactory;
import org.pac4j.dropwizard.Pac4jFactory.FilterConfiguration;
import org.skife.jdbi.v2.DBI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.module.afterburner.AfterburnerModule;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import io.dropwizard.Application;
import io.dropwizard.db.PooledDataSourceFactory;
import io.dropwizard.jdbi.DBIFactory;
import io.dropwizard.jdbi.bundles.DBIExceptionsBundle;
import io.dropwizard.jetty.BiDiGzipHandler;
import io.dropwizard.lifecycle.Managed;
import io.dropwizard.migrations.MigrationsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

/**
 * Main configuration class for Petals Cockpit Server
 * 
 * @author vnoel
 *
 */
public class CockpitApplication<C extends CockpitConfiguration> extends Application<C> {

    public static final String PETALS_ADMIN_ES = "petals-admin-exec-service";

    public static final String JDBC_ES = "jdbc-exec-service";

    private static final Logger LOG = LoggerFactory.getLogger(CockpitApplication.class);

    public final Pac4jBundle<C> pac4j = new Pac4jBundle<C>() {
        @Override
        public Pac4jFactory getPac4jFactory(C configuration) {
            List<Client> clients = configuration.getSecurity().getPac4jClients();

            // TODO would it make sense to do injection on the clients? e.g. for UsersDAO
            List<String> clientsNames = clients.stream().map(Client::getName).collect(Collectors.toList());

            String defaultClients = String.join(",", clientsNames);

            Pac4jFactory pac4jConf = new Pac4jFactory();

            // this let the /user/session url be handled by the callbacks, logout, etc filters
            pac4jConf.setMatchers(ImmutableMap.of("excludeUserSession", new ExcludedPathMatcher("^/user/session$")));

            // this protects the whole application with all the declared clients
            FilterConfiguration f = new FilterConfiguration();
            f.setMatchers("excludeUserSession");
            f.setAuthorizers("isAuthenticated");
            f.setClients(defaultClients);
            pac4jConf.setGlobalFilters(ImmutableList.of(f));

            // this will be used by SSO-type authenticators (appended with client name as parameter)
            // for now, we still need to give a value in order for pac4j to be happy
            pac4jConf.setCallbackUrl("/user/session");
            pac4jConf.setClients(clients);

            // this ensure Pac4JSecurity annotations use all the clients
            // (for example on /user)
            pac4jConf.setDefaultClients(defaultClients);

            // if the local db client is enabled, use it by default for callbacks
            // because the frontend does not pass a client name as a parameter by default
            String defaultClient = CockpitAuthClient.class.getSimpleName();
            if (clientsNames.contains(defaultClient)) {
                pac4jConf.setDefaultClient(defaultClient);
            }

            return pac4jConf;
        }
    };

    public final MigrationsBundle<C> migrations = new MigrationsBundle<C>() {

        @Override
        public PooledDataSourceFactory getDataSourceFactory(C configuration) {
            return configuration.getDataSourceFactory();
        }

    };

    public static void main(String[] args) throws Exception {
        new CockpitApplication<>().run(args);
    }

    @Override
    public String getName() {
        return "Petals Cockpit";
    }

    @Override
    public void initialize(Bootstrap<C> bootstrap) {
        bootstrap.addBundle(migrations);
        bootstrap.addBundle(pac4j);
        // ease debugging of exceptions thrown by JDBI!
        bootstrap.addBundle(new DBIExceptionsBundle());
        bootstrap.addCommand(new AddUserCommand<>());
    }

    @Override
    public void run(C configuration, Environment environment) throws Exception {
        final DBIFactory factory = new DBIFactory();
        final DBI jdbi = factory.build(environment, configuration.getDataSourceFactory(), "cockpit");
        final UsersDAO users = jdbi.onDemand(UsersDAO.class);
        final WorkspacesDAO workspaces = jdbi.onDemand(WorkspacesDAO.class);
        final BusesDAO buses = jdbi.onDemand(BusesDAO.class);

        // use bytecode instrumentation to improve performance of json
        // serialization/deserialization
        environment.getObjectMapper().registerModule(new AfterburnerModule());

        // activate session management in jetty
        environment.servlets().setSessionHandler(new SessionHandler());

        // TODO add these ExecutorService to the metrics
        // TODO choose adequate parameters?

        // This is needed for executing petals admins requests from within a fiber (actors)
        ExecutorService petalsAdminES = environment.lifecycle().executorService("petals-admin-worker-%d").minThreads(1)
                .maxThreads(2).build();
        // This is needed for executing database requests from within a fiber (actors)
        ExecutorService jdbcExec = environment.lifecycle().executorService("jdbc-worker-%d").minThreads(2)
                .maxThreads(Runtime.getRuntime().availableProcessors()).build();

        final PetalsAdministrationFactory adminFactory = PetalsAdministrationFactory.getInstance();

        environment.lifecycle().manage(new Managed() {
            @Override
            public void start() throws Exception {
                // the factory is already created at that point
            }

            @Override
            public void stop() throws Exception {
                // this ensure things are properly freed if needed
                PetalsAdministrationFactory.close();
            }
        });

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(configuration).to(CockpitConfiguration.class);
                bind(petalsAdminES).named(PETALS_ADMIN_ES).to(ExecutorService.class);
                bind(jdbcExec).named(JDBC_ES).to(ExecutorService.class);
                bind(users).to(UsersDAO.class);
                bind(workspaces).to(WorkspacesDAO.class);
                bind(buses).to(BusesDAO.class);
                bind(jdbi).to(DBI.class);
                bind(CockpitActors.class).to(CockpitActors.class).in(Singleton.class);
                bind(adminFactory).to(PetalsAdministrationFactory.class);
            }
        });

        setupPac4J(users);

        environment.jersey().register(UserSession.class);
        environment.jersey().register(WorkspacesResource.class);
        environment.jersey().register(WorkspaceResource.class);
        environment.jersey().register(BusesResource.class);
        environment.jersey().register(ContainersResource.class);
        environment.jersey().register(ComponentsResource.class);
        environment.jersey().register(ServiceUnitsResource.class);

        // This is needed for SSE to work correctly!
        // See https://github.com/dropwizard/dropwizard/issues/1673
        environment.lifecycle().addServerLifecycleListener(server -> {
            Handler handler = server.getHandler();
            while (handler instanceof HandlerWrapper) {
                handler = ((HandlerWrapper) handler).getHandler();
                if (handler instanceof BiDiGzipHandler) {
                    LOG.info("Setting sync flush on gzip compression handler");
                    ((BiDiGzipHandler) handler).setSyncFlush(true);
                }
            }
        });
    }

    private void setupPac4J(UsersDAO users) {

        Config conf = pac4j.getConfig();

        if (conf != null) {
            CockpitAuthClient cac = conf.getClients().findClient(CockpitAuthClient.class);

            // if it's already set, either we are in a test, or another backend is used
            if (cac.getAuthenticator() == null) {
                // this can't be set from the configuration because we rely on the UserDAO
                // TODO can something be done about that? for example with injection...
                final CockpitAuthenticator auth = new CockpitAuthenticator(users);
                cac.setAuthenticator(auth);
            }
        }
    }
}
