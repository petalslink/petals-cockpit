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
package org.ow2.petals.cockpit.server.services;

import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.EDP_INSTANCES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.ENDPOINTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES_COMPONENTS;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.Record;
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
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServicesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServicesResource.ServiceFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent;
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
                            public void addService(ServiceFull suDb) {
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

        public void addService(ServiceFull sDb);
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

    public void busAdded(Domain bus, BusesRecord bDb) {
        // NOP
    }

    public void containerAdded(Container container, ContainersRecord cDb) {
        // NOP
    }

    public void componentAdded(Component component, ComponentsRecord compDb) {
        // NOP
    }

    public void sharedLibraryAdded(SharedLibrary sl, SharedlibrariesRecord slDb) {
        // NOP
    }

    public void serviceAssemblyAdded(ServiceAssembly sa, ServiceassembliesRecord saDb) {
        // NOP
    }

    public void serviceUnitAdded(ServiceUnit su, ServiceunitsRecord suDb) {
        // NOP
    }

    public void serviceAdded(ServicesRecord sDb) {
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

                    for (Record sr : ctx.select().from(SERVICES).join(EDP_INSTANCES).onKey()
                            .where(EDP_INSTANCES.CONTAINER_ID.eq(c.getId())).fetch()) {
                        containerBuilder.addService(
                                new ServiceFull(sr.into(SERVICES), c.getId(), sr.into(EDP_INSTANCES).getComponentId()));
                    }
                }
            } else {
                builder.addBusInProgress(b);
            }
        }
    }

    public synchronized WorkspaceContent storeServicesList(EndpointDirectoryView edpView, long cId,
            Configuration conf) {
        final DSLContext ctx = DSL.using(conf);



        Map<String, Endpoint> edp_to_add = manageExistingEndpoints(edpView, ctx, cId);

        Map<String, ServiceFull> servicesToReturn = insertNewEndpoints(edp_to_add, conf, cId);


        WorkspaceContent res = new WorkspaceContent(ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                ImmutableMap.copyOf(servicesToReturn));

        return res;
    }

    private Map<String, Endpoint> manageExistingEndpoints(EndpointDirectoryView edpView, final DSLContext ctx,
            long cId) {

        Map<String, Endpoint> edp_to_add = edpView.getAllEndpoints().stream()
                .collect(Collectors.toMap(Endpoint::getEndpointName, e -> e));

        HashSet<Long> instance_id_to_delete = new HashSet();
        HashSet<Long> service_id_to_delete = new HashSet();
        HashSet<Long> endpoint_id_to_delete = new HashSet();

        // checking stored endpoints for this container vs lastest info
        ctx.select().from(SERVICES)
                .join(EDP_INSTANCES).onKey(Keys.FK_EDP_INSTANCES_SERVICE_ID).join(ENDPOINTS)
                .onKey(Keys.FK_EDP_INSTANCES_ENDPOINT_ID)
        .where(EDP_INSTANCES.CONTAINER_ID.eq(cId))
        .forEach(record ->
        {
            ServicesRecord servrec = record.into(SERVICES);
            EdpInstancesRecord instrec = record.into(EDP_INSTANCES);
            EndpointsRecord edprec = record.into(ENDPOINTS);
                    assert servrec != null && instrec != null && edprec != null;

            final List<Endpoint> endpoints = edpView.getListOfEndpointsByServiceName().get(servrec.getName());
            if (endpoints != null && endpoints.stream().map(edp -> edp.getEndpointName())
                    .collect(Collectors.toList()).contains(edprec.getName())) {
                // endpoint is already there and should stay
                edp_to_add.remove(edprec.getName());
            }
            else {
                // endpoint should not stay
                instance_id_to_delete.add(instrec.getId());
                service_id_to_delete.add(servrec.getId());
                endpoint_id_to_delete.add(edprec.getId());
            }
        });

        final int deletedInstances = ctx.deleteFrom(EDP_INSTANCES).where(EDP_INSTANCES.ID.in(instance_id_to_delete))
                .execute();
        if (deletedInstances != instance_id_to_delete.size()) {
            LOG.error(
                    "Possible DB issue: {} rows selected to be deleted from EDP_INSTANCES but {} were actually deleted.",
                    instance_id_to_delete.size(), deletedInstances);
        }

        //Elements can still be linked to other endpoints, must not delete these ! 
        service_id_to_delete.removeAll(ctx.fetchValues(EDP_INSTANCES.SERVICE_ID));
        endpoint_id_to_delete.removeAll(ctx.fetchValues(EDP_INSTANCES.ENDPOINT_ID));

        ctx.deleteFrom(SERVICES).where(SERVICES.ID.in(service_id_to_delete)).execute();
        ctx.deleteFrom(ENDPOINTS).where(ENDPOINTS.ID.in(endpoint_id_to_delete)).execute();

        return edp_to_add;
    }

    private Map<String, ServiceFull> insertNewEndpoints(Map<String, Endpoint> edp_to_add, Configuration conf,
            long cId) {
        Map<String, ServiceFull> servicesToReturn = new HashMap<String, ServiceFull>();

        final DSLContext ctx = DSL.using(conf);
        // Now we insert new endpoints using existing service/endpoint names on this container:
        edp_to_add.values().stream().forEach(e -> {
            Record compIdRec = ctx.select(COMPONENTS.ID).from(COMPONENTS).join(CONTAINERS).onKey()
                    .where(COMPONENTS.CONTAINER_ID.eq(cId)).and(COMPONENTS.NAME.eq(e.getComponentName())).fetchOne();
            if (compIdRec == null) {
                LOG.error(
                        "No component named {} on container {} from DB matched to insert endpoint: {} (container: {}). Skipping...",
                        e.getComponentName(), cId, e.getEndpointName(), e.getContainerName());
                return;
            }
            Long componentId = compIdRec.into(COMPONENTS).getId();

            Record sIdRec = ctx.select().from(SERVICES).join(EDP_INSTANCES).onKey()
                    .where(EDP_INSTANCES.CONTAINER_ID.eq(cId)).and(SERVICES.NAME.eq(e.getServiceName())).fetchOne();
            Record eIdRec = ctx.select().from(ENDPOINTS).join(EDP_INSTANCES).onKey()
                    .where(EDP_INSTANCES.CONTAINER_ID.eq(cId)).and(ENDPOINTS.NAME.eq(e.getEndpointName())).fetchOne();
            ServicesRecord sDb = new ServicesRecord(null, e.getServiceName());
            EndpointsRecord eDb = new EndpointsRecord(null, e.getEndpointName());
            if (sIdRec == null) {
                sDb.attach(conf);

                final int sinserted = sDb.insert();
                assert sinserted == 1;
            } else {
                sDb = sIdRec.into(SERVICES);
            }
            serviceAdded(sDb);
            servicesToReturn.put(sDb.getId().toString(), new ServiceFull(sDb, cId, componentId));

            if (eIdRec == null) {
                eDb.attach(conf);
                final int einserted = eDb.insert();
                assert einserted == 1;
            } else {
                eDb = eIdRec.into(ENDPOINTS);
            }

            EdpInstancesRecord eiDb = new EdpInstancesRecord(null, cId, componentId, sDb.getId(), eDb.getId());
            eiDb.attach(conf);
            final int eiinserted = eiDb.insert();
            assert eiinserted == 1;
            // TODO endpointsadded() ?
        });

        return servicesToReturn;
    }

}
