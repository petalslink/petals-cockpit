/**
 * Copyright (C) 2016-2018 Linagora
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.validation.Valid;

import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerFull;
import org.ow2.petals.cockpit.server.resources.EndpointsResource.EndpointFull;
import org.ow2.petals.cockpit.server.resources.InterfacesResource.InterfaceFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.ServicesResource.ServiceFull;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations.WorkspaceDbBusBuilder;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations.WorkspaceDbContainerBuilder;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations.WorkspaceDbWitness;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.SetMultimap;

/**
 * TODO can I avoid transforming ids to string just for json output... maybe with a json mapper or whatever...
 *
 */
public class WorkspaceContent implements WorkspaceEvent.Data {

    @Valid
    @JsonProperty
    public final ImmutableMap<String, BusInProgress> busesInProgress;

    @Valid
    @JsonProperty
    public final ImmutableMap<String, BusFull> buses;

    @Valid
    @JsonProperty
    public final ImmutableMap<String, ContainerFull> containers;

    @Valid
    @JsonProperty
    public final ImmutableMap<String, ComponentFull> components;

    @Valid
    @JsonProperty
    public final ImmutableMap<String, ServiceAssemblyFull> serviceAssemblies;

    @Valid
    @JsonProperty
    public final ImmutableMap<String, ServiceUnitFull> serviceUnits;

    @Valid
    @JsonProperty
    public final ImmutableMap<String, SharedLibraryFull> sharedLibraries;

    // TODO: refactor to reintroduce final to the list ?
    @Valid
    @JsonProperty
    public ImmutableMap<String, ServiceFull> services;

    @Valid
    @JsonProperty
    public ImmutableMap<String, EndpointFull> endpoints;

    @Valid
    @JsonProperty
    public ImmutableMap<String, InterfaceFull> interfaces;

    @JsonCreator
    public WorkspaceContent(@JsonProperty("busesInProgress") Map<String, BusInProgress> busesInProgress,
            @JsonProperty("buses") Map<String, BusFull> buses,
            @JsonProperty("containers") Map<String, ContainerFull> containers,
            @JsonProperty("components") Map<String, ComponentFull> components,
            @JsonProperty("serviceAssemblies") Map<String, ServiceAssemblyFull> serviceAssemblies,
            @JsonProperty("serviceUnits") Map<String, ServiceUnitFull> serviceUnits,
            @JsonProperty("sharedLibraries") Map<String, SharedLibraryFull> sharedLibraries,
            @JsonProperty("services") Map<String, ServiceFull> services,
            @JsonProperty("endpoints") Map<String, EndpointFull> endpoints,
            @JsonProperty("interfaces") Map<String, InterfaceFull> interfaces) {
        this.busesInProgress = ImmutableMap.copyOf(busesInProgress);
        this.buses = ImmutableMap.copyOf(buses);
        this.containers = ImmutableMap.copyOf(containers);
        this.components = ImmutableMap.copyOf(components);
        this.serviceAssemblies = ImmutableMap.copyOf(serviceAssemblies);
        this.serviceUnits = ImmutableMap.copyOf(serviceUnits);
        this.sharedLibraries = ImmutableMap.copyOf(sharedLibraries);
        this.services = ImmutableMap.copyOf(services);
        this.endpoints = ImmutableMap.copyOf(endpoints);
        this.interfaces = ImmutableMap.copyOf(interfaces);
    }

    public static WorkspaceContentBuilder builder() {
        return new WorkspaceContentBuilder();
    }

    public static class WorkspaceContentBuilder implements WorkspaceDbWitness {

        private final Map<String, BusInProgress> busesInProgress = new HashMap<>();

        private final List<WorkspaceContentBusBuilderImpl> buses = new ArrayList<>();

        @Override
        public void addBusInProgress(BusesRecord bDb) {
            BusInProgress bip = new BusInProgress(bDb);
            busesInProgress.put(bip.getId(), bip);
        }

        @Override
        public WorkspaceDbBusBuilder addImportedBus(BusesRecord bDb) {
            WorkspaceContentBusBuilderImpl builder = new WorkspaceContentBusBuilderImpl(bDb);
            buses.add(builder);
            return builder;
        }

        public WorkspaceContent build() {
            Map<String, BusFull> importedBuses = new HashMap<>();
            Map<String, ContainerFull> cs = new HashMap<>();
            Map<String, ComponentFull> comps = new HashMap<>();
            Map<String, ServiceAssemblyFull> sas = new HashMap<>();
            Map<String, ServiceUnitFull> sus = new HashMap<>();
            Map<String, SharedLibraryFull> sls = new HashMap<>();
            Map<String, ServiceFull> servs = new HashMap<>();
            Map<String, EndpointFull> edps = new HashMap<>();
            Map<String, InterfaceFull> itfs = new HashMap<>();

            buses.stream().forEach(b -> {
                BusFull bus = b.build(cs, comps, sas, sus, sls, servs, edps, itfs);
                importedBuses.put(bus.bus.getId(), bus);
            });

            return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sas, sus, sls, servs, edps, itfs);
        }
    }

    private static class WorkspaceContentBusBuilderImpl implements WorkspaceDbBusBuilder {

        private final List<WorkspaceContentContainerBuilderImpl> containers = new ArrayList<>();

        private final BusesRecord bDb;

        private WorkspaceContentBusBuilderImpl(BusesRecord bDb) {
            this.bDb = bDb;
        }

        @Override
        public WorkspaceDbContainerBuilder addContainer(ContainersRecord cDb) {
            WorkspaceContentContainerBuilderImpl builder = new WorkspaceContentContainerBuilderImpl(cDb);
            containers.add(builder);
            return builder;
        }

        private BusFull build(Map<String, ContainerFull> cs, Map<String, ComponentFull> comps,
                Map<String, ServiceAssemblyFull> sas, Map<String, ServiceUnitFull> sus,
                Map<String, SharedLibraryFull> sls, Map<String, ServiceFull> servs, Map<String, EndpointFull> edps,
                Map<String, InterfaceFull> itfs) {

            Set<String> containersIds = new HashSet<>();
            containers.stream().forEach(b -> {
                ContainerFull container = b.build(comps, sas, sus, sls, servs, edps, itfs);
                String containerId = container.container.getId();
                cs.put(containerId, container);
                containersIds.add(containerId);
            });
            return new BusFull(bDb, containersIds);
        }
    }

    private static class WorkspaceContentContainerBuilderImpl implements WorkspaceDbContainerBuilder {

        private final ContainersRecord cDb;

        private final List<ComponentsRecord> componentsToBuild = new ArrayList<>();

        private final List<SharedlibrariesRecord> slsToBuild = new ArrayList<>();

        private final List<ServiceassembliesRecord> sasToBuild = new ArrayList<>();

        private final List<ServiceunitsRecord> susToBuild = new ArrayList<>();

        private final Map<Long, ServiceFull> servsToBuild = new HashMap<>();

        private final List<EndpointFull> edpsToBuild = new ArrayList<>();

        private final Map<Long, InterfaceFull> itfsToBuild = new HashMap<>();

        private final SetMultimap<Long, String> componentsBySL = LinkedHashMultimap.create();

        private final SetMultimap<Long, String> slsByComponent = LinkedHashMultimap.create();

        private final SetMultimap<Long, String> serviceUnitsByComp = LinkedHashMultimap.create();

        private final SetMultimap<Long, String> serviceUnitsBySA = LinkedHashMultimap.create();


        private WorkspaceContentContainerBuilderImpl(ContainersRecord cDb) {
            this.cDb = cDb;
        }

        @Override
        public void addComponent(ComponentsRecord compDb) {
            componentsToBuild.add(compDb);
        }

        @Override
        public void addSharedLibrary(SharedlibrariesRecord slDb) {
            slsToBuild.add(slDb);
        }

        @Override
        public void addSharedLibraryComponent(SharedlibrariesComponentsRecord slCompDb) {
            slsByComponent.put(slCompDb.getComponentId(), Long.toString(slCompDb.getSharedlibraryId()));
            componentsBySL.put(slCompDb.getSharedlibraryId(), Long.toString(slCompDb.getComponentId()));
        }

        @Override
        public void addServiceAssembly(ServiceassembliesRecord saDb) {
            sasToBuild.add(saDb);
        }

        @Override
        public void addServiceUnit(ServiceunitsRecord suDb) {
            String suId = Long.toString(suDb.getId());
            serviceUnitsBySA.put(suDb.getServiceassemblyId(), suId);
            serviceUnitsByComp.put(suDb.getComponentId(), suId);
            susToBuild.add(suDb);
        }

        @Override
        public void addOrMergeService(ServiceFull sDb) {
            if (!servsToBuild.containsKey(sDb.service.id)) {
                servsToBuild.put(sDb.service.id, sDb);
            } else {
                final ServiceFull serviceFull = servsToBuild.get(sDb.service.id);
                assert serviceFull != null;
                serviceFull.addComponents(sDb.componentIds);
            }
        }

        @Override
        public void addEndpoint(EndpointFull eDb) {
            if (!edpsToBuild.contains(eDb)) {
                edpsToBuild.add(eDb);
            }
        }

        @Override
        public void addOrMergeInterface(InterfaceFull iDb) {
            if (!itfsToBuild.containsKey(iDb.interface_.id)) {
                itfsToBuild.put(iDb.interface_.id, iDb);
            } else {
                final InterfaceFull interfaceFull = itfsToBuild.get(iDb.interface_.id);
                assert interfaceFull != null;
                interfaceFull.addComponents(iDb.componentIds);
            }
        }

        private ContainerFull build(Map<String, ComponentFull> comps, Map<String, ServiceAssemblyFull> sas,
                Map<String, ServiceUnitFull> sus, Map<String, SharedLibraryFull> sls,
                Map<String, ServiceFull> servs, Map<String, EndpointFull> edps, Map<String, InterfaceFull> itfs) {
            Set<String> components = new HashSet<>();
            Set<String> serviceAssemblies = new HashSet<>();
            Set<String> sharedLibraries = new HashSet<>();
            Set<String> services = new HashSet<>();
            Set<String> endpoints = new HashSet<>();
            Set<String> interfaces = new HashSet<>();

            componentsToBuild.stream()
                    .map(c -> new ComponentFull(c, serviceUnitsByComp.get(c.getId()), slsByComponent.get(c.getId())))
                    .forEach(c -> {
                        String id = c.component.getId();
                        comps.put(id, c);
                        components.add(id);
                    });

            slsToBuild.stream().map(sl -> new SharedLibraryFull(sl, componentsBySL.get(sl.getId()))).forEach(sl -> {
                String id = sl.sharedLibrary.getId();
                sls.put(id, sl);
                sharedLibraries.add(id);
            });

            sasToBuild.stream().map(sa -> new ServiceAssemblyFull(sa, serviceUnitsBySA.get(sa.getId()))).forEach(sa -> {
                String id = sa.serviceAssembly.getId();
                sas.put(id, sa);
                serviceAssemblies.add(id);
            });

            susToBuild.stream().map(ServiceUnitFull::new).forEach(su -> sus.put(su.serviceUnit.getId(), su));

            for (ServiceFull serv : servsToBuild.values()) {
                String id = serv.service.getId();
                servs.put(id, serv);
                services.add(id);
            }

            for (EndpointFull edp : edpsToBuild) {
                String id = edp.endpoint.getId();
                edps.put(id, edp);
                endpoints.add(id);
            }

            for (InterfaceFull itf : itfsToBuild.values()) {
                String id = itf.interface_.getId();
                itfs.put(id, itf);
                endpoints.add(id);
            }

            return new ContainerFull(cDb, components, serviceAssemblies, sharedLibraries, services, endpoints,
                    interfaces);
        }

    }
}
