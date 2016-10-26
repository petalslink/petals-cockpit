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
package org.ow2.petals.cockpit.server;

import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerWrapper;
import org.eclipse.jetty.server.session.SessionHandler;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.ow2.petals.cockpit.server.commands.AddUserCommand;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;
import org.ow2.petals.cockpit.server.resources.UserSession;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource;
import org.ow2.petals.cockpit.server.security.CockpitAuthClient;
import org.ow2.petals.cockpit.server.security.mongo.MongoAllanbankAuthenticator;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableModule;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableWriter;
import org.pac4j.core.config.Config;
import org.pac4j.core.credentials.password.SpringSecurityPasswordEncoder;
import org.pac4j.dropwizard.Pac4jBundle;
import org.pac4j.dropwizard.Pac4jFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.allanbank.mongodb.MongoClient;
import com.allanbank.mongodb.MongoDatabase;
import com.codahale.metrics.health.HealthCheck;
import com.fasterxml.jackson.module.afterburner.AfterburnerModule;

import io.dropwizard.Application;
import io.dropwizard.jetty.BiDiGzipHandler;
import io.dropwizard.lifecycle.ServerLifecycleListener;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

/**
 * Main configuration class for Petals Cockpit Server
 * 
 * @author vnoel
 *
 */
public class CockpitApplication<C extends CockpitConfiguration> extends Application<C> {

    private static final Logger LOG = LoggerFactory.getLogger(CockpitApplication.class);

    private final Pac4jBundle<CockpitConfiguration> pac4j = new Pac4jBundle<CockpitConfiguration>() {
        @Nullable
        @Override
        public Pac4jFactory getPac4jFactory(CockpitConfiguration configuration) {
            return configuration.getPac4jFactory();
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
    public void initialize(@Nullable Bootstrap<C> bootstrap) {
        assert bootstrap != null;

        bootstrap.addBundle(pac4j);
        bootstrap.addCommand(new AddUserCommand());
    }

    @Override
    public void run(CockpitConfiguration configuration, @Nullable Environment environment) throws Exception {
        assert environment != null;

        @SuppressWarnings("resource")
        final MongoClient client = configuration.getDatabaseFactory().buildClient(environment);
        final MongoDatabase db = client.getDatabase(configuration.getDatabaseFactory().getDatabase());
        environment.healthChecks().register("mongo", new MongoHealthCheck(client));

        // use bytecode instrumentation to improve performance of json
        // serialization/deserialization
        environment.getObjectMapper().registerModule(new AfterburnerModule());

        // support DocumentAssignable in object serialized/deserialized by
        // jackson and jersey
        environment.getObjectMapper().registerModule(new DocumentAssignableModule());
        environment.jersey().register(DocumentAssignableWriter.class);

        // activate session management in jetty
        environment.servlets().setSessionHandler(new SessionHandler());

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(configuration).to(CockpitConfiguration.class);
                bind(client).to(MongoClient.class);
                bind(db).to(MongoDatabase.class);
            }
        });

        setupPac4J(configuration, client);

        environment.jersey().register(UserSession.class);
        environment.jersey().register(WorkspacesResource.class);

        // This is needed for SSE to work correctly!
        // See https://github.com/dropwizard/dropwizard/issues/1673
        environment.lifecycle().addServerLifecycleListener(new ServerLifecycleListener() {
            @Override
            public void serverStarted(@Nullable Server server) {
                assert server != null;
                Handler handler = server.getHandler();
                while (handler instanceof HandlerWrapper) {
                    handler = ((HandlerWrapper) handler).getHandler();
                    if (handler instanceof BiDiGzipHandler) {
                        LOG.info("Setting sync flush on gzip compression handler");
                        ((BiDiGzipHandler) handler).setSyncFlush(true);
                    }
                }
            }
        });
    }

    /**
     * public for tests
     */
    private void setupPac4J(CockpitConfiguration configuration, MongoClient client) {

        Config conf = pac4j.getConfig();

        if (conf != null) {
            CockpitAuthClient cac = conf.getClients().findClient(CockpitAuthClient.class);

            // it seems needed for it to be used by the callback filter (because it does not have a
            // client name passed as parameter)
            conf.getClients().setDefaultClient(cac);

            // if it's already set, either we are in a test, or another backend is used
            if (cac.getAuthenticator() == null) {
                // this can't be set from the configuration because we rely on the MongoClient
                // TODO can something be done about that?
                final MongoAllanbankAuthenticator auth = new MongoAllanbankAuthenticator(client);
                auth.setUsersDatabase(configuration.getDatabaseFactory().getDatabase());
                auth.setUsersCollection("users");
                auth.setAttributes("display_name");
                auth.setPasswordEncoder(new SpringSecurityPasswordEncoder(new BCryptPasswordEncoder()));
                cac.setAuthenticator(auth);
            }
        }
    }
}

class MongoHealthCheck extends HealthCheck {

    private final MongoClient client;

    public MongoHealthCheck(MongoClient client) {
        this.client = client;
    }

    @Override
    protected Result check() throws Exception {
        // if this does not fail, it means the connection is working
        client.listDatabaseNames();

        return Result.healthy();
    }
}
