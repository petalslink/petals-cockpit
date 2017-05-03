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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.validation.Valid;

import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusFull;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.State;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerFull;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.SetMultimap;

import javaslang.Tuple;
import javaslang.Tuple2;

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

    @JsonCreator
    public WorkspaceContent(@JsonProperty("busesInProgress") Map<String, BusInProgress> busesInProgress,
            @JsonProperty("buses") Map<String, BusFull> buses,
            @JsonProperty("containers") Map<String, ContainerFull> containers,
            @JsonProperty("components") Map<String, ComponentFull> components,
            @JsonProperty("serviceAssemblies") Map<String, ServiceAssemblyFull> serviceAssemblies,
            @JsonProperty("serviceUnits") Map<String, ServiceUnitFull> serviceUnits) {
        this.busesInProgress = ImmutableMap.copyOf(busesInProgress);
        this.buses = ImmutableMap.copyOf(buses);
        this.containers = ImmutableMap.copyOf(containers);
        this.components = ImmutableMap.copyOf(components);
        this.serviceAssemblies = ImmutableMap.copyOf(serviceAssemblies);
        this.serviceUnits = ImmutableMap.copyOf(serviceUnits);
    }

    /**
     * Meant to be called from inside a DB transaction!
     * 
     * TODO this should be done by {@link WorkspaceActor}
     */
    public static WorkspaceContent buildAndSaveToDatabase(Configuration jooq, long wId, long bId, Domain topology) {
        return DSL.using(jooq).transactionResult(c -> doBuildAndSaveToDatabase(c, wId, bId, topology));
    }

    private static WorkspaceContent doBuildAndSaveToDatabase(Configuration jooq, long wId, long bId, Domain topology) {
        Map<String, BusFull> importedBuses = new HashMap<>();
        Map<String, BusInProgress> busesInProgress = new HashMap<>();
        Map<String, ContainerFull> cs = new HashMap<>();
        Map<String, ComponentFull> comps = new HashMap<>();
        Map<String, ServiceAssemblyFull> sas = new HashMap<>();
        Map<String, ServiceUnitFull> sus = new HashMap<>();

        Set<String> containers = new HashSet<>();
        for (Container container : topology.getContainers()) {
            Integer port = container.getPorts().get(PortType.JMX);
            assert port != null;

            ContainersRecord cDb = new ContainersRecord(null, bId, container.getContainerName(), container.getHost(),
                    port, container.getJmxUsername(), container.getJmxPassword());
            cDb.attach(jooq);
            int cDbi = cDb.insert();
            assert cDbi == 1;

            Map<String, Long> components = new HashMap<>();
            Set<Tuple2<ComponentMin, ComponentMin.State>> componentsToBuild = new HashSet<>();
            for (Component component : container.getComponents()) {
                ComponentMin.State compState = ComponentMin.State.from(component.getState());
                ComponentMin.Type compType = ComponentMin.Type.from(component.getComponentType());

                ComponentsRecord compDb = new ComponentsRecord(null, cDb.getId(), component.getName(), compState.name(),
                        compType.name());
                compDb.attach(jooq);
                int compDbi = compDb.insert();
                assert compDbi == 1;

                components.put(component.getName(), compDb.getId());
                componentsToBuild
                        .add(Tuple.of(new ComponentMin(compDb.getId(), component.getName(), compType), compState));
            }

            SetMultimap<Long, String> serviceUnitsByComp = HashMultimap.create();
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

                    serviceUnits.add(Long.toString(suDb.getId()));
                    serviceUnitsByComp.put(componentId, Long.toString(suDb.getId()));
                    sus.put(Long.toString(suDb.getId()), new ServiceUnitFull(
                            new ServiceUnitMin(suDb.getId(), su.getName()), cDb.getId(), componentId, saDb.getId()));
                }

                serviceAssemblies.add(Long.toString(saDb.getId()));
                sas.put(Long.toString(saDb.getId()), new ServiceAssemblyFull(
                        new ServiceAssemblyMin(saDb.getId(), saDb.getName()), cDb.getId(), state, serviceUnits));
            }

            for (Tuple2<ComponentMin, State> t : componentsToBuild) {
                comps.put(t._1().getId(),
                        new ComponentFull(t._1(), cDb.getId(), t._2(), serviceUnitsByComp.get(t._1().id)));
            }

            containers.add(Long.toString(cDb.getId()));
            cs.put(Long.toString(cDb.getId()),
                    new ContainerFull(
                            new ContainerMin(cDb.getId(), container.getContainerName()), bId, components.values()
                                    .stream().map(l -> Long.toString(l)).collect(ImmutableSet.toImmutableSet()),
                            serviceAssemblies));
        }

        importedBuses.put(Long.toString(bId), new BusFull(new BusMin(bId, topology.getName()), wId, containers));

        DSL.using(jooq).update(BUSES).set(BUSES.IMPORTED, true).set(BUSES.NAME, topology.getName())
                .where(BUSES.ID.eq(bId)).execute();

        return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sas, sus);
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

        DSLContext ctx = DSL.using(conf);
        for (BusesRecord b : ctx.selectFrom(BUSES).where(BUSES.WORKSPACE_ID.eq(w.getId())).fetchInto(BUSES)) {
            if (b.getImported()) {
                Set<String> containers = new HashSet<>();
                for (ContainersRecord c : ctx.selectFrom(CONTAINERS).where(CONTAINERS.BUS_ID.eq(b.getId()))) {

                    SetMultimap<Long, String> serviceUnitsBySA = LinkedHashMultimap.create();
                    SetMultimap<Long, String> serviceUnitsByComp = LinkedHashMultimap.create();
                    for (ServiceunitsRecord su : ctx.selectFrom(SERVICEUNITS)
                            .where(SERVICEUNITS.CONTAINER_ID.eq(c.getId()))) {
                        serviceUnitsBySA.put(su.getServiceassemblyId(), Long.toString(su.getId()));
                        serviceUnitsByComp.put(su.getComponentId(), Long.toString(su.getId()));
                        sus.put(Long.toString(su.getId()),
                                new ServiceUnitFull(new ServiceUnitMin(su.getId(), su.getName()), su.getContainerId(),
                                        su.getComponentId(), su.getServiceassemblyId()));
                    }

                    Set<String> components = new HashSet<>();
                    for (ComponentsRecord comp : ctx.selectFrom(COMPONENTS)
                            .where(COMPONENTS.CONTAINER_ID.eq(c.getId()))) {

                        components.add(Long.toString(comp.getId()));
                        ComponentMin.State state = ComponentMin.State.valueOf(comp.getState());
                        ComponentMin.Type type = ComponentMin.Type.valueOf(comp.getType());
                        comps.put(Long.toString(comp.getId()),
                                new ComponentFull(new ComponentMin(comp.getId(), comp.getName(), type), c.getId(),
                                        state, serviceUnitsByComp.get(comp.getId())));
                    }

                    Set<String> serviceAssemblies = new HashSet<>();
                    for (ServiceassembliesRecord sa : ctx.selectFrom(SERVICEASSEMBLIES)
                            .where(SERVICEASSEMBLIES.CONTAINER_ID.eq(c.getId()))) {

                        ServiceAssemblyMin.State state = ServiceAssemblyMin.State.valueOf(sa.getState());

                        serviceAssemblies.add(Long.toString(sa.getId()));
                        sas.put(Long.toString(sa.getId()),
                                new ServiceAssemblyFull(new ServiceAssemblyMin(sa.getId(), sa.getName()), c.getId(),
                                        state, serviceUnitsBySA.get(sa.getId())));
                    }

                    containers.add(Long.toString(c.getId()));
                    cs.put(Long.toString(c.getId()), new ContainerFull(new ContainerMin(c.getId(), c.getName()),
                            b.getId(), components, serviceAssemblies));
                }
                importedBuses.put(Long.toString(b.getId()),
                        new BusFull(new BusMin(b.getId(), b.getName()), w.getId(), containers));
            } else {
                busesInProgress.put(Long.toString(b.getId()), new BusInProgress(b.getId(), b.getImportIp(),
                        b.getImportPort(), b.getImportUsername(), b.getImportError()));
            }
        }

        return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sas, sus);
    }
}