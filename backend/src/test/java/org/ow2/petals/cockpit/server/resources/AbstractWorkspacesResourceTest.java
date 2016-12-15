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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.BiConsumer;

import javax.inject.Singleton;

import org.assertj.core.api.SoftAssertions;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.InboundEvent;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.hibernate.validator.constraints.NotEmpty;
import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.rules.TestRule;
import org.mockito.Mockito;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBus;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBusImported;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbComponent;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbContainer;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbServiceUnit;
import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.mocks.MockProfileParamValueFactoryProvider;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinComponent;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinServiceUnit;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ComponentTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.SUTree;

import com.fasterxml.jackson.annotation.JsonProperty;

import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.common.test.TestUtil;
import co.paralleluniverse.common.util.Debug;
import io.dropwizard.testing.junit.ResourceTestRule;
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
public class AbstractWorkspacesResourceTest {

    @Rule
    public TestRule watchman = TestUtil.WATCHMAN;

    protected UsersDAO users = mock(UsersDAO.class,
            withSettings()
                    // .verboseLogging()
                    .defaultAnswer(CALLS_REAL_METHODS));

    protected WorkspacesDAO workspaces = mock(WorkspacesDAO.class,
            withSettings()
                    // .verboseLogging()
                    .defaultAnswer(CALLS_REAL_METHODS));

    protected BusesDAO buses = mock(BusesDAO.class,
            withSettings()
                    // .verboseLogging()
                    .defaultAnswer(CALLS_REAL_METHODS));

    @Rule
    public ResourceTestRule resources = ResourceTestRule.builder()
            // in memory does not support SSE and the no-servlet one does not log...
            .setTestContainerFactory(new GrizzlyWebTestContainerFactory())
            // we pass the resource as a provider to get injection in constructor
            .addProvider(WorkspacesResource.class).addProvider(new MockProfileParamValueFactoryProvider.Binder())
            .addProvider(new AbstractBinder() {
                @Override
                protected void configure() {
                    bind(workspaces).to(WorkspacesDAO.class);
                    bind(buses).to(BusesDAO.class);
                    bind(users).to(UsersDAO.class);
                    bind(Executors.newSingleThreadExecutor()).named(CockpitApplication.PETALS_ADMIN_ES)
                            .to(ExecutorService.class);
                    bind(Executors.newSingleThreadExecutor()).named(CockpitApplication.JDBC_ES)
                            .to(ExecutorService.class);
                    bind(CockpitActors.class).to(CockpitActors.class).in(Singleton.class);
                    bind(PetalsAdministrationFactory.getInstance()).to(PetalsAdministrationFactory.class);
                }
            }).build();

    @BeforeClass
    public static void setUpQuasar() {
        // ensure this doesn't get called in a non-unit test thread and return false later when clearing the registry!
        assertThat(Debug.isUnitTest()).isTrue();
    }

    @After
    public void tearDown() {
        ActorRegistry.clear();
    }

    /**
     * TODO generate id automatically? but then we need some kind of way to query this data after that!
     */
    protected void setupWorkspace(long wsId, String wsName,
            List<Tuple4<Long, Domain, String, List<Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>>>>> data,
            String... users) {
        List<BusTree> bTrees = new ArrayList<>();
        List<DbBus> bs = new ArrayList<>();
        for (Tuple4<Long, Domain, String, List<Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>>>> bus : data) {
            Domain domain = bus._2;
            String passphrase = bus._3;
            List<Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>>> containers = bus._4;
            Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>> entry = containers
                    .iterator().next();
            DbBusImported bDb = new DbBusImported(bus._1, entry._2.getHost(), getPort(entry._2),
                    entry._2.getJmxUsername(), entry._2.getJmxPassword(), passphrase, domain.getName());

            List<ContainerTree> cTrees = new ArrayList<>();
            List<DbContainer> cs = new ArrayList<>();
            for (Tuple3<Long, Container, List<Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>>>> c : containers) {

                c._2.addProperty("petals.topology.passphrase", passphrase);

                DbContainer cDb = new DbContainer(c._1, c._2.getContainerName(), c._2.getHost(), getPort(c._2),
                        c._2.getJmxUsername(), c._2.getJmxPassword());

                List<ComponentTree> compTrees = new ArrayList<>();
                List<DbComponent> comps = new ArrayList<>();
                for (Tuple3<Long, Component, List<Tuple2<Long, ServiceAssembly>>> comp : c._3) {
                    DbComponent compDb = new DbComponent(comp._1, comp._2.getName(),
                            MinComponent.State.from(comp._2.getState()),
                            MinComponent.Type.from(comp._2.getComponentType()));

                    List<SUTree> suTrees = new ArrayList<>();
                    List<DbServiceUnit> sus = new ArrayList<>();
                    for (Tuple2<Long, ServiceAssembly> su : comp._3) {
                        List<ServiceUnit> sasus = su._2.getServiceUnits();
                        assert sasus.size() == 1;
                        ServiceUnit sasu = sasus.get(0);
                        assert sasu != null;
                        DbServiceUnit suDb = new DbServiceUnit(su._1, sasu.getName(),
                                MinServiceUnit.State.from(su._2.getState()), su._2.getName());

                        suTrees.add(new SUTree(suDb.id, suDb.name, MinServiceUnit.State.from(su._2.getState()),
                                suDb.saName));
                        sus.add(suDb);
                    }

                    compTrees.add(new ComponentTree(compDb.id, compDb.name, MinComponent.State.from(comp._2.getState()),
                            MinComponent.Type.from(comp._2.getComponentType()), suTrees));
                    comps.add(compDb);
                    when(buses.getServiceUnitByComponent(compDb)).thenReturn(sus);
                }

                // TODO handle also artifacts
                cTrees.add(new ContainerTree(cDb.id, cDb.name, compTrees));
                cs.add(cDb);
                when(buses.getContainerById(cDb.id)).thenReturn(cDb);
                when(buses.getComponentsByContainer(cDb)).thenReturn(comps);
            }

            bTrees.add(new BusTree(bDb.id, bDb.name, cTrees));
            bs.add(bDb);
            when(buses.getBusById(bDb.id)).thenReturn(bDb);
            when(buses.getContainersByBus(bDb)).thenReturn(cs);
        }

        DbWorkspace wDb = new DbWorkspace(wsId, wsName, Arrays.asList(users));

        doReturn(wDb).when(workspaces).getWorkspaceById(wDb.id);
        when(buses.getBusesByWorkspace(wDb)).thenReturn(bs);

        WorkspaceTree wTree = new WorkspaceTree(wDb.id, wDb.name, bTrees, Arrays.asList());

        doReturn(wTree).when(workspaces).getWorkspaceTree(wDb);
    }

    protected static int getPort(Container container) {
        Integer port = container.getPorts().get(PortType.JMX);
        assert port != null;
        return port;
    }

    protected static void expectEvent(EventInput eventInput, BiConsumer<InboundEvent, SoftAssertions> c) {
        SoftAssertions sa = new SoftAssertions();
        while (!eventInput.isClosed()) {
            try {
                final InboundEvent inboundEvent = eventInput.read();
                if (inboundEvent == null) {
                    // connection has been closed
                    break;
                }

                c.accept(inboundEvent, sa);

                sa.assertAll();
            } finally {
                eventInput.close();
            }
        }
    }

    protected static void expectWorkspaceEvent(EventInput eventInput, BiConsumer<WorkspaceEvent, SoftAssertions> c) {
        expectEvent(eventInput, (e, a) -> {
            a.assertThat(e.getName()).isEqualTo("WORKSPACE_CHANGE");
            WorkspaceEvent ev = e.readData(WorkspaceEvent.class);
            c.accept(ev, a);
        });
    }

    public static class WorkspaceEvent {

        @JsonProperty
        @NotEmpty
        public String event = "";

        @JsonProperty
        public Map<?, ?> data = new HashMap<>();
    }
}
