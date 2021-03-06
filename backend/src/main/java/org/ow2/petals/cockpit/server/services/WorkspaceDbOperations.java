/**
 * Copyright (C) 2017-2020 Linagora
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
package org.ow2.petals.cockpit.server.services;

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

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.jooq.Condition;
import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.endpoint.Endpoint;
import org.ow2.petals.admin.endpoint.EndpointDirectoryView;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
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
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.EndpointsResource.EndpointFull;
import org.ow2.petals.cockpit.server.resources.InterfacesResource.InterfaceFull;
import org.ow2.petals.cockpit.server.resources.PermissionsResource.PermissionsMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServicesResource.ServiceFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.SetMultimap;

public class WorkspaceDbOperations {

    private static final Logger LOG = LoggerFactory.getLogger(WorkspaceDbOperations.class);

    public interface WorkspaceDbWitness {
        public static final WorkspaceDbWitness NOP = new WorkspaceDbWitness() {
            @Override
            public void addBusInProgress(BusesRecord bDb) {
                // NOP
            }

            @Override
            public WorkspaceDbBusBuilder addImportedBus(BusesRecord bDb) {
                return new WorkspaceDbBusBuilder() {
                    @Override
                    public WorkspaceDbContainerBuilder addContainer(ContainersRecord cDb) {
                        return new WorkspaceDbContainerBuilder() {
                            @Override
                            public void addComponent(ComponentsRecord compDb) {
                                // NOP
                            }

                            @Override
                            public void addSharedLibrary(SharedlibrariesRecord slDb) {
                                // NOP
                            }

                            @Override
                            public void addSharedLibraryComponent(SharedlibrariesComponentsRecord slCompDb) {
                                // NOP
                            }

                            @Override
                            public void addServiceAssembly(ServiceassembliesRecord saDb) {
                                // NOP
                            }

                            @Override
                            public void addServiceUnit(ServiceunitsRecord suDb) {
                                // NOP
                            }

                            @Override
                            public void addOrMergeService(ServiceFull sDb) {
                                // NOP
                            }

                            @Override
                            public void addEndpoint(EndpointFull eDb) {
                                // NOP
                            }

                            @Override
                            public void addOrMergeInterface(InterfaceFull iDb) {
                                // NOP
                            }
                        };
                    }
                };
            }
        };

        public void addBusInProgress(BusesRecord bDb);

        public WorkspaceDbBusBuilder addImportedBus(BusesRecord bDb);
    }

    public interface WorkspaceDbBusBuilder {
        public WorkspaceDbContainerBuilder addContainer(ContainersRecord cDb);
    }

    public interface WorkspaceDbContainerBuilder {
        public void addComponent(ComponentsRecord compDb);

        public void addSharedLibrary(SharedlibrariesRecord slDb);

        public void addSharedLibraryComponent(SharedlibrariesComponentsRecord slCompDb);

        public void addServiceAssembly(ServiceassembliesRecord saDb);

        public void addServiceUnit(ServiceunitsRecord suDb);

        public void addOrMergeService(ServiceFull sDb);

        public void addEndpoint(EndpointFull eDb);

        public void addOrMergeInterface(InterfaceFull iDb);
    }

    public void saveDomainToDatabase(Configuration conf, BusesRecord bDb, Domain topology, WorkspaceDbWitness witness) {
        bDb.setImported(true);
        bDb.setName(topology.getName());
        bDb.attach(conf);
        bDb.update();

        WorkspaceDbBusBuilder busBuilder = witness.addImportedBus(bDb);
        busAdded(topology, bDb);

        for (Container container : topology.getContainers()) {
            Integer port = container.getPorts().get(PortType.JMX);
            assert port != null;

            ContainersRecord cDb = new ContainersRecord(null, bDb.getId(), container.getContainerName(),
                    container.getHost(), port, container.getJmxUsername(), container.getJmxPassword());
            cDb.attach(conf);
            int cDbi = cDb.insert();
            assert cDbi == 1;
            WorkspaceDbContainerBuilder containerBuilder = busBuilder.addContainer(cDb);
            containerAdded(container, cDb);

            long containerId = cDb.getId();

            SetMultimap<SharedLibrary, Long> componentsBySL = LinkedHashMultimap.create();
            Map<String, Long> components = new HashMap<>();
            for (Component component : container.getComponents()) {
                ComponentMin.State compState = ComponentMin.State.from(component.getState());
                ComponentMin.Type compType = ComponentMin.Type.from(component.getComponentType());
                ComponentsRecord compDb = new ComponentsRecord(null, containerId, component.getName(), compState.name(),
                        compType.name());
                compDb.attach(conf);
                int compDbi = compDb.insert();
                assert compDbi == 1;

                containerBuilder.addComponent(compDb);
                componentAdded(component, compDb);

                components.put(component.getName(), compDb.getId());
                for (SharedLibrary sl : component.getSharedLibraries()) {
                    componentsBySL.put(sl, compDb.getId());
                }
            }

            for (SharedLibrary sl : container.getSharedLibraries()) {
                SharedlibrariesRecord slDb = new SharedlibrariesRecord(null, sl.getName(), sl.getVersion(),
                        containerId);
                slDb.attach(conf);
                int slDbi = slDb.insert();
                assert slDbi == 1;
                containerBuilder.addSharedLibrary(slDb);
                sharedLibraryAdded(sl, slDb);

                for (Long componentId : componentsBySL.get(sl)) {
                    assert componentId != null;
                    SharedlibrariesComponentsRecord slCompDb = new SharedlibrariesComponentsRecord(slDb.getId(),
                            componentId);
                    slCompDb.attach(conf);
                    int slCompDbi = slCompDb.insert();
                    assert slCompDbi == 1;
                    containerBuilder.addSharedLibraryComponent(slCompDb);
                }
            }

            for (ServiceAssembly sa : container.getServiceAssemblies()) {
                ServiceAssemblyMin.State state = ServiceAssemblyMin.State.from(sa.getState());
                ServiceassembliesRecord saDb = new ServiceassembliesRecord(null, containerId, sa.getName(),
                        state.name());
                saDb.attach(conf);
                int saDbi = saDb.insert();
                assert saDbi == 1;
                containerBuilder.addServiceAssembly(saDb);
                serviceAssemblyAdded(sa, saDb);

                for (ServiceUnit su : sa.getServiceUnits()) {
                    Long componentId = components.get(su.getTargetComponent());
                    assert componentId != null;
                    ServiceunitsRecord suDb = new ServiceunitsRecord(null, componentId, su.getName(), saDb.getId(),
                            containerId);
                    suDb.attach(conf);
                    int suDbi = suDb.insert();
                    assert suDbi == 1;
                    containerBuilder.addServiceUnit(suDb);
                    serviceUnitAdded(su, suDb);
                }

            }

        }
    }

    @SuppressWarnings("unused")
    public void busAdded(Domain bus, BusesRecord bDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void containerAdded(Container container, ContainersRecord cDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void componentAdded(Component component, ComponentsRecord compDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void sharedLibraryAdded(SharedLibrary sl, SharedlibrariesRecord slDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void serviceAssemblyAdded(ServiceAssembly sa, ServiceassembliesRecord saDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void serviceUnitAdded(ServiceUnit su, ServiceunitsRecord suDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void serviceAdded(ServicesRecord sDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void endpointAdded(EndpointsRecord sDb) {
        // NOP
    }

    @SuppressWarnings("unused")
    public void interfaceAdded(InterfacesRecord sDb) {
        // NOP
    }
    public void fetchWorkspaceFromDatabase(Configuration conf, WorkspacesRecord w, WorkspaceDbWitness builder) {
        DSLContext ctx = DSL.using(conf);
        for (BusesRecord b : ctx.selectFrom(BUSES).where(BUSES.WORKSPACE_ID.eq(w.getId())).fetchInto(BUSES)) {
            if (b.getImported()) {
                WorkspaceDbBusBuilder busBuilder = builder.addImportedBus(b);
                for (ContainersRecord c : ctx.selectFrom(CONTAINERS).where(CONTAINERS.BUS_ID.eq(b.getId()))) {
                    WorkspaceDbContainerBuilder containerBuilder = busBuilder.addContainer(c);

                    for (ServiceunitsRecord su : ctx.selectFrom(SERVICEUNITS)
                            .where(SERVICEUNITS.CONTAINER_ID.eq(c.getId()))) {
                        containerBuilder.addServiceUnit(su);
                    }

                    for (ComponentsRecord comp : ctx.selectFrom(COMPONENTS)
                            .where(COMPONENTS.CONTAINER_ID.eq(c.getId()))) {
                        containerBuilder.addComponent(comp);

                        for (SharedlibrariesComponentsRecord slc : ctx.selectFrom(SHAREDLIBRARIES_COMPONENTS)
                                .where(SHAREDLIBRARIES_COMPONENTS.COMPONENT_ID.eq(comp.getId()))) {
                            containerBuilder.addSharedLibraryComponent(slc);
                        }
                    }

                    for (ServiceassembliesRecord sa : ctx.selectFrom(SERVICEASSEMBLIES)
                            .where(SERVICEASSEMBLIES.CONTAINER_ID.eq(c.getId()))) {
                        containerBuilder.addServiceAssembly(sa);
                    }

                    for (SharedlibrariesRecord sl : ctx.selectFrom(SHAREDLIBRARIES)
                            .where(SHAREDLIBRARIES.CONTAINER_ID.eq(c.getId()))) {
                        containerBuilder.addSharedLibrary(sl);
                    }

                    for (Record sr : ctx.select().from(SERVICES)
                            .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                            .join(COMPONENTS).onKey(Keys.FK_EDP_INSTANCES_COMPONENT_ID)
                            .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                            .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                            .where(EDP_INSTANCES.CONTAINER_ID.eq(c.getId()).and(BUSES.WORKSPACE_ID.eq(w.getId())))
                            .fetch()) {
                        containerBuilder.addOrMergeService(
                                new ServiceFull(sr.into(SERVICES), sr.into(EDP_INSTANCES).getComponentId().toString()));
                    }

                    final Condition requestCondition = EDP_INSTANCES.CONTAINER_ID.eq(c.getId()).and(BUSES.WORKSPACE_ID.eq(w.getId()));
                    Map<String, EndpointFull> endpointMap = getEndpointsFromDb(requestCondition, ctx);

                    endpointMap.values().forEach(edp -> containerBuilder.addEndpoint(edp));

                    for (Record ir : ctx.select().from(INTERFACES)
                            .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
                            .join(COMPONENTS).onKey(Keys.FK_EDP_INSTANCES_COMPONENT_ID)
                            .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                            .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                            .where(EDP_INSTANCES.CONTAINER_ID.eq(c.getId()).and(BUSES.WORKSPACE_ID.eq(w.getId())))
                            .fetch()) {
                        containerBuilder.addOrMergeInterface(new InterfaceFull(ir.into(INTERFACES),
                                ir.into(EDP_INSTANCES).getComponentId().toString()));
                    }
                }
            } else {
                builder.addBusInProgress(b);
            }
        }
    }

    public void deleteWorkspace(long WorkspaceId, Configuration conf) {
        final DSLContext ctx = DSL.using(conf);

        // First delete endpoints from this workspace
        @SuppressWarnings("null")
        final SelectConditionStep<Record> selectedEndpoints = ctx.select().from(SERVICES)
                .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                .join(ENDPOINTS).onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
                .join(INTERFACES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
                .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                .where(BUSES.WORKSPACE_ID.eq(WorkspaceId));

        manageExistingEndpoints(null, selectedEndpoints, ctx);

        // remove from db (it will propagate to every other contained elements!)
        ctx.deleteFrom(WORKSPACES).where(WORKSPACES.ID.eq(WorkspaceId)).execute();
    }

    public void deleteBus(long busId, long WorkspaceId, Configuration conf) {
        DSL.using(conf).transaction(config -> {
            final DSLContext ctx = DSL.using(conf);

            // First delete endpoints on this bus
            @SuppressWarnings("null")
            final SelectConditionStep<Record> selectedEndpoints = ctx.select().from(SERVICES)
                    .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                    .join(ENDPOINTS).onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
                    .join(INTERFACES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
                    .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                    .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                    .where(CONTAINERS.BUS_ID.eq(busId).and(BUSES.WORKSPACE_ID.eq(WorkspaceId)));

            manageExistingEndpoints(null, selectedEndpoints, ctx);

            int deleted = DSL.using(config).deleteFrom(BUSES)
                    .where(BUSES.ID.eq(busId).and(BUSES.WORKSPACE_ID.eq(WorkspaceId)))
                    .execute();

            if (deleted < 1) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }
        });
    }

    public void deleteComponent(long compId, Configuration conf) {
        final DSLContext ctx = DSL.using(conf);

        // First delete endpoints on this component
        @SuppressWarnings("null")
        final SelectConditionStep<Record> selectedEndpoints = ctx.select().from(SERVICES)
                .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                .join(ENDPOINTS).onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
                .join(INTERFACES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
                .where(EDP_INSTANCES.COMPONENT_ID.eq(compId));

        manageExistingEndpoints(null, selectedEndpoints, ctx);

        DSL.using(conf).deleteFrom(COMPONENTS).where(COMPONENTS.ID.eq(compId)).execute();
    }

    public void storeServicesList(EndpointDirectoryView edpView, long cId,
            Configuration conf) {
        final DSLContext ctx = DSL.using(conf);

        @SuppressWarnings("null")
        final SelectConditionStep<Record> selectedEndpoints = ctx.select().from(SERVICES)
                .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                .join(ENDPOINTS).onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
                .join(INTERFACES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
                .join(COMPONENTS).onKey(Keys.FK_EDP_INSTANCES_COMPONENT_ID)
                .where(EDP_INSTANCES.CONTAINER_ID.eq(cId));

        Map<String, Endpoint> edpToAdd = manageExistingEndpoints(edpView, selectedEndpoints, ctx);

        if (edpToAdd.size() > 0) {
            insertNewEndpoints(edpToAdd, conf, cId);
        }
    }

    private Map<String, Endpoint> manageExistingEndpoints(@Nullable EndpointDirectoryView edpViewToKeep,
            @Nullable SelectConditionStep<Record> selectedExistingEndpoints, final DSLContext ctx) {

        Map<String, Endpoint> edpToAdd = new HashMap<String, Endpoint>();
        if (edpViewToKeep != null) {
            for (Endpoint e : edpViewToKeep.getAllEndpoints()) {
                edpToAdd.put(e.getEndpointName(), e);
            }
        }

        if (selectedExistingEndpoints == null) {
            return edpToAdd;
        }

        HashSet<Long> instanceIdToDelete = new HashSet<>();
        HashSet<Long> serviceIdToDelete = new HashSet<>();
        HashSet<Long> endpointIdToDelete = new HashSet<>();
        HashSet<Long> interfacesIdToDelete = new HashSet<>();

        // checking selected existing endpoints against given candidates endpoints
        selectedExistingEndpoints.forEach(record ->
        {
            ServicesRecord servrec = record.into(SERVICES);
            EndpointsRecord edprec = record.into(ENDPOINTS);
            InterfacesRecord itfrec = record.into(INTERFACES);
            EdpInstancesRecord instrec = record.into(EDP_INSTANCES);
            assert servrec != null && instrec != null && edprec != null && itfrec != null;

            String compName = ctx.selectFrom(COMPONENTS).where(COMPONENTS.ID.eq(instrec.getComponentId()))
                    .fetchOne(COMPONENTS.NAME);
            String contName = ctx.selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(instrec.getContainerId()))
                    .fetchOne(CONTAINERS.NAME);
            assert contName != null && !contName.isEmpty() && compName != null && !compName.isEmpty();

            final List<Endpoint> serviceEndpoints = (edpViewToKeep != null)
                    ? edpViewToKeep.getListOfEndpointsByServiceName().get(servrec.getName())
                    : null;

            if (serviceEndpoints != null && serviceEndpoints.stream()
                    .filter(edp -> edp.getComponentName().equals(compName) && edp.getContainerName().equals(contName)
                            && edp.getInterfaceNames().contains(itfrec.getName()))
                    .map(edp -> edp.getEndpointName())
                    .collect(Collectors.toList()).contains(edprec.getName())) {
                // endpoint is already there and should stay
                edpToAdd.remove(edprec.getName());
            }
            else {
                // endpoint should not stay
                instanceIdToDelete.add(instrec.getId());
                serviceIdToDelete.add(servrec.getId());
                endpointIdToDelete.add(edprec.getId());
                interfacesIdToDelete.add(itfrec.getId());
            }
        });

        final int deletedInstances = ctx.deleteFrom(EDP_INSTANCES).where(EDP_INSTANCES.ID.in(instanceIdToDelete))
                .execute();
        if (deletedInstances != instanceIdToDelete.size()) {
            LOG.error(
                    "Possible DB issue: {} rows selected to be deleted from EDP_INSTANCES but {} were actually deleted.",
                    instanceIdToDelete.size(), deletedInstances);
        }

        //Elements can still be linked to other endpoints, must not delete these !
        serviceIdToDelete.removeAll(ctx.fetchValues(EDP_INSTANCES.SERVICE_ID));
        endpointIdToDelete.removeAll(ctx.fetchValues(EDP_INSTANCES.ENDPOINT_ID));
        interfacesIdToDelete.removeAll(ctx.fetchValues(EDP_INSTANCES.INTERFACE_ID));

        ctx.deleteFrom(SERVICES).where(SERVICES.ID.in(serviceIdToDelete)).execute();
        ctx.deleteFrom(ENDPOINTS).where(ENDPOINTS.ID.in(endpointIdToDelete)).execute();
        ctx.deleteFrom(INTERFACES).where(INTERFACES.ID.in(interfacesIdToDelete)).execute();

        return edpToAdd;
    }

    private void insertNewEndpoints(Map<String, Endpoint> edpToAdd, Configuration conf,
            long cId) {

        final DSLContext ctx = DSL.using(conf);
        Long busId = ctx.select().from(BUSES).join(CONTAINERS).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                .where(CONTAINERS.ID.eq(cId)).fetchOne(BUSES.ID);
        assert busId != null;

        // Now we insert new endpoints using (when possible) existing service/endpoint/interfaces
        for (Endpoint e : edpToAdd.values()) {
            Record compIdRec = ctx.select(COMPONENTS.ID).from(COMPONENTS).where(COMPONENTS.CONTAINER_ID.eq(cId))
                    .and(COMPONENTS.NAME.eq(e.getComponentName())).fetchOne();
            if (compIdRec == null) {
                LOG.error(
                        "Skipping endpoint insert: \"{}\": Found no DB container/component \"{}\"/\"{}\" on container# \"{}\".",
                        e.getEndpointName(), e.getContainerName(), e.getComponentName(), cId);
                return;
            }
            Long componentId = compIdRec.into(COMPONENTS).getId();

            Record sIdRec = ctx.select().from(SERVICES)
                    .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                    .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                    .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                    .where(BUSES.ID.eq(busId)).and(SERVICES.NAME.eq(e.getServiceName())).fetchAny();

            Record eIdRec = ctx.select().from(ENDPOINTS)
                    .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
                    .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                    .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                    .where(BUSES.ID.eq(busId)).and(ENDPOINTS.NAME.eq(e.getEndpointName()))
                    .fetchAny();

            ServicesRecord sDb = new ServicesRecord(null, e.getServiceName());
            EndpointsRecord eDb = new EndpointsRecord(null, e.getEndpointName());

            if (sIdRec == null) {
                sDb.attach(conf);
                final int sinserted = sDb.insert();
                assert sinserted == 1;
            } else {
                sDb = sIdRec.into(SERVICES);
            }
            assert sDb != null;
            serviceAdded(sDb);

            if (eIdRec == null) {
                eDb.attach(conf);
                final int einserted = eDb.insert();
                assert einserted == 1;
            } else {
                eDb = eIdRec.into(ENDPOINTS);
            }
            assert eDb != null;
            endpointAdded(eDb);

            for (String interfaceName : e.getInterfaceNames()) {
                Record iIdRec = ctx.select().from(INTERFACES)
                        .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
                        .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                        .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                        .where(BUSES.ID.eq(busId)).and(INTERFACES.NAME.eq(interfaceName))
                        .fetchAny();

                InterfacesRecord iDb = new InterfacesRecord(null, interfaceName);
                if (iIdRec == null) {
                    iDb.attach(conf);
                    final int iinserted = iDb.insert();
                    assert iinserted == 1;
                } else {
                    iDb = iIdRec.into(INTERFACES);
                }
                assert iDb != null;
                interfaceAdded(iDb);

                EdpInstancesRecord eiDb = new EdpInstancesRecord(null, cId, componentId, sDb.getId(), eDb.getId(),
                        iDb.getId());
                eiDb.attach(conf);
                final int eiinserted = eiDb.insert();
                assert eiinserted == 1;
            }
        }
    }

    public ImmutableMap<String, ServiceFull> getWorkspaceServices(Long workspaceId, Configuration conf) {
        final DSLContext ctx = DSL.using(conf);
        Map<String, ServiceFull> servicesToReturn = new HashMap<String, ServiceFull>();

        ctx.select().from(SERVICES)
                .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID)
                .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                .where(BUSES.WORKSPACE_ID.eq(workspaceId))
                .forEach(record -> {
                    ServicesRecord servrec = record.into(SERVICES);
                    EdpInstancesRecord instrec = record.into(EDP_INSTANCES);

                    assert servrec != null && instrec != null;
                    final String serviceid = servrec.getId().toString();
                    assert serviceid != null;

                    if (servicesToReturn.containsKey(serviceid)) {
                        final ServiceFull serviceFull = servicesToReturn.get(serviceid);
                        assert serviceFull != null;
                        serviceFull.addComponent(instrec.getComponentId());
                    } else {
                        servicesToReturn.put(serviceid, new ServiceFull(servrec, instrec.getComponentId().toString()));
                    }
                });

        return ImmutableMap.copyOf(servicesToReturn);
    }

    public ImmutableMap<String, EndpointFull> getWorkspaceEndpoints(Long workspaceId, Configuration conf) {
        final DSLContext ctx = DSL.using(conf);
        final Condition requestCondition = BUSES.WORKSPACE_ID.eq(workspaceId);

        return ImmutableMap.copyOf(getEndpointsFromDb(requestCondition, ctx));
    }

    private Map<String, EndpointFull> getEndpointsFromDb(Condition requestCondition, DSLContext ctx) {
        List<Record> endpointsRecord = ctx.select().from(ENDPOINTS)
                .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
                .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
                .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
                .where(requestCondition)
                .fetch();

        Map<String, EndpointFull> endpointsToReturn = new HashMap<String, EndpointFull>();
        Set<Long> filteredEdps = new HashSet<>();

        endpointsRecord.stream()
            .filter(edp -> filteredEdps.add(edp.get(ENDPOINTS.ID)))
            .forEach(record -> {
                EndpointsRecord edprec = record.into(ENDPOINTS);
                EdpInstancesRecord instrec = record.into(EDP_INSTANCES);

                assert edprec != null && instrec != null;
                final Long endpointId = edprec.getId();
                assert endpointId != null;

                Set<Long> endpointInterfaces = endpointsRecord.stream()
                        .filter(edp -> edp.into(EDP_INSTANCES).getEndpointId().equals(endpointId))
                        .map(edp -> edp.into(EDP_INSTANCES).getInterfaceId())
                        .collect(Collectors.toSet());

                endpointsToReturn.put(endpointId.toString(),
                        new EndpointFull(edprec, endpointInterfaces, instrec.getServiceId(), instrec.getComponentId()));
            });

        return endpointsToReturn;
    }

    public ImmutableMap<String, InterfaceFull> getWorkspaceInterfaces(Long workspaceId, Configuration conf) {
        final DSLContext ctx = DSL.using(conf);
        Map<String, InterfaceFull> interfacesToReturn = new HashMap<String, InterfaceFull>();

        ctx.select().from(INTERFACES)
            .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_INTERFACE_ID)
            .join(CONTAINERS).onKey(Keys.FK_EDP_INSTANCES_CONTAINER_ID)
            .join(BUSES).onKey(Keys.FK_CONTAINERS_BUSES_ID)
            .where(BUSES.WORKSPACE_ID.eq(workspaceId)).forEach(record -> {
                InterfacesRecord itfrec = record.into(INTERFACES);
                EdpInstancesRecord instrec = record.into(EDP_INSTANCES);

                assert itfrec != null && instrec != null;
                final String interfaceid = itfrec.getId().toString();
                assert interfaceid != null;

                if (interfacesToReturn.containsKey(interfaceid)) {
                    final InterfaceFull interfaceFull = interfacesToReturn.get(interfaceid);
                    assert interfaceFull != null;
                    interfaceFull.addComponent(instrec.getComponentId());
                } else {
                    interfacesToReturn.put(interfaceid, new InterfaceFull(itfrec, instrec.getComponentId().toString()));
                }
            });

        return ImmutableMap.copyOf(interfacesToReturn);
    }

    public List<WorkspaceResource.WorkspaceUser> getWorkspaceUsers(Configuration conf, long workspaceId) {
        List<WorkspaceResource.WorkspaceUser> result =  DSL.using(conf)
                .select(USERS.USERNAME, USERS.NAME, USERS.ADMIN,
                        USERS_WORKSPACES.ADMIN_WORKSPACE_PERMISSION,
                        USERS_WORKSPACES.DEPLOY_ARTIFACT_PERMISSION,
                        USERS_WORKSPACES.LIFECYCLE_ARTIFACT_PERMISSION)
                .from(USERS).join(USERS_WORKSPACES).on(USERS.USERNAME.eq(USERS_WORKSPACES.USERNAME))
                .where(USERS_WORKSPACES.WORKSPACE_ID.eq(workspaceId))
                .orderBy(USERS_WORKSPACES.USERNAME)
                .fetch(record -> new WorkspaceResource.WorkspaceUser(
                        record.get(USERS.USERNAME),
                        record.get(USERS.NAME),
                        new PermissionsMin(record.get(USERS_WORKSPACES.ADMIN_WORKSPACE_PERMISSION),
                        record.get(USERS_WORKSPACES.DEPLOY_ARTIFACT_PERMISSION),
                        record.get(USERS_WORKSPACES.LIFECYCLE_ARTIFACT_PERMISSION))));
        assert result != null;
        return result;
    }

    public ServiceunitsRecord insertSuOnDuplicateIgnore(long cId, Configuration conf, ServiceassembliesRecord saDb,
            ServiceUnit su) {
        long targetComponentId = DSL.using(conf)
                .select().from(COMPONENTS)
                .where(COMPONENTS.NAME.eq(su.getTargetComponent())
                .and(COMPONENTS.CONTAINER_ID.eq(cId)))
                .fetchOne(COMPONENTS.ID);

        ServiceunitsRecord suDb =  DSL.using(conf).selectFrom(SERVICEUNITS)
                .where(SERVICEUNITS.CONTAINER_ID.eq(targetComponentId))
                .and(SERVICEUNITS.NAME.eq(su.getName()))
                .and(SERVICEUNITS.SERVICEASSEMBLY_ID.eq(saDb.getId()))
                .and(SERVICEUNITS.CONTAINER_ID.eq(cId)).fetchOne();

        if (suDb == null) {
            suDb = new ServiceunitsRecord(null, targetComponentId, su.getName(), saDb.getId(), cId);
            suDb.attach(conf);
            suDb.insert();
        }
        return suDb;
    }

    public ServiceassembliesRecord insertSAOnDuplicateUpdate(ServiceAssembly deployedSA, long cId, Configuration conf,
            ServiceAssemblyMin.State state) {
        ServiceassembliesRecord saDb = DSL.using(conf).selectFrom(SERVICEASSEMBLIES)
                .where(SERVICEASSEMBLIES.CONTAINER_ID.eq(cId))
                .and(SERVICEASSEMBLIES.NAME.eq(deployedSA.getName())).fetchOne();

        if (saDb == null) {
            saDb = new ServiceassembliesRecord(null, cId, deployedSA.getName(), state.name());
            saDb.attach(conf);
            saDb.insert();
            this.serviceAssemblyAdded(deployedSA, saDb);

        } else if (state.name().compareTo(saDb.getState()) != 0) {
            saDb.setState(state.name());
            DSL.using(conf).update(SERVICEASSEMBLIES)
                .set(SERVICEASSEMBLIES.STATE, state.name())
                .where(SERVICEASSEMBLIES.ID.eq(saDb.getId())).execute();
        }
        return saDb;
    }

}
