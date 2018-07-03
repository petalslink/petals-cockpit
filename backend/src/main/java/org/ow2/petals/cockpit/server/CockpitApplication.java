/**
 * Copyright (C) 2016-2018 Linagora
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

import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import javax.inject.Singleton;
import javax.ws.rs.ext.ContextResolver;

import org.apache.commons.lang3.RandomStringUtils;
import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.server.Server;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.bundles.artifactserver.HttpArtifactServerBundle;
import org.ow2.petals.cockpit.server.bundles.security.CockpitAuthClient;
import org.ow2.petals.cockpit.server.bundles.security.CockpitSecurityBundle;
import org.ow2.petals.cockpit.server.commands.AddUserCommand;
import org.ow2.petals.cockpit.server.resources.BusesResource;
import org.ow2.petals.cockpit.server.resources.ComponentsResource;
import org.ow2.petals.cockpit.server.resources.ContainersResource;
import org.ow2.petals.cockpit.server.resources.EndpointsResource;
import org.ow2.petals.cockpit.server.resources.InterfacesResource;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource;
import org.ow2.petals.cockpit.server.resources.ServicesResource;
import org.ow2.petals.cockpit.server.resources.SetupResource;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource;
import org.ow2.petals.cockpit.server.resources.UserSession;
import org.ow2.petals.cockpit.server.resources.UsersResource;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource;
import org.ow2.petals.cockpit.server.services.PetalsAdmin;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations;
import org.ow2.petals.cockpit.server.services.WorkspacesService;
import org.ow2.petals.cockpit.server.utils.PetalsAdminExceptionMapper;
import org.pac4j.dropwizard.Pac4jBundle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bendb.dropwizard.jooq.JooqBundle;
import com.bendb.dropwizard.jooq.JooqFactory;
import com.fasterxml.jackson.module.afterburner.AfterburnerModule;

import io.dropwizard.Application;
import io.dropwizard.db.PooledDataSourceFactory;
import io.dropwizard.forms.MultiPartBundle;
import io.dropwizard.lifecycle.ServerLifecycleListener;
import io.dropwizard.migrations.MigrationsBundle;
import io.dropwizard.server.AbstractServerFactory;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

/**
 * Main configuration class for Petals Cockpit Server
 * 
 * @author vnoel
 *
 */
public class CockpitApplication<C extends CockpitConfiguration> extends Application<C> {

    // this logger is meant to be shown in the console at the INFO level
    protected static final Logger LOG = LoggerFactory.getLogger(CockpitApplication.class);

    public final Pac4jBundle<C> pac4j = new CockpitSecurityBundle<C>() {
        @Override
        protected CockpitSecurityConfiguration getConfiguration(C configuration) {
            return configuration.getSecurity();
        }
    };

    public final MigrationsBundle<C> migrations = new MigrationsBundle<C>() {
        @Override
        public PooledDataSourceFactory getDataSourceFactory(C configuration) {
            return configuration.getDataSourceFactory();
        }
    };

    public final JooqBundle<C> jooq = new JooqBundle<C>() {
        @Override
        public PooledDataSourceFactory getDataSourceFactory(C configuration) {
            return configuration.getDataSourceFactory();
        }

        @Override
        public JooqFactory getJooqFactory(C configuration) {
            return configuration.getJooqFactory();
        }
    };

    public final HttpArtifactServerBundle<C> artifactsServer = new HttpArtifactServerBundle<C>() {
        @Override
        protected HttpArtifactServerConfiguration getConfiguration(C configuration) {
            return configuration.getArtifactServer();
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
        bootstrap.addBundle(new MultiPartBundle());
        bootstrap.addBundle(migrations);
        bootstrap.addBundle(jooq);
        bootstrap.addBundle(pac4j);
        bootstrap.addCommand(new AddUserCommand<>());
        bootstrap.addBundle(artifactsServer);
    }

    @Override
    public void run(C configuration, Environment environment) throws Exception {

        // use bytecode instrumentation to improve performance of json
        // serialization/deserialization
        environment.getObjectMapper().registerModule(new AfterburnerModule());

        Configuration jooqConf = jooq.getConfiguration();
        assert jooqConf != null;

        String adminConsoleToken = RandomStringUtils.randomAlphanumeric(20);

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(configuration).to(CockpitConfiguration.class);
                bind(environment).to(Environment.class);
                bind(WorkspacesService.class).to(WorkspacesService.class).in(Singleton.class);
                bind(jooqConf).to(Configuration.class);
                bind(PetalsAdmin.class).to(PetalsAdmin.class).in(Singleton.class);
                bind(adminConsoleToken).to(String.class).named(SetupResource.ADMIN_TOKEN);
                bind(WorkspaceDbOperations.class).to(WorkspaceDbOperations.class).in(Singleton.class);
            }
        });

        // used by CockpitAuthenticator
        environment.jersey().register(new ContextResolver<Configuration>() {
            @Override
            public Configuration getContext(@Nullable Class<?> type) {
                return jooqConf;
            }
        });

        // Check if LDAP config is set
        final LdapConfigFactory ldapc = configuration.getLDAPConfigFactory();
        if (ldapc.isConfigurationValid()) {
            LOG.info("Valid LDAP configuration found.");
            LOG.debug(
                    "\nurl = {},\nusersDn = {},\nusernameAttribute = {},\nnameAttribute = {},\npasswordAttribute = {}",
                    ldapc.getUrl(), ldapc.getUsersDn(),
                    ldapc.getUsernameAttribute(), ldapc.getNameAttribute(), ldapc.getPasswordAttribute());
            CockpitAuthClient.setLdapConfiguration(ldapc);
        } else {
            LOG.info("No valid LDAP configuration found.");
        }

        environment.jersey().register(new PetalsAdminExceptionMapper(configuration.isShowPetalsAdminStacktraces()));

        environment.jersey().register(UserSession.class);
        environment.jersey().register(WorkspacesResource.class);
        environment.jersey().register(WorkspaceResource.class);
        environment.jersey().register(BusesResource.class);
        environment.jersey().register(ContainersResource.class);
        environment.jersey().register(ComponentsResource.class);
        environment.jersey().register(ServiceAssembliesResource.class);
        environment.jersey().register(ServiceUnitsResource.class);
        environment.jersey().register(SharedLibrariesResource.class);
        environment.jersey().register(ServicesResource.class);
        environment.jersey().register(EndpointsResource.class);
        environment.jersey().register(InterfacesResource.class);
        environment.jersey().register(SetupResource.class);
        environment.jersey().register(UsersResource.class);

        if (!DSL.using(jooqConf).fetchExists(USERS, USERS.ADMIN.eq(true))) {
            environment.lifecycle().addServerLifecycleListener(new ServerLifecycleListener() {
                @Override
                public void serverStarted(@Nullable Server server) {
                    assert server != null;
                    LOG.warn("No users are present in the database: setup your installation via {}setup?token={}",
                            server.getURI(), adminConsoleToken);
                }
            });
        }

        // This is needed for SSE to work correctly!
        // See https://github.com/dropwizard/dropwizard/issues/1673
        ((AbstractServerFactory) configuration.getServerFactory()).getGzipFilterFactory().setSyncFlush(true);
    }
}
