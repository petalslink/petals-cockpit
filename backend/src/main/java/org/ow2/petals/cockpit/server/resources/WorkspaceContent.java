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

import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.validation.Valid;

import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryFull;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
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

    @JsonCreator
    public WorkspaceContent(@JsonProperty("busesInProgress") Map<String, BusInProgress> busesInProgress,
            @JsonProperty("buses") Map<String, BusFull> buses,
            @JsonProperty("containers") Map<String, ContainerFull> containers,
            @JsonProperty("components") Map<String, ComponentFull> components,
            @JsonProperty("serviceAssemblies") Map<String, ServiceAssemblyFull> serviceAssemblies,
            @JsonProperty("serviceUnits") Map<String, ServiceUnitFull> serviceUnits,
            @JsonProperty("sharedLibraries") Map<String, SharedLibraryFull> sharedLibraries) {
        this.busesInProgress = ImmutableMap.copyOf(busesInProgress);
        this.buses = ImmutableMap.copyOf(buses);
        this.containers = ImmutableMap.copyOf(containers);
        this.components = ImmutableMap.copyOf(components);
        this.serviceAssemblies = ImmutableMap.copyOf(serviceAssemblies);
        this.serviceUnits = ImmutableMap.copyOf(serviceUnits);
        this.sharedLibraries = ImmutableMap.copyOf(sharedLibraries);
    }

    /**
     * Meant to be called from inside a DB transaction!
     * 
     * TODO this should be done by {@link WorkspaceActor}
     */
    public static WorkspaceContent buildAndSaveToDatabase(Configuration jooq, BusesRecord bDb, Domain topology) {
        return DSL.using(jooq).transactionResult(c -> doBuildAndSaveToDatabase(c, bDb, topology));
    }

    private static WorkspaceContent doBuildAndSaveToDatabase(Configuration jooq, BusesRecord bDb, Domain topology) {
        Map<String, BusFull> importedBuses = new HashMap<>();
        Map<String, BusInProgress> busesInProgress = new HashMap<>();
        Map<String, ContainerFull> cs = new HashMap<>();
        Map<String, ComponentFull> comps = new HashMap<>();
        Map<String, ServiceAssemblyFull> sas = new HashMap<>();
        Map<String, ServiceUnitFull> sus = new HashMap<>();
        Map<String, SharedLibraryFull> sls = new HashMap<>();

        Set<String> containers = new HashSet<>();
        for (Container container : topology.getContainers()) {
            Integer port = container.getPorts().get(PortType.JMX);
            assert port != null;

            ContainersRecord cDb = new ContainersRecord(null, bDb.getId(), container.getContainerName(),
                    container.getHost(), port, container.getJmxUsername(), container.getJmxPassword());
            cDb.attach(jooq);
            int cDbi = cDb.insert();
            assert cDbi == 1;

            Map<String, Long> components = new HashMap<>();
            List<ComponentsRecord> componentsToBuild = new ArrayList<>(container.getComponents().size());
            for (Component component : container.getComponents()) {
                ComponentMin.State compState = ComponentMin.State.from(component.getState());
                ComponentMin.Type compType = ComponentMin.Type.from(component.getComponentType());

                ComponentsRecord compDb = new ComponentsRecord(null, cDb.getId(), component.getName(), compState.name(),
                        compType.name());
                compDb.attach(jooq);
                int compDbi = compDb.insert();
                assert compDbi == 1;

                components.put(component.getName(), compDb.getId());
                componentsToBuild.add(compDb);
            }

            SetMultimap<Long, String> serviceUnitsByComp = LinkedHashMultimap.create();
            Set<String> serviceAssemblies = new HashSet<>();
            for (ServiceAssembly sa : container.getServiceAssemblies()) {

                // TODO is this information returned by admin correct? Some SUs could be in a different
                // state in case of problems...!
                ServiceAssemblyMin.State state = ServiceAssemblyMin.State.from(sa.getState());

                ServiceassembliesRecord saDb = new ServiceassembliesRecord(null, cDb.getId(), sa.getName(),
                        state.name());
                saDb.attach(jooq);
                int saDbi = saDb.insert();
                assert saDbi == 1;

                Set<String> serviceUnits = new HashSet<>();
                for (ServiceUnit su : sa.getServiceUnits()) {
                    Long componentId = components.get(su.getTargetComponent());
                    // TODO what should we do if it's not?
                    assert componentId != null;

                    ServiceunitsRecord suDb = new ServiceunitsRecord(null, componentId, su.getName(), saDb.getId(),
                            cDb.getId());
                    suDb.attach(jooq);
                    int suDbi = suDb.insert();
                    assert suDbi == 1;

                    String suId = Long.toString(suDb.getId());
                    serviceUnits.add(suId);
                    serviceUnitsByComp.put(componentId, suId);
                    sus.put(suId, new ServiceUnitFull(suDb));
                }

                String saId = Long.toString(saDb.getId());
                serviceAssemblies.add(saId);
                sas.put(saId, new ServiceAssemblyFull(saDb, serviceUnits));
            }

            for (ComponentsRecord compDb : componentsToBuild) {
                comps.put(Long.toString(compDb.getId()),
                        new ComponentFull(compDb, serviceUnitsByComp.get(compDb.getId())));
            }

            Set<String> sharedLibraries = new HashSet<>();
            for (SharedLibrary sl : container.getSharedLibraries()) {
                SharedlibrariesRecord slDb = new SharedlibrariesRecord(null, sl.getName(), sl.getVersion(),
                        cDb.getId());
                slDb.attach(jooq);
                int slDbi = slDb.insert();
                assert slDbi == 1;

                sls.put(Long.toString(slDb.getId()), new SharedLibraryFull(slDb));
            }

            String cId = Long.toString(cDb.getId());
            containers.add(cId);
            cs.put(cId, new ContainerFull(cDb,
                    components.values().stream().map(l -> Long.toString(l)).collect(ImmutableSet.toImmutableSet()),
                    serviceAssemblies, sharedLibraries));
        }

        bDb.setImported(true);
        bDb.setName(topology.getName());
        bDb.attach(jooq);
        bDb.update();

        importedBuses.put(Long.toString(bDb.getId()), new BusFull(bDb, containers));

        return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sas, sus, sls);
    }

    /**
     * TODO this should be done by {@link WorkspaceActor}
     */
    public static WorkspaceContent buildFromDatabase(Configuration conf, WorkspacesRecord w) {
        Map<String, BusFull> importedBuses = new HashMap<>();
        Map<String, BusInProgress> busesInProgress = new HashMap<>();
        Map<String, ContainerFull> cs = new HashMap<>();
        Map<String, ComponentFull> comps = new HashMap<>();
        Map<String, ServiceAssemblyFull> sas = new HashMap<>();
        Map<String, ServiceUnitFull> sus = new HashMap<>();
        Map<String, SharedLibraryFull> sls = new HashMap<>();

        DSLContext ctx = DSL.using(conf);
        for (BusesRecord b : ctx.selectFrom(BUSES).where(BUSES.WORKSPACE_ID.eq(w.getId())).fetchInto(BUSES)) {
            String bId = Long.toString(b.getId());
            if (b.getImported()) {
                Set<String> containers = new HashSet<>();
                for (ContainersRecord c : ctx.selectFrom(CONTAINERS).where(CONTAINERS.BUS_ID.eq(b.getId()))) {

                    SetMultimap<Long, String> serviceUnitsBySA = LinkedHashMultimap.create();
                    SetMultimap<Long, String> serviceUnitsByComp = LinkedHashMultimap.create();
                    for (ServiceunitsRecord su : ctx.selectFrom(SERVICEUNITS)
                            .where(SERVICEUNITS.CONTAINER_ID.eq(c.getId()))) {
                        String suId = Long.toString(su.getId());
                        serviceUnitsBySA.put(su.getServiceassemblyId(), suId);
                        serviceUnitsByComp.put(su.getComponentId(), suId);
                        sus.put(suId, new ServiceUnitFull(su));
                    }

                    Set<String> components = new HashSet<>();
                    for (ComponentsRecord comp : ctx.selectFrom(COMPONENTS)
                            .where(COMPONENTS.CONTAINER_ID.eq(c.getId()))) {
                        String compId = Long.toString(comp.getId());
                        components.add(compId);
                        comps.put(compId, new ComponentFull(comp, serviceUnitsByComp.get(comp.getId())));
                    }

                    Set<String> serviceAssemblies = new HashSet<>();
                    for (ServiceassembliesRecord sa : ctx.selectFrom(SERVICEASSEMBLIES)
                            .where(SERVICEASSEMBLIES.CONTAINER_ID.eq(c.getId()))) {
                        String saId = Long.toString(sa.getId());
                        serviceAssemblies.add(saId);
                        sas.put(saId, new ServiceAssemblyFull(sa, serviceUnitsBySA.get(sa.getId())));
                    }

                    Set<String> sharedLibraries = new HashSet<>();
                    for (SharedlibrariesRecord sl : ctx.selectFrom(SHAREDLIBRARIES)
                            .where(SHAREDLIBRARIES.CONTAINER_ID.eq(c.getId()))) {
                        String slId = Long.toString(sl.getId());
                        sharedLibraries.add(slId);
                        sls.put(slId, new SharedLibraryFull(sl));
                    }

                    String cId = Long.toString(c.getId());
                    containers.add(cId);
                    cs.put(cId, new ContainerFull(c, components, serviceAssemblies, sharedLibraries));
                }
                importedBuses.put(bId, new BusFull(b, containers));
            } else {
                busesInProgress.put(bId, new BusInProgress(b));
            }
        }

        return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sas, sus, sls);
    }
}