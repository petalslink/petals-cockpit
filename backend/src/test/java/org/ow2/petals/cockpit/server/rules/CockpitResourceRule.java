/**
 * Copyright (C) 2017-2018 Linagora
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
package org.ow2.petals.cockpit.server.rules;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import javax.inject.Singleton;
import javax.ws.rs.client.WebTarget;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.LdapConfigFactory;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.EndpointsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.InterfacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServicesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.mocks.MockArtifactServer;
import org.ow2.petals.cockpit.server.resources.SetupResource;
import org.ow2.petals.cockpit.server.services.ArtifactServer;
import org.ow2.petals.cockpit.server.services.PetalsAdmin;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations;
import org.ow2.petals.cockpit.server.services.WorkspacesService;
import org.ow2.petals.cockpit.server.utils.PetalsAdminExceptionMapper;
import org.pac4j.jax.rs.jersey.features.Pac4JValueFactoryProvider;
import org.zapodot.junit.db.EmbeddedDatabaseRule;
import org.zapodot.junit.db.plugin.LiquibaseInitializer;

import io.dropwizard.testing.junit.ResourceTestRule;

public class CockpitResourceRule implements TestRule {

    public static final String ADMIN_TOKEN = "tokentokentoken";

    @Nullable
    private CockpitProfile currentProfile = null;

    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    public final EmbeddedDatabaseRule db;

    public final MockArtifactServer httpServer = new MockArtifactServer();

    public final ResourceTestRule resource;

    public final CockpitConfiguration cockpitConfig = new CockpitConfiguration();

    private final Map<Object, Long> dbObjectIds = new HashMap<>();

    private final Map<String, String> serviceIds = new HashMap<>();

    private final Map<String, String> endpointsIds = new HashMap<>();

    private final Map<String, String> interfacesIds = new HashMap<>();

    public CockpitResourceRule(Class<?>... resources) {
        this.resource = buildResourceTestRule(resources);

        this.db = EmbeddedDatabaseRule.builder()
                .initializedByPlugin(LiquibaseInitializer.builder().withChangelogResource("migrations.xml").build())
                .build();
    }

    private ResourceTestRule buildResourceTestRule(Class<?>[] resources) {
        ResourceTestRule.Builder builder = ResourceTestRule.builder()
                // in memory does not support SSE and the no-servlet one does not log...
                .setTestContainerFactory(new GrizzlyWebTestContainerFactory()).addProvider(new AbstractBinder() {
                    @Override
                    protected void configure() {
                        bind(DSL.using(db.getConnectionJdbcUrl()).configuration()).to(Configuration.class);
                        bind(WorkspacesService.class).to(WorkspacesService.class).in(Singleton.class);
                        bind(httpServer).to(ArtifactServer.class);
                        bind(PetalsAdmin.class).to(PetalsAdmin.class).in(Singleton.class);
                        bind(ADMIN_TOKEN).to(String.class).named(SetupResource.ADMIN_TOKEN);
                        bind(new TestWorkspaceDbOperations()).to(WorkspaceDbOperations.class);
                        bind(cockpitConfig).to(CockpitConfiguration.class);
                        bind(cockpitConfig.getLDAPConfigFactory()).to(LdapConfigFactory.class);
                    }
                }).setClientConfigurator(cc -> cc.register(MultiPartFeature.class));
        builder.addProvider(new PetalsAdminExceptionMapper(true));
        // we need to use the factory-based constructor to be sure it will always use the current value of profile!
        builder.addProvider(new Pac4JValueFactoryProvider.Binder(p -> () -> currentProfile,
                p -> () -> Optional.ofNullable(currentProfile), null));
        builder.addProvider(MultiPartFeature.class);
        for (Class<?> resource : resources) {
            // we pass the resource as a provider to get injection in constructor
            builder.addProvider(resource);
        }
        return builder.build();
    }

    public long getDbObjectId(Object o) {
        assertThat(o).isNotNull();
        Long id = dbObjectIds.get(o);
        // System.out.println(">" + o + ": " + id);
        assertThat(id).isNotNull();
        assert id != null;
        return id;
    }

    private void setDbObjectId(Object o, long id) {
        // System.out.println("<" + o + ": " + id);
        assertThat(o).isNotNull();
        Long old = dbObjectIds.putIfAbsent(o, id);
        assertThat(old).isNull();
    }

    /**
     * This will change the profile used during the test, it will be reset to <code>null</code> after the test!
     */
    public void setCurrentProfile(@Nullable CockpitProfile currentProfile) {
        this.currentProfile = currentProfile;
    }

    @Override
    public Statement apply(@Nullable Statement base, @Nullable Description description) {
        assert base != null;
        assert description != null;
        return RulesHelper.chain(base, description, resource, httpServer, RulesHelper.dropDbAfter(db), db, petals,
                RulesHelper.jerseyCookies(), RulesHelper.after(() -> currentProfile = null));

    }

    public WebTarget target(String path) {
        return this.resource.target(path);
    }

    public EventInput sse(long workspaceId) {
        return resource.target("/workspaces/" + workspaceId + "/content").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get(EventInput.class);
    }

    public DSLContext db() {
        return DSL.using(db.getConnectionJdbcUrl());
    }

    public String getService(String name) {
        final String id = serviceIds.get(name);
        return id != null ? id : "";
    }

    public String getEndpoint(String name) {
        final String id = endpointsIds.get(name);
        return id != null ? id : "";
    }

    public String getInterface(String name) {
        final String id = interfacesIds.get(name);
        return id != null ? id : "";
    }

    public class TestWorkspaceDbOperations extends WorkspaceDbOperations {
        @Override
        public void busAdded(Domain bus, BusesRecord bDb) {
            setDbObjectId(bus, bDb.getId());
        }

        @Override
        public void containerAdded(Container container, ContainersRecord cDb) {
            setDbObjectId(container, cDb.getId());
        }

        @Override
        public void componentAdded(Component component, ComponentsRecord compDb) {
            setDbObjectId(component, compDb.getId());
        }

        @Override
        public void sharedLibraryAdded(SharedLibrary sl, SharedlibrariesRecord slDb) {
            setDbObjectId(sl, slDb.getId());
        }

        @Override
        public void serviceAssemblyAdded(ServiceAssembly sa, ServiceassembliesRecord saDb) {
            setDbObjectId(sa, saDb.getId());
        }

        @Override
        public void serviceUnitAdded(ServiceUnit su, ServiceunitsRecord suDb) {
            setDbObjectId(su, suDb.getId());
        }

        @SuppressWarnings("null")
        @Override
        public void serviceAdded(ServicesRecord service) {
            // A same service can have multiple interfaces/endpoints, thus a same service insertion request
            // can be received multiple time without raising an error
            if (!dbObjectIds.containsKey(service)) {
                setDbObjectId(service, service.getId());
                serviceIds.put(service.getName(), service.getId().toString());
            }
        }

        @SuppressWarnings("null")
        @Override
        public void endpointAdded(EndpointsRecord endpoint) {
            // A same endpoint can have multiple interfaces, thus a same endpoint insertion request
            // can be received multiple time without raising an error
            if (!dbObjectIds.containsKey(endpoint)) {
                setDbObjectId(endpoint, endpoint.getId());
                endpointsIds.put(endpoint.getName(), endpoint.getId().toString());
            }
        }

        @SuppressWarnings("null")
        @Override
        public void interfaceAdded(InterfacesRecord interface_) {
            // A same interface can have multiple service/endpoints, thus a same interface insertion request
            // can be received multiple time without raising an error
            if (!dbObjectIds.containsKey(interface_)) {
                setDbObjectId(interface_, interface_.getId());
                interfacesIds.put(interface_.getName(), interface_.getId().toString());
            }
        }
    }
}
