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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.BiConsumer;

import javax.inject.Singleton;

import org.assertj.core.api.SoftAssertions;
import org.assertj.db.api.RequestRowAssert;
import org.assertj.db.type.Request;
import org.assertj.db.type.Table;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.InboundEvent;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.jooq.Configuration;
import org.jooq.conf.ParamType;
import org.jooq.impl.DSL;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.rules.TestRule;
import org.mockito.Mockito;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.mocks.MockArtifactServer;
import org.ow2.petals.cockpit.server.mocks.MockProfileParamValueFactoryProvider;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.services.ArtifactServer;
import org.zapodot.junit.db.EmbeddedDatabaseRule;
import org.zapodot.junit.db.plugin.LiquibaseInitializer;

import ch.qos.logback.classic.Level;
import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.common.test.TestUtil;
import co.paralleluniverse.common.util.Debug;
import io.dropwizard.logging.BootstrapLogging;
import io.dropwizard.testing.junit.ResourceTestRule;
import io.dropwizard.testing.junit.ResourceTestRule.Builder;
import javaslang.Tuple2;
import javaslang.Tuple3;
import javaslang.Tuple4;

/**
 * Note: to override one of the already implemented method in {@link #workspaces} or {@link #buses}, it is needed to use
 * {@link Mockito#doReturn(Object)} and not {@link Mockito#when(Object)}!!
 * 
 * Note: because the backend is implemented using actors, it can happen that some of those are initialised late or even
 * after the test is finished and thus exceptions are printed in the console. TODO It's ok, but it would be better not
 * to have that, see https://groups.google.com/d/msg/quasar-pulsar-user/LLhGRQDiykY/F8apfp8JCQAJ
 *
 * @author vnoel
 *
 */
public class AbstractCockpitResourceTest {

    static {
        BootstrapLogging.bootstrap(Level.INFO);
    }

    public static final String ADMIN = "admin";

    @Rule
    public final TestRule watchman = TestUtil.WATCHMAN;

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    @Rule
    public final EmbeddedDatabaseRule dbRule = EmbeddedDatabaseRule.builder()
            .initializedByPlugin(LiquibaseInitializer.builder().withChangelogResource("migrations.xml").build())
            .build();

    @Rule
    public MockArtifactServer httpServer = new MockArtifactServer();

    protected ResourceTestRule buildResourceTest(Class<?>... resources) {
        Builder builder = ResourceTestRule.builder()
                // in memory does not support SSE and the no-servlet one does not log...
                .setTestContainerFactory(new GrizzlyWebTestContainerFactory()).addProvider(new AbstractBinder() {
                    @Override
                    protected void configure() {
                        bind(DSL.using(dbRule.getConnectionJdbcUrl()).configuration()).to(Configuration.class);
                        bind(Executors.newSingleThreadExecutor()).named(CockpitApplication.BLOCKING_TASK_ES)
                                .to(ExecutorService.class);
                        bind(CockpitActors.class).to(CockpitActors.class).in(Singleton.class);
                        bind(PetalsAdministrationFactory.getInstance()).to(PetalsAdministrationFactory.class);
                        bind(httpServer).to(ArtifactServer.class);
                    }
                }).setClientConfigurator(cc -> cc.register(MultiPartFeature.class));
        // needed for @Pac4JProfile injection to work
        builder.addProvider(new MockProfileParamValueFactoryProvider.Binder(ADMIN));
        builder.addProvider(MultiPartFeature.class);
        for (Class<?> resource : resources) {
            // we pass the resource as a provider to get injection in constructor
            builder.addProvider(resource);
        }
        return builder.build();
    }

    @BeforeClass
    public static void setUpQuasar() {
        // ensure this doesn't get called in a non-unit test thread and return false later when clearing the registry!
        assertThat(Debug.isUnitTest()).isTrue();
    }

    @After
    public void tearDownQuasar() {
        ActorRegistry.clear();
    }

    @Before
    public void setUpDb() {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord(ADMIN, "...", "Administrator", null));
    }

    @After
    public void tearDownDb() {
        DSL.using(dbRule.getConnectionJdbcUrl()).execute("DROP ALL OBJECTS");
    }

    protected Table table(org.jooq.Table<?> table) {
        return new Table(dbRule.getDataSource(), table.getName());
    }

    protected RequestRowAssert assertThatDbSU(long id) {
        return assertThat(requestSU(id)).hasNumberOfRows(1).row();
    }

    protected RequestRowAssert assertThatDbComp(long id) {
        return assertThat(requestComp(id)).hasNumberOfRows(1).row();
    }

    protected void assertNoDbSU(long id) {
        assertThat(requestSU(id)).hasNumberOfRows(0);
    }

    protected void assertNoDbComp(long id) {
        assertThat(requestComp(id)).hasNumberOfRows(0);
    }

    protected Request requestSU(long id) {
        return new Request(dbRule.getDataSource(), DSL.using(dbRule.getConnectionJdbcUrl())
                .selectFrom(SERVICEUNITS).where(SERVICEUNITS.ID.eq(id)).getSQL(ParamType.INLINED));
    }

    protected Request requestComp(long id) {
        return new Request(dbRule.getDataSource(), DSL.using(dbRule.getConnectionJdbcUrl()).selectFrom(COMPONENTS)
                .where(COMPONENTS.ID.eq(id)).getSQL(ParamType.INLINED));
    }

    /**
     * TODO generate id automatically? but then we need some kind of way to query this data after that!
     */
    protected void setupWorkspace(long wsId, String wsName,
            List<Tuple4<Long, Domain, String, List<Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>>>>> data,
            String... users) {

        List<BusesRecord> bs = new ArrayList<>();
        List<ContainersRecord> cs = new ArrayList<>();
        List<ComponentsRecord> comps = new ArrayList<>();
        List<ServiceunitsRecord> sus = new ArrayList<>();

        for (Tuple4<Long, Domain, String, List<Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>>>> bus : data) {
            long bId = bus._1;
            String passphrase = bus._3;
            List<Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>>> containers = bus._4;
            Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>> entry = containers
                    .iterator().next();

            bs.add(new BusesRecord(bId, wsId, true, entry._2.getHost(), getPort(entry._2), entry._2.getJmxUsername(),
                    entry._2.getJmxPassword(), passphrase, null, bus._2.getName()));

            for (Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>> c : containers) {

                long cId = c._1;
                c._2.addProperty("petals.topology.passphrase", passphrase);

                // TODO handle also artifacts
                cs.add(new ContainersRecord(cId, bId, c._2.getContainerName(), c._2.getHost(), getPort(c._2),
                        c._2.getJmxUsername(), c._2.getJmxPassword()));

                for (Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>> comp : c._3) {

                    long compId = comp._1;

                    comps.add(new ComponentsRecord(compId, cId, comp._2.getName(),
                            ComponentMin.State.from(comp._2.getState()).name(),
                            ComponentMin.Type.from(comp._2.getComponentType()).name()));

                    for (Tuple2<Long, ServiceAssembly> su : comp._3) {
                        long suId = su._1;
                        List<ServiceUnit> sasus = su._2.getServiceUnits();
                        assert sasus.size() == 1;
                        ServiceUnit sasu = sasus.get(0);
                        assert sasu != null;

                        sus.add(new ServiceunitsRecord(suId, compId, sasu.getName(),
                                ServiceUnitMin.State.from(su._2.getState()).name(), su._2.getName()));
                    }
                }
            }
        }

        DSL.using(dbRule.getConnectionJdbcUrl()).transaction(conf -> {
            DSL.using(conf).executeInsert(new WorkspacesRecord(wsId, wsName));
            DSL.using(conf).batchInsert(bs).execute();
            DSL.using(conf).batchInsert(cs).execute();
            DSL.using(conf).batchInsert(comps).execute();
            DSL.using(conf).batchInsert(sus).execute();
            for (String user : users) {
                DSL.using(conf).executeInsert(new UsersWorkspacesRecord(wsId, user));
            }
        });
    }

    protected static int getPort(Container container) {
        Integer port = container.getPorts().get(PortType.JMX);
        assert port != null;
        return port;
    }

    protected static void assertEquivalent(ContainersRecord record, Container container) {
        assertThat(record.getIp()).isEqualTo(container.getHost());
        assertThat(record.getPort()).isEqualTo(getPort(container));
        assertThat(record.getUsername()).isEqualTo(container.getJmxUsername());
        assertThat(record.getPassword()).isEqualTo(container.getJmxPassword());
        assertThat(record.getName()).isEqualTo(container.getContainerName());
    }

    protected static void assertEquivalent(ComponentsRecord record, Component component) {
        assertThat(record.getName()).isEqualTo(component.getName());
        assertThat(record.getState()).isEqualTo(ComponentMin.State.from(component.getState()).name());
        assertThat(record.getType()).isEqualTo(ComponentMin.Type.from(component.getComponentType()).name());
    }

    protected static void assertEquivalent(ServiceunitsRecord record, ServiceAssembly sa) {
        assertThat(sa.getServiceUnits()).hasSize(1);
        ServiceUnit su = sa.getServiceUnits().iterator().next();
        assertThat(record.getName()).isEqualTo(su.getName());
        assertThat(record.getState()).isEqualTo(ServiceUnitMin.State.from(sa.getState()).name());
        assertThat(record.getSaName()).isEqualTo(sa.getName());
    }

    protected static void expectEvent(EventInput eventInput, BiConsumer<InboundEvent, SoftAssertions> c) {
        assertThat(eventInput.isClosed()).isEqualTo(false);

        // TODO add timeout
        final InboundEvent inboundEvent = eventInput.read();

        assertThat(inboundEvent).isNotNull();

        SoftAssertions.assertSoftly(sa -> {
            c.accept(inboundEvent, sa);
        });
    }

    protected static void expectWorkspaceContent(EventInput eventInput) {
        expectWorkspaceContent(eventInput, (t, a) -> {
        });
    }

    protected static void expectWorkspaceContent(EventInput eventInput,
            BiConsumer<WorkspaceFullContent, SoftAssertions> c) {
        expectEvent(eventInput, (e, a) -> {
            a.assertThat(e.getName()).isEqualTo("WORKSPACE_CONTENT");
            WorkspaceFullContent ev = e.readData(WorkspaceFullContent.class);
            c.accept(ev, a);
        });
    }
}
