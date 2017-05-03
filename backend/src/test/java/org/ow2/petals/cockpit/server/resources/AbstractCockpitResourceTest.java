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
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.jooq.Record;
import org.jooq.TableField;
import org.jooq.conf.ParamType;
import org.jooq.impl.DSL;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.rules.TestRule;
import org.mockito.Mockito;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.mocks.MockArtifactServer;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.ow2.petals.cockpit.server.services.ArtifactServer;
import org.ow2.petals.cockpit.server.services.PetalsAdmin;
import org.ow2.petals.cockpit.server.services.PetalsDb;
import org.ow2.petals.jmx.api.mock.junit.PetalsJmxApiJunitRule;
import org.pac4j.jax.rs.jersey.features.Pac4JValueFactoryProvider;
import org.zapodot.junit.db.EmbeddedDatabaseRule;
import org.zapodot.junit.db.plugin.LiquibaseInitializer;

import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.common.test.TestUtil;
import co.paralleluniverse.common.util.Debug;
import io.dropwizard.testing.junit.ResourceTestRule;
import io.dropwizard.testing.junit.ResourceTestRule.Builder;
import javaslang.Tuple2;

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
public class AbstractCockpitResourceTest extends AbstractTest {

    public static final String ADMIN = "admin";

    @Rule
    public final TestRule watchman = TestUtil.WATCHMAN;

    @Rule
    public final PetalsJmxApiJunitRule jmx = new PetalsJmxApiJunitRule();

    @Rule
    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    @Rule
    public final EmbeddedDatabaseRule dbRule = EmbeddedDatabaseRule.builder()
            .initializedByPlugin(LiquibaseInitializer.builder().withChangelogResource("migrations.xml").build())
            .build();

    @Rule
    public MockArtifactServer httpServer = new MockArtifactServer();

    private final Map<Object, Long> ids = new HashMap<>();

    protected ResourceTestRule buildResourceTest(Class<?>... resources) {
        Builder builder = ResourceTestRule.builder()
                // in memory does not support SSE and the no-servlet one does not log...
                .setTestContainerFactory(new GrizzlyWebTestContainerFactory()).addProvider(new AbstractBinder() {
                    @Override
                    protected void configure() {
                        bind(DSL.using(dbRule.getConnectionJdbcUrl()).configuration()).to(Configuration.class);
                        bind(Executors.newFixedThreadPool(4)).named(CockpitApplication.BLOCKING_TASK_ES)
                                .to(ExecutorService.class);
                        bind(CockpitActors.class).to(CockpitActors.class).in(Singleton.class);
                        bind(httpServer).to(ArtifactServer.class);
                        bind(PetalsAdmin.class).to(PetalsAdmin.class).in(Singleton.class);
                        bind(PetalsDb.class).to(PetalsDb.class).in(Singleton.class);
                    }
                }).setClientConfigurator(cc -> cc.register(MultiPartFeature.class));
        builder.addProvider(new Pac4JValueFactoryProvider.Binder(new CockpitProfile(ADMIN)));
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

    protected long getId(Object o) {
        assertThat(o).isNotNull();
        Long id = ids.get(o);
        assertThat(id).isNotNull();
        assert id != null;
        return id;
    }

    private void setId(Object o, long id) {
        assertThat(o).isNotNull();
        Long old = ids.putIfAbsent(o, id);
        assertThat(old).isNull();
    }

    protected Table table(org.jooq.Table<?> table) {
        return new Table(dbRule.getDataSource(), table.getName());
    }

    protected RequestRowAssert assertThatDbSU(long id) {
        return assertThat(requestSU(id)).hasNumberOfRows(1).row();
    }

    protected RequestRowAssert assertThatDbSA(long id) {
        return assertThat(requestSA(id)).hasNumberOfRows(1).row();
    }

    protected RequestRowAssert assertThatDbComp(long id) {
        return assertThat(requestComp(id)).hasNumberOfRows(1).row();
    }

    protected void assertNoDbSU(long id) {
        assertThat(requestSU(id)).hasNumberOfRows(0);
    }

    protected void assertNoDbSA(long id) {
        assertThat(requestSA(id)).hasNumberOfRows(0);
    }

    protected void assertNoDbComp(long id) {
        assertThat(requestComp(id)).hasNumberOfRows(0);
    }

    protected <R extends Record, T> Request requestBy(TableField<R, T> field, T id) {
        return new Request(dbRule.getDataSource(), DSL.using(dbRule.getConnectionJdbcUrl()).selectFrom(field.getTable())
                .where(field.eq(id)).getSQL(ParamType.INLINED));
    }

    protected Request requestWorkspace(long id) {
        return requestBy(WORKSPACES.ID, id);
    }

    protected Request requestUser(String username) {
        return requestBy(USERS.USERNAME, username);
    }

    protected Request requestBus(long id) {
        return requestBy(BUSES.ID, id);
    }

    protected Request requestContainer(long id) {
        return requestBy(CONTAINERS.ID, id);
    }

    protected Request requestComponent(long id) {
        return requestBy(COMPONENTS.ID, id);
    }

    protected Request requestSU(long id) {
        return requestBy(SERVICEUNITS.ID, id);
    }

    protected Request requestSA(long id) {
        return requestBy(SERVICEASSEMBLIES.ID, id);
    }

    protected Request requestComp(long id) {
        return requestBy(COMPONENTS.ID, id);
    }

    /**
     * TODO generate id automatically? but then we need some kind of way to query this data after that!
     */
    protected void setupWorkspace(long wsId, String wsName, List<Tuple2<Domain, String>> data, String... users) {
        DSL.using(dbRule.getConnectionJdbcUrl()).transaction(conf -> {

            DSL.using(conf).executeInsert(new WorkspacesRecord(wsId, wsName, ""));

            for (String user : users) {
                DSL.using(conf).executeInsert(new UsersWorkspacesRecord(wsId, user));
            }

            for (Tuple2<Domain, String> d : data) {
                Domain bus = d._1;
                String passphrase = d._2;
                List<Container> containers = bus.getContainers();
                Container entry = containers.iterator().next();

                BusesRecord busDb = new BusesRecord(null, wsId, true, entry.getHost(), getPort(entry),
                        entry.getJmxUsername(), entry.getJmxPassword(), passphrase, null, bus.getName());
                busDb.attach(conf);
                busDb.insert();
                setId(bus, busDb.getId());

                for (Container c : containers) {
                    c.addProperty("petals.topology.passphrase", passphrase);

                    // TODO handle also artifacts
                    ContainersRecord cDb = new ContainersRecord(null, busDb.getId(), c.getContainerName(), c.getHost(),
                            getPort(c), c.getJmxUsername(), c.getJmxPassword());
                    cDb.attach(conf);
                    cDb.insert();
                    setId(c, cDb.getId());

                    for (Component comp : c.getComponents()) {
                        ComponentsRecord compDb = new ComponentsRecord(null, cDb.getId(), comp.getName(),
                                ComponentMin.State.from(comp.getState()).name(),
                                ComponentMin.Type.from(comp.getComponentType()).name());
                        compDb.attach(conf);
                        compDb.insert();
                        setId(comp, compDb.getId());
                    }

                    for (ServiceAssembly sa : c.getServiceAssemblies()) {
                        ServiceassembliesRecord saDb = new ServiceassembliesRecord(null, cDb.getId(), sa.getName(),
                                ServiceAssemblyMin.State.from(sa.getState()).name());
                        saDb.attach(conf);
                        saDb.insert();
                        setId(sa, saDb.getId());

                        for (ServiceUnit su : sa.getServiceUnits()) {
                            Long compId = ids.get(c.getComponents().stream()
                                    .filter(comp -> comp.getName().equals(su.getTargetComponent())).findFirst().get());

                            ServiceunitsRecord suDb = new ServiceunitsRecord(null, compId, su.getName(), saDb.getId(),
                                    cDb.getId());
                            suDb.attach(conf);
                            suDb.insert();
                            setId(su, suDb.getId());
                        }
                    }
                }
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

    protected static void assertEquivalent(ServiceassembliesRecord record, ServiceAssembly sa) {
        assertThat(record.getName()).isEqualTo(sa.getName());
        assertThat(record.getState()).isEqualTo(ServiceAssemblyMin.State.from(sa.getState()).name());
    }

    protected static void assertEquivalent(ServiceunitsRecord record, ServiceUnit su) {
        assertThat(record.getName()).isEqualTo(su.getName());
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
