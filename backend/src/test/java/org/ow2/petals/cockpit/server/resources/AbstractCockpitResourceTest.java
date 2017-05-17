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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.function.BiConsumer;

import org.assertj.core.api.SoftAssertions;
import org.assertj.db.api.RequestRowAssert;
import org.assertj.db.type.Request;
import org.assertj.db.type.Table;
import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.InboundEvent;
import org.jooq.Record;
import org.jooq.TableField;
import org.jooq.conf.ParamType;
import org.jooq.impl.DSL;
import org.junit.Before;
import org.junit.Rule;
import org.mockito.Mockito;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.rules.CockpitResourceRule;
import org.ow2.petals.cockpit.server.security.CockpitProfile;

import com.google.common.collect.ImmutableList;

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
    public final CockpitResourceRule resource;

    private final Map<Object, Long> ids = new HashMap<>();

    public AbstractCockpitResourceTest(Class<?>... resources) {
        this.resource = new CockpitResourceRule(resources);
    }

    @Before
    public void setUpUser() {
        resource.setCurrentProfile(new CockpitProfile(ADMIN));
        resource.db().executeInsert(new UsersRecord(ADMIN, "...", "Administrator", null));
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
        return new Table(resource.db.getDataSource(), table.getName());
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
        return new Request(resource.db.getDataSource(),
                resource.db().selectFrom(field.getTable()).where(field.eq(id)).getSQL(ParamType.INLINED));
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
        resource.db().transaction(conf -> {

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

    protected ServiceAssemblyFull assertSAContent(WorkspaceContent content, Container cont, String saName,
            List<Component> comps) {
        SoftAssertions a = new SoftAssertions();
        ServiceAssemblyFull res = assertSAContent(a, content, null, cont, saName, comps);
        a.assertAll();
        return res;
    }

    protected ServiceAssemblyFull assertSAContent(SoftAssertions a, WorkspaceContent content,
            WorkspaceContent control) {
        return assertSAContent(a, content, control, null, null, ImmutableList.of());
    }

    private ServiceAssemblyFull assertSAContent(SoftAssertions a, WorkspaceContent content,
            @Nullable WorkspaceContent control, @Nullable Container cont, @Nullable String saName,
            List<Component> comps) {

        assertThat(content.buses).isEmpty();
        assertThat(content.busesInProgress).isEmpty();
        assertThat(content.containers).isEmpty();
        assertThat(content.components).isEmpty();
        assertThat(content.serviceAssemblies).hasSize(1);

        if (control == null) {
            assert cont != null;
            assert saName != null;
            Iterator<ServiceAssembly> iterator = cont.getServiceAssemblies().stream()
                    .filter(sa -> saName.equals(sa.getName())).iterator();
            assertThat(iterator.hasNext()).isTrue();
            assertThat(content.serviceUnits).hasSameSizeAs(iterator.next().getServiceUnits());
            a.assertThat(iterator.hasNext()).isFalse();
        } else {
            assertThat(content.serviceUnits).hasSameSizeAs(control.serviceUnits);
        }

        Entry<String, ServiceAssemblyFull> contentSAE = content.serviceAssemblies.entrySet().iterator().next();

        ServiceAssemblyFull contentSA = contentSAE.getValue();

        a.assertThat(contentSAE.getKey()).isEqualTo(Long.toString(contentSA.serviceAssembly.id));

        if (control == null) {
            assert saName != null;
            assert cont != null;

            // we already know it's present, see above
            ServiceAssembly sa = cont.getServiceAssemblies().stream().filter(s -> saName.equals(s.getName())).iterator()
                    .next();

            assertThat(sa.getName()).isEqualTo(contentSA.serviceAssembly.name);
            assertThat(sa.getState()).isEqualTo(ArtifactState.State.SHUTDOWN);
            assertThat(sa.getServiceUnits()).hasSameSizeAs(comps);

            // order is important
            List<Component> components = new ArrayList<>(comps);
            for (ServiceUnit su : sa.getServiceUnits()) {
                Component component = components.remove(0);
                Iterator<Entry<String, ServiceUnitFull>> iterator = content.serviceUnits.entrySet().stream()
                        .filter(e -> su.getName().equals(e.getValue().serviceUnit.name)).iterator();
                // there is one with this name
                a.assertThat(iterator.hasNext()).isTrue();
                if (iterator.hasNext()) {
                    Entry<String, ServiceUnitFull> contentSUE = iterator.next();
                    ServiceUnitFull contentSU = contentSUE.getValue();
                    a.assertThat(contentSUE.getKey()).isEqualTo(Long.toString(contentSU.serviceUnit.id));
                    a.assertThat(contentSU.componentId).isEqualTo(getId(component));
                    // TODO if we could find the id of the created SA via getId(), then we could check that
                    a.assertThat(contentSU.serviceAssemblyId).isEqualTo(contentSA.serviceAssembly.id);

                    // there is only one with this name
                    a.assertThat(iterator.hasNext()).isFalse();
                }
            }

            // we consumed all the components
            a.assertThat(components).isEmpty();

            a.assertThat(contentSA.containerId).isEqualTo(getId(cont));
            a.assertThat(contentSA.serviceAssembly.name).isEqualTo(sa.getName());
            a.assertThat(contentSA.state).isEqualTo(ServiceAssemblyMin.State.from(sa.getState()));
        } else {
            ServiceAssemblyFull controlSA = control.serviceAssemblies.values().iterator().next();

            for (Entry<String, ServiceUnitFull> controlSUE : control.serviceUnits.entrySet()) {
                ServiceUnitFull contentSU = content.serviceUnits.get(controlSUE.getKey());
                a.assertThat(contentSU).isEqualToComparingFieldByFieldRecursively(controlSUE.getValue());
            }

            a.assertThat(contentSA).isEqualToComparingFieldByFieldRecursively(controlSA);
        }

        return contentSA;
    }

    protected ComponentFull assertComponentContent(WorkspaceContent content, Container container,
            String componentName) {
        SoftAssertions a = new SoftAssertions();
        ComponentFull res = assertComponentContent(a, content, null, container, componentName);
        a.assertAll();
        return res;
    }

    protected ComponentFull assertComponentContent(SoftAssertions a, WorkspaceContent content,
            WorkspaceContent control) {
        return assertComponentContent(a, content, control, null, null);
    }

    protected ComponentFull assertComponentContent(SoftAssertions a, WorkspaceContent content,
            @Nullable WorkspaceContent control, @Nullable Container container, @Nullable String componentName) {
        assertThat(content.buses).isEmpty();
        assertThat(content.busesInProgress).isEmpty();
        assertThat(content.containers).isEmpty();
        assertThat(content.serviceAssemblies).isEmpty();
        assertThat(content.serviceUnits).isEmpty();
        assertThat(content.components).hasSize(1);

        Entry<String, ComponentFull> contentCE = content.components.entrySet().iterator().next();
        ComponentFull contentC = contentCE.getValue();

        a.assertThat(contentCE.getKey()).isEqualTo(Long.toString(contentC.component.id));

        if (control == null) {
            assert container != null;
            assert componentName != null;
            a.assertThat(contentC.containerId).isEqualTo(getId(container));
            a.assertThat(contentC.component.name).isEqualTo(componentName);
            a.assertThat(contentC.component.type).isEqualTo(ComponentMin.Type.BC);
            a.assertThat(contentC.state).isEqualTo(ComponentMin.State.Loaded);
        } else {
            ComponentFull controlC = content.components.values().iterator().next();
            a.assertThat(contentC).isEqualToComparingFieldByFieldRecursively(controlC);
        }

        return contentC;
    }
}
