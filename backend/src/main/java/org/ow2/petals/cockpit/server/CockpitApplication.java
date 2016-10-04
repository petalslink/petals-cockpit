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
import org.eclipse.jetty.server.session.SessionHandler;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.ow2.petals.cockpit.server.commands.AddUserCommand;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;
import org.ow2.petals.cockpit.server.resources.UserSession;
import org.ow2.petals.cockpit.server.security.CockpitAuthClient;
import org.ow2.petals.cockpit.server.security.mongo.MongoAllanbankAuthenticator;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableModule;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableWriter;
import org.pac4j.core.client.Clients;
import org.pac4j.core.config.Config;
import org.pac4j.core.config.ConfigSingleton;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.credentials.authenticator.Authenticator;
import org.pac4j.core.credentials.password.JBCryptPasswordEncoder;
import org.pac4j.core.matching.ExcludedPathMatcher;
import org.pac4j.dropwizard.Pac4jBundle;
import org.pac4j.dropwizard.Pac4jFactory;
import org.pac4j.jax.rs.features.Pac4JSecurityFilterFeature;

import com.allanbank.mongodb.MongoClient;
import com.allanbank.mongodb.MongoDatabase;
import com.codahale.metrics.health.HealthCheck;
import com.fasterxml.jackson.module.afterburner.AfterburnerModule;

import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

/**
 * Main configuration class for Petals Cockpit Server
 * 
 * @author vnoel
 *
 */
public class CockpitApplication<C extends CockpitConfiguration> extends Application<C> {

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

        bootstrap.addBundle(new Pac4jBundle<CockpitConfiguration>() {
            @Override
            public Pac4jFactory getPac4jFactory(CockpitConfiguration configuration) {
                return configuration.getPac4jFactory();
            }
        });
        bootstrap.addCommand(new AddUserCommand());
    }

    @Override
    public void run(CockpitConfiguration configuration, @Nullable Environment environment) throws Exception {
        assert environment != null;

        @SuppressWarnings("resource")
        final MongoClient client = configuration.getDatabaseFactory().buildClient(environment);
        final MongoDatabase db = client.getDatabase(configuration.getDatabaseFactory().getDatabase());
        environment.healthChecks().register("mongo", new MongoHealthCheck(client));

        // use bytecode instrumentation to improve performance of json serialization/deserialization
        environment.getObjectMapper().registerModule(new AfterburnerModule());

        // support DocumentAssignable in object serialized/deserialized by jackson and jersey
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

        setupPac4J(ConfigSingleton.getConfig(), client, configuration);

        // let's enforce the filter programmatically instead of by config
        // by default everything is protected, except user session that handles things by itself
        final Pac4JSecurityFilterFeature globalFilter = new Pac4JSecurityFilterFeature(ConfigSingleton.getConfig(),
                null, "isAuthenticated", null, "excludeUserSession", null);

        environment.jersey().register(globalFilter);

        environment.jersey().register(UserSession.class);
    }

    /**
     * public for tests
     */
    private static void setupPac4J(Config config, MongoClient client, CockpitConfiguration configuration) {
        final MongoAllanbankAuthenticator auth = new MongoAllanbankAuthenticator(client);
        auth.setUsersDatabase(configuration.getDatabaseFactory().getDatabase());
        auth.setUsersCollection("users");
        auth.setAttributes("display_name");
        auth.setPasswordEncoder(new JBCryptPasswordEncoder());

        setupPac4J(config, auth);
    }

    public static void setupPac4J(Config config, final Authenticator<@Nullable UsernamePasswordCredentials> auth) {
        final CockpitAuthClient cac = new CockpitAuthClient();
        cac.setAuthenticator(auth);

        // Ignores /user/session URLs (defined in UserSession)
        config.addMatcher("excludeUserSession", new ExcludedPathMatcher("^/user/session$"));

        final Clients clients = new Clients(cac);
        // it seems needed for it to be used by the callback filter (because it does not have a
        // client name passed as parameter)
        clients.setDefaultClient(cac);
        // this will be used by SSO-type authenticators (appended with client name as parameter),
        // but for now we must give a value for pac4j to be happy
        clients.setCallbackUrl("/user/session");

        config.setClients(clients);
    }
}

class MongoHealthCheck extends HealthCheck {

    private final MongoClient client;

    public MongoHealthCheck(MongoClient client) {
        this.client = client;
    }

    @Override
    protected Result check() throws Exception {
        // if this does not fail, it's ok
        client.listDatabaseNames();

        return Result.healthy();
    }
}
