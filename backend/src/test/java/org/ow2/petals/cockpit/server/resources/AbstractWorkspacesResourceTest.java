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
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.inject.Singleton;

import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.junit.After;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.rules.TestRule;
import org.mockito.Mockito;
import org.ow2.petals.admin.api.artifact.Component;
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
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.ContainersResource.MinComponent;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ComponentTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.ow2.petals.cockpit.server.security.MockProfileParamValueFactoryProvider;

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
 * @author vnoel
 *
 */
public class AbstractWorkspacesResourceTest {

    @Rule
    public TestRule watchman = TestUtil.WATCHMAN;

    protected static WorkspacesDAO workspaces = mock(WorkspacesDAOMock.class,
            withSettings()
                    // .verboseLogging()
                    .defaultAnswer(CALLS_REAL_METHODS));

    protected static BusesDAO buses = mock(BusesDAO.class,
            withSettings()
                    // .verboseLogging()
                    .defaultAnswer(CALLS_REAL_METHODS));

    public abstract static class WorkspacesDAOMock extends WorkspacesDAO {
        @Override
        protected BusesDAO buses() {
            return buses;
        }
    }

    @ClassRule
    public static ResourceTestRule resources = ResourceTestRule.builder()
            // in memory does not support SSE and the no-servlet one does not log...
            .setTestContainerFactory(new GrizzlyWebTestContainerFactory())
            // we pass the resource as a provider to get injection in constructor
            .addProvider(WorkspacesResource.class).addProvider(new MockProfileParamValueFactoryProvider.Binder())
            .addProvider(new AbstractBinder() {
                @Override
                protected void configure() {
                    bind(workspaces).to(WorkspacesDAO.class);
                    bind(buses).to(BusesDAO.class);
                    bind(Executors.newSingleThreadExecutor()).named(CockpitApplication.PETALS_ADMIN_ES)
                            .to(ExecutorService.class);
                    bind(Executors.newSingleThreadExecutor()).named(CockpitApplication.JDBC_ES)
                            .to(ExecutorService.class);
                    bind(CockpitActors.class).to(CockpitActors.class).in(Singleton.class);
                }
            }).build();

    @BeforeClass
    public static void setUpQuasar() {
        // ensure this doesn't get called in a non-unit test thread and return false later when clearing the registry!
        assertThat(Debug.isUnitTest()).isTrue();
    }

    @After
    public void tearDown() {
        reset(workspaces);
        reset(buses);

        ActorRegistry.clear();
    }

    /**
     * TODO generate id automatically? but then we need some kind of way to query this data after that!
     */
    protected void setupWorkspace(long wsId, String wsName,
            List<Tuple4<Long, Domain, String, List<Tuple3<Long, Container, List<Tuple2<Long, Component>>>>>> data,
            String... users) {
        List<BusTree> bTrees = new ArrayList<>();
        List<DbBus> bs = new ArrayList<>();
        for (Tuple4<Long, Domain, String, List<Tuple3<Long, Container, List<Tuple2<Long, Component>>>>> bus : data) {
            Domain domain = bus._2;
            String passphrase = bus._3;
            List<Tuple3<Long, Container, List<Tuple2<Long, Component>>>> containers = bus._4;
            Tuple3<Long, Container, List<Tuple2<Long, Component>>> entry = containers.get(0);
            assert entry != null;
            DbBusImported bDb = new DbBusImported(bus._1, entry._2.getHost(), getPort(entry._2),
                    entry._2.getJmxUsername(), entry._2.getJmxPassword(), passphrase, domain.getName());

            List<ContainerTree> cTrees = new ArrayList<>();
            List<DbContainer> cs = new ArrayList<>();
            for (Tuple3<Long, Container, List<Tuple2<Long, Component>>> c : containers) {

                c._2.addProperty("petals.topology.passphrase", passphrase);

                DbContainer cDb = new DbContainer(c._1, c._2.getContainerName(), c._2.getHost(), getPort(c._2),
                        c._2.getJmxUsername(), c._2.getJmxPassword());

                List<ComponentTree> compTrees = new ArrayList<>();
                List<DbComponent> comps = new ArrayList<>();
                for (Tuple2<Long, Component> comp : c._3) {
                    DbComponent compDb = new DbComponent(comp._1, comp._2.getName(), comp._2.getState().toString(),
                            comp._2.getComponentType().toString());

                    compTrees.add(new ComponentTree(compDb.id, compDb.name, MinComponent.State.from(comp._2.getState()),
                            MinComponent.Type.from(comp._2.getComponentType()), Arrays.asList()));
                    comps.add(compDb);
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

}
