/**
 * Copyright (C) 2016-2019 Linagora
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
import static org.ow2.petals.cockpit.server.db.generated.Tables.EDP_INSTANCES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.ENDPOINTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.INTERFACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES_COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.IOUtils;
import org.assertj.core.api.Assertions;
import org.assertj.core.api.SoftAssertions;
import org.assertj.db.api.RequestRowAssert;
import org.assertj.db.type.Request;
import org.assertj.db.type.Table;
import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.file.FileDataBodyPart;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.InboundEvent;
import org.jooq.Record;
import org.jooq.TableField;
import org.jooq.conf.ParamType;
import org.jooq.impl.DSL;
import org.junit.Rule;
import org.junit.rules.TemporaryFolder;
import org.mockito.Mockito;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.endpoint.Endpoint;
import org.ow2.petals.admin.endpoint.EndpointDirectoryView;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.bundles.security.CockpitAuthenticator;
import org.ow2.petals.cockpit.server.db.generated.Keys;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.EdpInstancesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.EndpointsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.InterfacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServicesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersWorkspacesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerFull;
import org.ow2.petals.cockpit.server.resources.EndpointsResource.EndpointFull;
import org.ow2.petals.cockpit.server.resources.InterfacesResource.InterfaceFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.ServicesResource.ServiceFull;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.rules.CockpitResourceRule;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations.WorkspaceDbWitness;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.ImmutableList;

import javaslang.Tuple2;

/**
 * Note: to override one of the already implemented method in {@link #workspaces} or {@link #buses}, it is needed to use
 * {@link Mockito#doReturn(Object)} and not {@link Mockito#when(Object)}!!
 *
 * @author vnoel
 *
 */
public class AbstractCockpitResourceTest extends AbstractTest {

    private static final Logger LOG = LoggerFactory.getLogger(AbstractCockpitResourceTest.class);

    private final int DEFAULT_SSE_TIMEOUT = 10;

    private final int EXPECT_NOTHING_SSE_TIMEOUT = 4;

    @Rule
    public TemporaryFolder zipFolder = new TemporaryFolder();

    @Rule
    public final CockpitResourceRule resource;

    public AbstractCockpitResourceTest(Class<?>... resources) {
        this.resource = new CockpitResourceRule(resources);
    }

    protected void addUser(String username) {
        addUser(username, false);
    }

    protected void addUser(String username, boolean admin) {
        resource.db().executeInsert(new UsersRecord(username, CockpitAuthenticator.passwordEncoder.encode(username),
                username, null, admin, false));
    }

    protected void changePermissions(Long wsId, String username, boolean adminWs, boolean deploy, boolean lifeCycle) {
        resource.db().executeUpdate(new UsersWorkspacesRecord(wsId, username, adminWs, deploy, lifeCycle));
    }

    protected long getId(Object o) {
        return resource.getDbObjectId(o);
    }

    protected Table table(org.jooq.Table<?> table) {
        return new Table(resource.db.getDataSource(), table.getName());
    }

    protected RequestRowAssert assertThatDbSU(ServiceUnit su) {
        return assertThat(requestSU(su)).hasNumberOfRows(1).row();
    }

    protected RequestRowAssert assertThatDbSA(ServiceAssembly sa) {
        return assertThat(requestSA(sa)).hasNumberOfRows(1).row();
    }

    protected RequestRowAssert assertThatDbSL(SharedLibrary sl) {
        return assertThat(requestSL(sl)).hasNumberOfRows(1).row();
    }

    protected void assertThatDbSAState(ServiceAssembly sa, ServiceAssemblyMin.State expectedState) {
        assertThatDbSA(sa).value(SERVICEASSEMBLIES.STATE.getName()).isEqualTo(expectedState.name());
    }

    protected void assertThatSAState(ServiceAssembly sa, ArtifactState.State expectedState) {
        assertThatDbSAState(sa, ServiceAssemblyMin.State.from(expectedState));
        assertThat(sa.getState()).isEqualTo(expectedState);
    }

    protected RequestRowAssert assertThatDbComponent(Component c) {
        return assertThat(requestComponent(c)).hasNumberOfRows(1).row();
    }

    protected void assertThatDbComponentState(Component c, ComponentMin.State expectedState) {
        assertThatDbComponent(c).value(COMPONENTS.STATE.getName()).isEqualTo(expectedState.name());
    }

    protected void assertThatComponentState(Component c, ArtifactState.State expectedState) {
        assertThatDbComponentState(c, ComponentMin.State.from(expectedState));
        assertThat(c.getState()).isEqualTo(expectedState);
    }

    protected RequestRowAssert assertThatDbUser(String username) {
        return assertThat(requestUser(username)).hasNumberOfRows(1).row();
    }

    protected void assertThatDbUserPassword(String username, String plainPw) {
        // TODO see https://github.com/joel-costigliola/assertj-db/issues/24
        String dbPw = resource.db().selectFrom(USERS).where(USERS.USERNAME.eq(username)).fetchOne(USERS.PASSWORD);
        assertThat(CockpitAuthenticator.passwordEncoder.matches(plainPw, dbPw)).isTrue();
    }

    protected void assertNoDbUser(String username) {
        assertThat(requestUser(username)).hasNumberOfRows(0);
    }

    protected void assertNoDbSU(ServiceUnit su) {
        assertThat(requestSU(su)).hasNumberOfRows(0);
    }

    protected void assertNoDbSA(ServiceAssembly sa) {
        assertThat(requestSA(sa)).hasNumberOfRows(0);
    }

    protected void assertNoDbSL(SharedLibrary sl) {
        assertThat(requestSL(sl)).hasNumberOfRows(0);
    }

    protected void assertNoDbComponent(Component c) {
        assertThat(requestComponent(c)).hasNumberOfRows(0);
    }

    protected <R extends Record, T> Request requestBy(TableField<R, T> field, T id) {
        return new Request(resource.db.getDataSource(),
                resource.db().selectFrom(field.getTable()).where(field.eq(id)).getSQL(ParamType.INLINED));
    }

    protected Request requestWorkspace(long id) {
        return requestBy(WORKSPACES.ID, id);
    }

    protected Request requestUsersWorkspaces(long wsId, String username) {
        return new Request(resource.db.getDataSource(),
                resource.db().selectFrom(USERS_WORKSPACES)
                        .where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId))
                        .and(USERS_WORKSPACES.USERNAME.eq(username))
                        .getSQL(ParamType.INLINED));
    }

    protected Request requestUser(String username) {
        return requestBy(USERS.USERNAME, username);
    }

    protected Request requestBus(Domain bus) {
        return requestBy(BUSES.ID, getId(bus));
    }

    protected Request requestContainer(Container c) {
        return requestBy(CONTAINERS.ID, getId(c));
    }

    protected Request requestComponent(Component c) {
        return requestBy(COMPONENTS.ID, getId(c));
    }

    protected Request requestSU(ServiceUnit su) {
        return requestBy(SERVICEUNITS.ID, getId(su));
    }

    protected Request requestSA(ServiceAssembly sa) {
        return requestBy(SERVICEASSEMBLIES.ID, getId(sa));
    }

    protected Request requestSL(SharedLibrary sl) {
        return requestBy(SHAREDLIBRARIES.ID, getId(sl));
    }

    protected void setupWorkspace(long wsId, String wsName, List<Tuple2<Domain, String>> data, String... users) {
        resource.db().transaction(conf -> {

            DSL.using(conf).executeInsert(new WorkspacesRecord(wsId, wsName, "", ""));

            for (String user : users) {
                DSL.using(conf).executeInsert(new UsersWorkspacesRecord(wsId, user, false, false, false));
            }

            for (Tuple2<Domain, String> d : data) {
                Domain bus = d._1;
                String passphrase = d._2;
                List<Container> containers = bus.getContainers();
                Container entry = containers.iterator().next();

                BusesRecord busDb = new BusesRecord(null, wsId, true, entry.getHost(), getPort(entry),
                        entry.getJmxUsername(), bus.getName());
                busDb.attach(conf);
                busDb.insert();

                resource.new TestWorkspaceDbOperations().saveDomainToDatabase(conf, busDb, bus, WorkspaceDbWitness.NOP);

                final String regexAny = ".*";
                for (Container c : containers) {
                    c.addProperty("petals.topology.passphrase", passphrase);
                    final EndpointDirectoryView edpDirView = resource.petals.newPetalsAdministration()
                            .newEndpointDirectoryAdministration()
                            .getEndpointDirectoryContent(c.getContainerName(), regexAny, regexAny, regexAny);
                    if (edpDirView != null) {
                        // Endpoints update cannot be triggered normally when setting up like that, so it's called
                        // manually for each container. This may trigger disregardable errors, as mocks returns the
                        // same EndpointDirectoryView for every container.
                        resource.new TestWorkspaceDbOperations().storeServicesList(edpDirView, getId(c), conf);
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

    protected void assertEquivalent(SoftAssertions a, BusesRecord record, Domain bus) {
        a.assertThat(record.getName()).isEqualTo(bus.getName());
    }

    protected void assertEquivalent(SoftAssertions a, ContainersRecord record, Container container) {
        a.assertThat(record.getIp()).isEqualTo(container.getHost());
        a.assertThat(record.getPort()).isEqualTo(getPort(container));
        a.assertThat(record.getUsername()).isEqualTo(container.getJmxUsername());
        a.assertThat(record.getPassword()).isEqualTo(container.getJmxPassword());
        a.assertThat(record.getName()).isEqualTo(container.getContainerName());
    }

    protected void assertEquivalent(SoftAssertions a, ComponentsRecord record, Component component) {
        a.assertThat(record.getName()).isEqualTo(component.getName());
        a.assertThat(record.getState()).isEqualTo(ComponentMin.State.from(component.getState()).name());
        a.assertThat(record.getType()).isEqualTo(ComponentMin.Type.from(component.getComponentType()).name());
    }

    protected void assertEquivalent(SoftAssertions a, ServiceassembliesRecord record, ServiceAssembly sa) {
        a.assertThat(record.getName()).isEqualTo(sa.getName());
        a.assertThat(record.getState()).isEqualTo(ServiceAssemblyMin.State.from(sa.getState()).name());
    }

    protected void assertEquivalent(SoftAssertions a, ServiceunitsRecord record, ServiceUnit su) {
        a.assertThat(record.getName()).isEqualTo(su.getName());
    }

    protected void assertEquivalent(SoftAssertions a, SharedlibrariesRecord record, SharedLibrary sl) {
        a.assertThat(record.getName()).isEqualTo(sl.getName());
        a.assertThat(record.getVersion()).isEqualTo(sl.getVersion());
    }

    protected void expectEvent(EventInput eventInput, BiConsumer<InboundEvent, SoftAssertions> c) {
        expectEventAmongNext(1, null, DEFAULT_SSE_TIMEOUT, true, eventInput, c);
    }

    protected void expectEventAmongNext(int eventsNumber, @Nullable String expectedName, int timeout,
            boolean failOnTimeout, EventInput eventInput, BiConsumer<InboundEvent, SoftAssertions> c) {

        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<?> future = executor.submit(() -> {
            for (int i = eventsNumber; i > 0; i--) {

                assertThat(eventInput.isClosed()).isEqualTo(false);
                final InboundEvent inboundEvent = eventInput.read();
                assertThat(inboundEvent).isNotNull();

                if (expectedName == null || inboundEvent.getName().equals(expectedName)) {
                    SoftAssertions.assertSoftly(sa -> {
                        c.accept(inboundEvent, sa);
                    });
                    if (expectedName != null)
                        return;
                }
            }
        });

        try {
            future.get(timeout, TimeUnit.SECONDS);
        } catch (ExecutionException e) {
            Assertions.fail("Error occured while expecting/asserting event :", e);
        } catch (TimeoutException | InterruptedException e) {
            future.cancel(true);
            try {
                // eventInput is probably locked reading an unexisting event
                LOG.debug("Tearing down jersey!");
                resource.resource.getJerseyTest().tearDown();
            } catch (Exception e1) {
                LOG.error("Error occured while trying to tear down Jersey after an error", e1);
            }
            if (failOnTimeout) {
                Assertions.fail("Timeout occured while expecting/asserting event :", e);
            }
        } finally {
            executor.shutdownNow();
        }
    }

    protected void expectWorkspaceContent(EventInput eventInput) {
        expectWorkspaceContent(eventInput, (t, a) -> {
        });
    }

    protected void expectWorkspaceContent(EventInput eventInput, BiConsumer<WorkspaceFullContent, SoftAssertions> c) {
        expectEvent(eventInput, (e, a) -> {
            a.assertThat(e.getName()).isEqualTo("WORKSPACE_CONTENT");
            WorkspaceFullContent ev = e.readData(WorkspaceFullContent.class);
            c.accept(ev, a);
        });
    }

    protected void expectServicesUpdatedAmongNext2(EventInput eventInput,
            BiConsumer<WorkspaceContent, SoftAssertions> c) {
        expectEventAmongNext(2, "SERVICES_UPDATED", DEFAULT_SSE_TIMEOUT, true, eventInput, (e, a) -> {
            a.assertThat(e.getName()).isEqualTo("SERVICES_UPDATED");
            WorkspaceContent ev = e.readData(WorkspaceContent.class);
            c.accept(ev, a);
        });
    }

    protected void expectNoServicesUpdated(EventInput eventInput) {
        SoftAssertions.assertSoftly(sa -> {
            expectEventAmongNext(2, "SERVICES_UPDATED", EXPECT_NOTHING_SSE_TIMEOUT, false, eventInput, (e, a) -> {
                sa.fail("Failure: \"SERVICES_UPDATED\" SSE Event should not have been sent!");
            });
        });

    }

    protected SharedLibraryFull assertSLContent(WorkspaceContent content, Container cont, String slName,
            String slVersion) {
        SoftAssertions a = new SoftAssertions();
        SharedLibraryFull res = assertSLContent(a, content, null, cont, slName, slVersion);
        a.assertAll();
        return res;
    }

    protected SharedLibraryFull assertSLContent(SoftAssertions a, WorkspaceContent content, WorkspaceContent control) {
        return assertSLContent(a, content, control, null, null, null);
    }

    private SharedLibraryFull assertSLContent(SoftAssertions a, WorkspaceContent content,
            @Nullable WorkspaceContent control, @Nullable Container container, @Nullable String slName,
            @Nullable String slVersion) {
        assertThat(content.buses).isEmpty();
        assertThat(content.busesInProgress).isEmpty();
        assertThat(content.containers).isEmpty();
        assertThat(content.components).isEmpty();
        assertThat(content.serviceAssemblies).isEmpty();
        assertThat(content.sharedLibraries).hasSize(1);
        assertThat(content.services).isEmpty();

        Entry<String, SharedLibraryFull> contentSLE = content.sharedLibraries.entrySet().iterator().next();
        SharedLibraryFull contentSL = contentSLE.getValue();

        a.assertThat(contentSLE.getKey()).isEqualTo(Long.toString(contentSL.sharedLibrary.id));

        if (control == null) {
            assert container != null;
            assert slName != null;
            assert slVersion != null;

            Iterator<SharedLibrary> iterator = container.getSharedLibraries().stream()
                    .filter(c -> slName.equals(c.getName()) && slVersion.equals(c.getVersion())).iterator();
            assertThat(iterator.hasNext()).isTrue();
            SharedLibrary sl = iterator.next();
            assertThat(iterator.hasNext()).isFalse();

            a.assertThat(contentSL.sharedLibrary.id).isEqualTo(getId(sl));
            a.assertThat(contentSL.containerId).isEqualTo(getId(container));
            a.assertThat(contentSL.sharedLibrary.name).isEqualTo(slName);
            a.assertThat(contentSL.sharedLibrary.version).isEqualTo(slVersion);
            a.assertThat(contentSL.components).isEmpty();
        } else {
            SharedLibraryFull controlSL = content.sharedLibraries.values().iterator().next();
            a.assertThat(contentSL).isEqualToComparingFieldByFieldRecursively(controlSL);
        }

        return contentSL;
    }

    protected ServiceAssemblyFull assertSAContent(WorkspaceContent content, Container container, String saName,
            List<Component> comps) {
        SoftAssertions a = new SoftAssertions();
        ServiceAssemblyFull res = assertSAContent(a, content, null, container, saName, comps);
        a.assertAll();
        return res;
    }

    protected ServiceAssemblyFull assertSAContent(SoftAssertions a, WorkspaceContent content,
            WorkspaceContent control) {
        return assertSAContent(a, content, control, null, null, ImmutableList.of());
    }

    private ServiceAssemblyFull assertSAContent(SoftAssertions a, WorkspaceContent content,
            @Nullable WorkspaceContent control, @Nullable Container container, @Nullable String saName,
            List<Component> comps) {
        assertThat(content.buses).isEmpty();
        assertThat(content.busesInProgress).isEmpty();
        assertThat(content.containers).isEmpty();
        assertThat(content.components).isEmpty();
        assertThat(content.serviceAssemblies).hasSize(1);
        assertThat(content.sharedLibraries).isEmpty();
        assertThat(content.services).isEmpty();

        if (control == null) {
            assert container != null;
            assert saName != null;
            Iterator<ServiceAssembly> iterator = container.getServiceAssemblies().stream()
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
            assert container != null;

            // we already know it's present, see above
            ServiceAssembly sa = container.getServiceAssemblies().stream().filter(s -> saName.equals(s.getName()))
                    .iterator().next();

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
                    a.assertThat(contentSU.serviceAssemblyId).isEqualTo(getId(sa));
                    a.assertThat(contentSU.serviceAssemblyId).isEqualTo(contentSA.serviceAssembly.id);

                    // there is only one with this name
                    a.assertThat(iterator.hasNext()).isFalse();
                }
            }

            // we consumed all the components
            a.assertThat(components).isEmpty();

            a.assertThat(contentSA.containerId).isEqualTo(getId(container));
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
        assertThat(content.sharedLibraries).isEmpty();

        Entry<String, ComponentFull> contentCE = content.components.entrySet().iterator().next();
        ComponentFull contentC = contentCE.getValue();

        a.assertThat(contentCE.getKey()).isEqualTo(Long.toString(contentC.component.id));

        if (control == null) {
            assert container != null;
            assert componentName != null;

            Iterator<Component> iterator = container.getComponents().stream()
                    .filter(c -> componentName.equals(c.getName())).iterator();
            assertThat(iterator.hasNext()).isTrue();
            Component component = iterator.next();
            assertThat(iterator.hasNext()).isFalse();

            a.assertThat(contentC.component.id).isEqualTo(getId(component));
            a.assertThat(contentC.containerId).isEqualTo(getId(container));
            a.assertThat(contentC.component.name).isEqualTo(componentName);
            a.assertThat(contentC.component.type).isEqualTo(ComponentMin.Type.BC);
            a.assertThat(contentC.state).isEqualTo(ComponentMin.State.Loaded);
            a.assertThat(contentC.sharedLibraries).hasSameElementsAs(getIds(component.getSharedLibraries()));
            a.assertThat(contentC.serviceUnits).hasSameElementsAs(getIds(getComponentSUs(container, component)));
        } else {
            ComponentFull controlC = content.components.values().iterator().next();
            a.assertThat(contentC).isEqualToComparingFieldByFieldRecursively(controlC);
        }

        return contentC;
    }

    @SuppressWarnings({ "resource" })
    protected FormDataMultiPart getMultiPartFakeZip(String zipFilename) throws Exception {
        File file = new File(zipFolder.newFolder(), zipFilename + ".zip");
        file.createNewFile();
        return (FormDataMultiPart) new FormDataMultiPart().bodyPart(new FileDataBodyPart("file", file));
    }

    @SuppressWarnings({ "resource" })
    protected FormDataMultiPart getMultiPartEmptyZip(String zipFilename) throws Exception {
        File zip = new File(zipFolder.newFolder(), zipFilename + ".zip");
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zip))) {
            zos.closeEntry();
        }
        return (FormDataMultiPart) new FormDataMultiPart().bodyPart(new FileDataBodyPart("file", zip));
    }

    @SuppressWarnings({ "resource" })
    protected FormDataMultiPart getMultiPart(String jbiFilename, String zipFilename) throws Exception {
        return (FormDataMultiPart) new FormDataMultiPart()
                .bodyPart(new FileDataBodyPart("file", createZipFromJBIFile(jbiFilename, zipFilename)));
    }

    protected File createZipFromJBIFile(String jbiFilename, String zipFilename) throws Exception {
        // To be able to create 2 URL in the same test, we must used random folder storing zip file.
        File zip = new File(zipFolder.newFolder(), zipFilename + ".zip");
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zip));
                InputStream fis = AbstractCockpitResourceTest.class.getResourceAsStream("/" + jbiFilename)) {
            zos.putNextEntry(new ZipEntry("META-INF/jbi.xml"));
            try {
                IOUtils.copy(fis, zos);
            } finally {
                zos.closeEntry();
            }
        }
        return zip;
    }

    protected void assertWorkspaceContentForBuses(SoftAssertions a, WorkspaceContent content, long wsId,
            Domain... buses) {
        for (Domain bus : buses) {
            long id = getId(bus);
            BusFull b = content.buses.get(Long.toString(id));
            assert b != null;

            a.assertThat(b.bus.id).isEqualTo(id);
            a.assertThat(b.bus.name).isEqualTo(bus.getName());
            a.assertThat(b.workspaceId).isEqualTo(wsId);
            a.assertThat(b.containers).hasSameElementsAs(getIds(bus.getContainers()));

            BusesRecord bDb = resource.db().selectFrom(BUSES).where(BUSES.ID.eq(id).and(BUSES.WORKSPACE_ID.eq(wsId)))
                    .fetchOne();
            assert bDb != null;
            assertEquivalent(a, bDb, bus);
        }

        assertThat(content.buses).hasSameSizeAs(buses);
    }

    protected Set<String> getIds(Collection<?> coll) {
        return getIds(coll.stream());
    }

    protected Set<String> getIds(Stream<?> stream) {
        return getLongIds(stream).map(id -> Long.toString(id)).collect(Collectors.toSet());
    }

    protected Stream<Long> getLongIds(Collection<?> coll) {
        return getLongIds(coll.stream());
    }

    protected Stream<Long> getLongIds(Stream<?> stream) {
        return stream.map(e -> getId(e));
    }

    protected void assertWorkspaceContentForContainers(SoftAssertions a, WorkspaceContent content, Domain... buses) {
        for (Domain bus : buses) {
            long busId = getId(bus);
            for (Container cont : bus.getContainers()) {
                long id = getId(cont);
                ContainerFull c = content.containers.get(Long.toString(id));
                assert c != null;

                a.assertThat(c.container.id).isEqualTo(id);
                a.assertThat(c.container.name).isEqualTo(cont.getContainerName());
                a.assertThat(c.busId).isEqualTo(busId);
                a.assertThat(c.components).hasSameElementsAs(getIds(cont.getComponents()));
                a.assertThat(c.serviceAssemblies).hasSameElementsAs(getIds(cont.getServiceAssemblies()));
                a.assertThat(c.sharedLibraries).hasSameElementsAs(getIds(cont.getSharedLibraries()));

                ContainersRecord cDb = resource.db().selectFrom(CONTAINERS)
                        .where(CONTAINERS.ID.eq(id).and(CONTAINERS.BUS_ID.eq(busId))).fetchOne();
                assert cDb != null;
                assertEquivalent(a, cDb, cont);
            }
        }

        assertThat(content.containers)
                .hasSameSizeAs(Arrays.stream(buses).flatMap(b -> b.getContainers().stream()).toArray(Container[]::new));
    }

    protected void assertWorkspaceContentForComponents(SoftAssertions a, WorkspaceContent content, Domain... buses) {
        for (Domain bus : buses) {
            for (Container cont : bus.getContainers()) {
                long contId = getId(cont);
                for (Component comp : cont.getComponents()) {
                    long id = getId(comp);
                    ComponentFull c = content.components.get(Long.toString(id));
                    assert c != null;

                    Set<String> slsIds = getIds(comp.getSharedLibraries());

                    a.assertThat(c.component.id).isEqualTo(id);
                    a.assertThat(c.component.name).isEqualTo(comp.getName());
                    a.assertThat(c.containerId).isEqualTo(contId);
                    a.assertThat(c.state.toString()).isEqualTo(comp.getState().toString());
                    a.assertThat(c.sharedLibraries).hasSameElementsAs(slsIds);
                    a.assertThat(c.serviceUnits).hasSameElementsAs(getIds(getComponentSUs(cont, comp)));

                    ComponentsRecord compDb = resource.db().selectFrom(COMPONENTS)
                            .where(COMPONENTS.ID.eq(id).and(COMPONENTS.CONTAINER_ID.eq(contId))).fetchOne();
                    assert compDb != null;
                    assertEquivalent(a, compDb, comp);

                    a.assertThat(resource.db().selectFrom(SHAREDLIBRARIES_COMPONENTS)
                            .where(SHAREDLIBRARIES_COMPONENTS.COMPONENT_ID.eq(id)).fetch().stream()
                            .map(sl -> Long.toString(sl.getSharedlibraryId())).collect(Collectors.toSet()))
                            .hasSameElementsAs(slsIds);

                }
            }
        }

        assertThat(content.components).hasSameSizeAs(
                Arrays.stream(buses).flatMap(b -> b.getContainers().stream().flatMap(c -> c.getComponents().stream()))
                        .toArray(Component[]::new));
    }

    private Stream<ServiceUnit> getComponentSUs(Container cont, Component comp) {
        return getContainerSUs(cont).filter(su -> su.getTargetComponent().equals(comp.getName()));
    }

    protected void assertWorkspaceContentForServiceAssemblies(SoftAssertions a, WorkspaceContent content,
            Domain... buses) {
        for (Domain bus : buses) {
            for (Container cont : bus.getContainers()) {
                long contId = getId(cont);
                for (ServiceAssembly sa : cont.getServiceAssemblies()) {
                    long id = getId(sa);
                    ServiceAssemblyFull s = content.serviceAssemblies.get(Long.toString(id));
                    assert s != null;

                    a.assertThat(s.serviceAssembly.id).isEqualTo(id);
                    a.assertThat(s.serviceAssembly.name).isEqualTo(sa.getName());
                    a.assertThat(s.containerId).isEqualTo(contId);
                    a.assertThat(s.state.toString()).isEqualTo(sa.getState().toString());
                    a.assertThat(s.serviceUnits).hasSameElementsAs(getIds(sa.getServiceUnits()));

                    ServiceassembliesRecord saDb = resource.db().selectFrom(SERVICEASSEMBLIES)
                            .where(SERVICEASSEMBLIES.ID.eq(id).and(SERVICEASSEMBLIES.CONTAINER_ID.eq(contId)))
                            .fetchOne();
                    assert saDb != null;
                    assertEquivalent(a, saDb, sa);
                }
            }
        }

        assertThat(content.serviceAssemblies).hasSameSizeAs(Arrays.stream(buses)
                .flatMap(b -> b.getContainers().stream().flatMap(c -> c.getServiceAssemblies().stream()))
                .toArray(ServiceAssembly[]::new));
    }

    protected void assertWorkspaceContentForServiceUnits(SoftAssertions a, WorkspaceContent content, Domain... buses) {
        for (Domain bus : buses) {
            for (Container cont : bus.getContainers()) {
                long contId = getId(cont);
                for (ServiceAssembly sa : cont.getServiceAssemblies()) {
                    long saId = getId(sa);
                    for (ServiceUnit su : sa.getServiceUnits()) {
                        long id = getId(su);
                        ServiceUnitFull s = content.serviceUnits.get(Long.toString(id));
                        assert s != null;

                        long compId = getId(cont.getComponents().stream()
                                .filter(c -> c.getName().equals(su.getTargetComponent())).findFirst().get());

                        a.assertThat(s.serviceUnit.id).isEqualTo(id);
                        a.assertThat(s.serviceUnit.name).isEqualTo(su.getName());
                        a.assertThat(s.containerId).isEqualTo(contId);
                        a.assertThat(s.componentId).isEqualTo(compId);
                        a.assertThat(s.serviceAssemblyId).isEqualTo(saId);

                        ServiceunitsRecord suDb = resource.db().selectFrom(SERVICEUNITS)
                                .where(SERVICEUNITS.ID.eq(id).and(SERVICEUNITS.COMPONENT_ID.eq(compId))
                                        .and(SERVICEUNITS.CONTAINER_ID.eq(contId))
                                        .and(SERVICEUNITS.SERVICEASSEMBLY_ID.eq(saId)))
                                .fetchOne();
                        assert suDb != null;
                        assertEquivalent(a, suDb, su);
                    }
                }
            }
        }

        assertThat(content.serviceUnits).hasSameSizeAs(Arrays.stream(buses)
                .flatMap(b -> b.getContainers().stream().flatMap(this::getContainerSUs)).toArray(ServiceUnit[]::new));
    }

    private Stream<ServiceUnit> getContainerSUs(Container c) {
        return c.getServiceAssemblies().stream().flatMap(sa -> sa.getServiceUnits().stream());
    }

    protected void assertWorkspaceContentForSharedLibraries(SoftAssertions a, WorkspaceContent content,
            Domain... buses) {
        for (Domain bus : buses) {
            for (Container cont : bus.getContainers()) {
                long contId = getId(cont);
                for (SharedLibrary sl : cont.getSharedLibraries()) {
                    long id = getId(sl);
                    SharedLibraryFull s = content.sharedLibraries.get(Long.toString(id));
                    assert s != null;

                    a.assertThat(s.sharedLibrary.id).isEqualTo(id);
                    a.assertThat(s.sharedLibrary.name).isEqualTo(sl.getName());
                    a.assertThat(s.sharedLibrary.version).isEqualTo(sl.getVersion());
                    a.assertThat(s.containerId).isEqualTo(contId);
                    a.assertThat(s.components).hasSameElementsAs(
                            getIds(cont.getComponents().stream().filter(c -> c.getSharedLibraries().contains(sl))));

                    SharedlibrariesRecord slDb = resource.db().selectFrom(SHAREDLIBRARIES)
                            .where(SHAREDLIBRARIES.ID.eq(id).and(SHAREDLIBRARIES.CONTAINER_ID.eq(contId))).fetchOne();
                    assert slDb != null;
                    assertEquivalent(a, slDb, sl);
                }
            }
        }

        assertThat(content.sharedLibraries).hasSameSizeAs(Arrays.stream(buses)
                .flatMap(b -> b.getContainers().stream().flatMap(c -> c.getSharedLibraries().stream()))
                .toArray(SharedLibrary[]::new));
    }

    protected void assertWorkspaceContentForServices(SoftAssertions a, WorkspaceContent content, long wsId,
            List<Endpoint> expectedEndpoints) {

        for (Endpoint expectedEdp : expectedEndpoints) {
            assertEndpointExistsAndIsReturned(a, content, wsId, expectedEdp);
        }

        content.services.forEach((id, service) -> {
            a.assertThat(Long.valueOf(id).longValue() == service.service.id);
            a.assertThat(serviceIsContained(service, expectedEndpoints));
        });

        content.endpoints.forEach((id, endpoint) -> {
            a.assertThat(Long.valueOf(id).longValue() == endpoint.endpoint.id);
            a.assertThat(endpointIsContained(endpoint, expectedEndpoints));
        });

        content.interfaces.forEach((id, interface_) -> {
            a.assertThat(Long.valueOf(id).longValue() == interface_.interface_.id);
            a.assertThat(interfaceIsContained(interface_, expectedEndpoints));
        });

        assertWorkspaceContentServicesCount(a, content, wsId, expectedEndpoints);
    }

    @SuppressWarnings("null")
    private void assertWorkspaceContentServicesCount(SoftAssertions a, WorkspaceContent content, long wsId,
            List<Endpoint> expectedEndpoints) {
        Set<String> serviceCount = new HashSet<String>();
        Set<String> endpointCount = new HashSet<String>();
        Set<String> interfaceCount = new HashSet<String>();

        expectedEndpoints.stream().forEach(e -> {
            endpointCount.add(e.getEndpointName());
            serviceCount.add(e.getServiceName());
            interfaceCount.addAll(e.getInterfaceNames());
        });

        a.assertThat(content.interfaces.size()).isEqualTo(interfaceCount.size());
        a.assertThat(content.services.size()).isEqualTo(serviceCount.size());
        a.assertThat(content.endpoints.size()).isEqualTo(endpointCount.size());
    }

    public void assertEndpointExistsAndIsReturned(SoftAssertions a, WorkspaceContent content, long wsId, Endpoint expectedEdp) {
        Record[] records = resource.db().select().from(EDP_INSTANCES)
                .join(SERVICES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                .join(ENDPOINTS).onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
                .join(INTERFACES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
                .join(COMPONENTS).onKey(Keys.FK_EDP_INSTANCES_COMPONENT_ID)
                .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                .where(SERVICES.NAME.eq(expectedEdp.getServiceName())
                        .and(ENDPOINTS.NAME.eq(expectedEdp.getEndpointName()))
                        .and(INTERFACES.NAME.in(expectedEdp.getInterfaceNames()))
                        .and(COMPONENTS.NAME.eq(expectedEdp.getComponentName()))
                        .and(CONTAINERS.NAME.eq(expectedEdp.getContainerName()))
                        .and(BUSES.WORKSPACE_ID.eq(wsId)))
                .fetchArray();
        if (records != null && records.length > 0) {
            for (Record record : records) {
                assertEquivalent(a, record, expectedEdp);

                final String servId = record.get(SERVICES.ID).toString();
                a.assertThat(content.services.containsKey(servId));
                assertEquivalent(a, content.services.get(servId), expectedEdp);

                final String edpId = record.get(ENDPOINTS.ID).toString();
                a.assertThat(content.endpoints.containsKey(edpId));
                assertEquivalent(a, content.endpoints.get(edpId), expectedEdp);

                final String itfId = record.get(INTERFACES.ID).toString();
                a.assertThat(content.interfaces.containsKey(itfId));
                assertEquivalent(a, content.interfaces.get(itfId), expectedEdp);

            }
        } else {
            a.fail("Could not find this service in db:\n--> " + expectedEdp.getServiceName() + "\n--> "
                    + expectedEdp.getEndpointName() + "\n--> " + expectedEdp.getContainerName() + " - "
                    + expectedEdp.getComponentName() + "\n--> " + expectedEdp.getInterfaceNames());
        }
    }

    protected boolean serviceIsContained(ServiceFull service, List<Endpoint> expectedEndpoints) {
        Set<String> compsToFind = new HashSet<>(service.components);
        for (Endpoint expectedEdp : expectedEndpoints) {
            if (!expectedEdp.getServiceName().equals(service.service.name))
                continue;

            final ComponentsRecord compDb = resource.db().fetchAny(COMPONENTS,
                    COMPONENTS.ID.in(service.components).and(COMPONENTS.NAME.like(expectedEdp.getComponentName())));
            assert compDb != null;
            final ContainersRecord contDb = resource.db().fetchOne(CONTAINERS,
                    CONTAINERS.ID.like(compDb.getContainerId().toString()));
            assert contDb != null;

            if (expectedEdp.getContainerName().equals(contDb.getName()))
                compsToFind.remove(expectedEdp.getComponentName());
        }
        return compsToFind.size() == 0 ? true : false;
    }

    protected boolean endpointIsContained(EndpointFull endpoint, List<Endpoint> expectedEndpoints) {
        for (Endpoint expectedEdp : expectedEndpoints) {
            if (!expectedEdp.getEndpointName().equals(endpoint.endpoint.name))
                continue;

            final ComponentsRecord compDb = resource.db().fetchAny(COMPONENTS,
                    COMPONENTS.ID.like(endpoint.getComponentId()));
            assert compDb != null;
            final ContainersRecord contDb = resource.db().fetchOne(CONTAINERS,
                    CONTAINERS.ID.like(compDb.getContainerId().toString()));
            assert contDb != null;

            if (expectedEdp.getComponentName().equals(compDb.getName())
                    && expectedEdp.getContainerName().equals(contDb.getName()))
                return true;
        }
        return false;
    }

    private boolean interfaceIsContained(InterfaceFull interface_, List<Endpoint> expectedEndpoints) {
        Set<String> compsToFind = new HashSet<>(interface_.components);
        for (Endpoint expectedEdp : expectedEndpoints) {
            if (!expectedEdp.getServiceName().equals(interface_.interface_.name))
                continue;

            final ComponentsRecord compDb = resource.db().fetchAny(COMPONENTS,
                    COMPONENTS.ID.in(interface_.components)
                            .and(COMPONENTS.NAME.like(expectedEdp.getComponentName())));
            assert compDb != null;
            final ContainersRecord contDb = resource.db().fetchOne(CONTAINERS,
                    CONTAINERS.ID.like(compDb.getContainerId().toString()));
            assert contDb != null;

            if (expectedEdp.getContainerName().equals(contDb.getName()))
                compsToFind.remove(expectedEdp.getComponentName());
        }
        return compsToFind.size() == 0 ? true : false;
    }

    protected void assertEquivalent(SoftAssertions a, ServiceFull service, Endpoint expectedEdp) {
        final Record record = resource.db().select().from(COMPONENTS).join(CONTAINERS).onKey()
                .where(COMPONENTS.ID.in(service.components).and(COMPONENTS.NAME.like(expectedEdp.getComponentName())
                        .and(CONTAINERS.NAME.like(expectedEdp.getContainerName()))))
                .fetchOne();
        a.assertThat(record).isNotNull().withFailMessage(
                "assertEquivalent error for service [{}]:{}, could not find {} or {} in DB", service.service.id,
                service.service.name,
                expectedEdp.getComponentName(), expectedEdp.getContainerName());
        assert record != null;

        a.assertThat(service.components).contains(record.into(COMPONENTS).getId().toString());
        a.assertThat(service.service.name).isEqualTo(expectedEdp.getServiceName());
    }

    protected void assertEquivalent(SoftAssertions a, EndpointFull endpoint, Endpoint expectedEdp) {
        final ComponentsRecord compDb = resource.db().fetchAny(COMPONENTS,
                COMPONENTS.ID.like(endpoint.getComponentId()));
        a.assertThat(compDb).isNotNull();
        final ContainersRecord contDb = resource.db().fetchOne(CONTAINERS,
                CONTAINERS.ID.like(compDb.getContainerId().toString()));
        a.assertThat(contDb).isNotNull();

        a.assertThat(endpoint.endpoint.name).isEqualTo(expectedEdp.getEndpointName());
        a.assertThat(compDb.getName()).isEqualTo(expectedEdp.getComponentName());
        a.assertThat(contDb.getName()).isEqualTo(expectedEdp.getContainerName());
    }

    private void assertEquivalent(SoftAssertions a, InterfaceFull interface_, Endpoint expectedEdp) {
        final Record record = resource.db().select().from(COMPONENTS).join(CONTAINERS).onKey()
                .where(COMPONENTS.ID.in(interface_.components)
                        .and(COMPONENTS.NAME.like(expectedEdp.getComponentName())
                                .and(CONTAINERS.NAME.like(expectedEdp.getContainerName()))))
                .fetchOne();
        a.assertThat(record).isNotNull().withFailMessage(
                "assertEquivalent error for service [{}]:{}, could not find {} or {} in DB", interface_.interface_.id,
                interface_.interface_.name, expectedEdp.getComponentName(), expectedEdp.getContainerName());
        assert record != null;

        a.assertThat(interface_.components).contains(record.into(COMPONENTS).getId().toString());
        a.assertThat(expectedEdp.getInterfaceNames()).contains(interface_.interface_.name);
    }

    private void assertEquivalent(SoftAssertions a, Record recordDb, Endpoint expectedEdp) {
        ServicesRecord servrec = recordDb.into(SERVICES);
        EdpInstancesRecord instrec = recordDb.into(EDP_INSTANCES);
        EndpointsRecord edprec = recordDb.into(ENDPOINTS);
        InterfacesRecord itfrec = recordDb.into(INTERFACES);
        a.assertThat(instrec).isNotNull();
        a.assertThat(servrec).isNotNull();
        a.assertThat(edprec).isNotNull();
        a.assertThat(itfrec).isNotNull();

        final ComponentsRecord compDb = resource.db().fetchOne(COMPONENTS,
                COMPONENTS.ID.like(instrec.getComponentId().toString()));
        final ContainersRecord contDb = resource.db().fetchOne(CONTAINERS,
                CONTAINERS.ID.like(instrec.getContainerId().toString()));
        a.assertThat(compDb).isNotNull();
        a.assertThat(contDb).isNotNull();

        a.assertThat(servrec.getName()).isEqualTo(expectedEdp.getServiceName());
        a.assertThat(edprec.getName()).isEqualTo(expectedEdp.getEndpointName());
        a.assertThat(expectedEdp.getInterfaceNames()).contains(itfrec.getName());
        a.assertThat(compDb.getName()).isEqualTo(expectedEdp.getComponentName());
        a.assertThat(contDb.getName()).isEqualTo(expectedEdp.getContainerName());
    }

    protected void assertWorkspaceContent(SoftAssertions a, WorkspaceContent content, long wsId, Domain... buses) {
        assertWorkspaceContent(a, content, wsId, null, buses);
    }

    protected void assertWorkspaceContent(SoftAssertions a, WorkspaceContent content, long wsId,
            @Nullable List<Endpoint> expectedEndpoints, Domain... buses) {
        assertWorkspaceContentForBuses(a, content, wsId, buses);
        assertWorkspaceContentForContainers(a, content, buses);
        assertWorkspaceContentForComponents(a, content, buses);
        assertWorkspaceContentForServiceAssemblies(a, content, buses);
        assertWorkspaceContentForServiceUnits(a, content, buses);
        assertWorkspaceContentForSharedLibraries(a, content, buses);
        if (expectedEndpoints != null) {
            assertWorkspaceContentForServices(a, content, wsId, new ArrayList<Endpoint>(expectedEndpoints));
        }
    }
}
