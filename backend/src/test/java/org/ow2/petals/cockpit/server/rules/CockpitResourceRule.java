/**
 * Copyright (C) 2017 Linagora
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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

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
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.mocks.MockArtifactServer;
import org.ow2.petals.cockpit.server.resources.SetupResource;
import org.ow2.petals.cockpit.server.services.ArtifactServer;
import org.ow2.petals.cockpit.server.services.PetalsAdmin;
import org.ow2.petals.cockpit.server.services.PetalsDb;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations;
import org.ow2.petals.cockpit.server.utils.PetalsAdminExceptionMapper;
import org.ow2.petals.jmx.api.mock.junit.PetalsJmxApiJunitRule;
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

    public final PetalsJmxApiJunitRule jmx = new PetalsJmxApiJunitRule("localhost", 7700, "user", "pass");

    public final ResourceTestRule resource;

    private final Map<Object, Long> workspaceIds = new HashMap<>();

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
                        bind(Executors.newFixedThreadPool(4)).named(CockpitApplication.BLOCKING_TASK_ES)
                                .to(ExecutorService.class);
                        bind(CockpitActors.class).to(CockpitActors.class).in(Singleton.class);
                        bind(httpServer).to(ArtifactServer.class);
                        bind(PetalsAdmin.class).to(PetalsAdmin.class).in(Singleton.class);
                        bind(PetalsDb.class).to(PetalsDb.class).in(Singleton.class);
                        bind(ADMIN_TOKEN).to(String.class).named(SetupResource.ADMIN_TOKEN);
                        bind(new TestWorkspaceDbOperations()).to(WorkspaceDbOperations.class);
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

    public long getWorkspaceId(Object o) {
        assertThat(o).isNotNull();
        Long id = workspaceIds.get(o);
        // System.out.println(">" + o + ": " + id);
        assertThat(id).isNotNull();
        assert id != null;
        return id;
    }

    private void setWorkspaceId(Object o, long id) {
        // System.out.println("<" + o + ": " + id);
        assertThat(o).isNotNull();
        Long old = workspaceIds.putIfAbsent(o, id);
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
        return RulesHelper.chain(base, description, resource, httpServer, RulesHelper.dropDbAfter(db), db, petals, jmx,
                RulesHelper.jerseyCookies(), RulesHelper.quasar(), RulesHelper.after(() -> currentProfile = null));

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

    public class TestWorkspaceDbOperations extends WorkspaceDbOperations {
        @Override
        public void busAdded(Domain bus, BusesRecord bDb) {
            setWorkspaceId(bus, bDb.getId());
        }

        @Override
        public void containerAdded(Container container, ContainersRecord cDb) {
            setWorkspaceId(container, cDb.getId());
        }

        @Override
        public void componentAdded(Component component, ComponentsRecord compDb) {
            setWorkspaceId(component, compDb.getId());
        }

        @Override
        public void sharedLibraryAdded(SharedLibrary sl, SharedlibrariesRecord slDb) {
            setWorkspaceId(sl, slDb.getId());
        }

        @Override
        public void serviceAssemblyAdded(ServiceAssembly sa, ServiceassembliesRecord saDb) {
            setWorkspaceId(sa, saDb.getId());
        }

        @Override
        public void serviceUnitAdded(ServiceUnit su, ServiceunitsRecord suDb) {
            setWorkspaceId(su, suDb.getId());
        }
    }
}
