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
import org.ow2.petals.cockpit.server.utils.DocumentAssignableModule;
import org.ow2.petals.cockpit.server.utils.DocumentAssignableWriter;

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

        final MongoClient client = configuration.getDatabaseFactory().buildClient(environment);
        final MongoDatabase db = client.getDatabase(configuration.getDatabaseFactory().getDatabase());

        // use bytecode instrumentation to improve performance of json serialization/deserialization
        environment.getObjectMapper().registerModule(new AfterburnerModule());
        // support DocumentAssignable in object serialized/deserialized by jackson
        environment.getObjectMapper().registerModule(new DocumentAssignableModule());

        environment.healthChecks().register("mongo", new MongoHealthCheck(client));

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

        environment.jersey().register(DocumentAssignableWriter.class);
    }
}

class MongoHealthCheck extends HealthCheck {

    private final MongoClient client;

    public MongoHealthCheck(MongoClient client) {
        this.client = client;
    }

    @Override
    protected Result check() throws Exception {
        client.listDatabaseNames();

        return Result.healthy();
    }
}
