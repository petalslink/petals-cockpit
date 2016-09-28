/**
 * Copyright (c) 2016 Linagora
 * 
 * This program/library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 2.1 of the License, or (at your
 * option) any later version.
 * 
 * This program/library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program/library; If not, see http://www.gnu.org/licenses/
 * for the GNU Lesser General Public License version 2.1.
 */
package org.ow2.petals.cockpit.server;

import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.server.session.SessionHandler;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;
import org.ow2.petals.cockpit.server.resources.UserSession;
import org.ow2.petals.cockpit.server.security.CockpitAuthClient;
import org.ow2.petals.cockpit.server.security.mongo.MongoAllanbankAuthenticator;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableModule;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableWriter;
import org.pac4j.core.client.Clients;
import org.pac4j.core.config.Config;
import org.pac4j.core.credentials.password.JBCryptPasswordEncoder;
import org.pac4j.jax.rs.features.Pac4JSecurityFeature;
import org.pac4j.jax.rs.features.jersey.Pac4JValueFactoryProvider;

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
public class CockpitApplication extends Application<CockpitConfiguration> {

    public static void main(String[] args) throws Exception {
        new CockpitApplication().run(args);
    }

    @Override
    public String getName() {
        return "Petals Cockpit";
    }

    @Override
    public void initialize(@Nullable Bootstrap<CockpitConfiguration> bootstrap) {
        assert bootstrap != null;
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

        final Config pac4jConfig = new Pac4jConfig(client, configuration);

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(configuration).to(CockpitConfiguration.class);
                bind(client).to(MongoClient.class);
                bind(db).to(MongoDatabase.class);
                bind(pac4jConfig).to(Config.class);
            }
        });

        environment.jersey().register(new Pac4JSecurityFeature(pac4jConfig));
        environment.jersey().register(new Pac4JValueFactoryProvider.Binder(pac4jConfig));

        environment.jersey().register(UserSession.class);
    }
}

class Pac4jConfig extends Config {

    public Pac4jConfig(MongoClient client, CockpitConfiguration configuration) {

        final MongoAllanbankAuthenticator auth = new MongoAllanbankAuthenticator(client);
        auth.setUsersDatabase(configuration.getDatabaseFactory().getDatabase());
        auth.setUsersCollection("users");
        auth.setAttributes("display_name");
        auth.setPasswordEncoder(new JBCryptPasswordEncoder());

        final CockpitAuthClient cac = new CockpitAuthClient();
        cac.setAuthenticator(auth);

        final Clients clients = new Clients(cac);
        // it seems needed for it to be used by the callback filter (because it does not have a
        // client name passed as parameter)
        clients.setDefaultClient(cac);
        // this will be used by SSO-type authenticators (appended with client name as parameter),
        // but for now we must give a value for pac4j to be happy
        clients.setCallbackUrl("/user/session");

        setClients(clients);
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
