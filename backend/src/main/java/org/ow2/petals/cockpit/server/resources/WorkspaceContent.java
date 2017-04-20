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
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.validation.Valid;

import org.jooq.Configuration;
import org.jooq.DSLContext;
import org.jooq.exception.DataAccessException;
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
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.State;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.Type;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

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
    public final ImmutableMap<String, ServiceUnitMin> serviceUnits;

    @JsonCreator
    public WorkspaceContent(@JsonProperty("busesInProgress") Map<String, BusInProgress> busesInProgress,
            @JsonProperty("buses") Map<String, BusFull> buses,
            @JsonProperty("containers") Map<String, ContainerFull> containers,
            @JsonProperty("components") Map<String, ComponentFull> components,
            @JsonProperty("serviceUnits") Map<String, ServiceUnitMin> serviceUnits) {
        this.busesInProgress = ImmutableMap.copyOf(busesInProgress);
        this.buses = ImmutableMap.copyOf(buses);
        this.containers = ImmutableMap.copyOf(containers);
        this.components = ImmutableMap.copyOf(components);
        this.serviceUnits = ImmutableMap.copyOf(serviceUnits);
    }

    public static class InvalidPetalsBus extends Exception {

        private static final long serialVersionUID = 8866405347860930056L;

        public InvalidPetalsBus(String msg) {
            super(msg);
        }
    }

    /**
     * Meant to be called from inside a DB transaction!
     * 
     * TODO this should be done by {@link WorkspaceActor}
     */
    public static WorkspaceContent buildAndSaveToDatabase(Configuration jooq, long bId, Domain topology)
            throws InvalidPetalsBus {
        try {
            return DSL.using(jooq).transactionResult(c -> doBuildAndSaveToDatabase(c, bId, topology));
        } catch (DataAccessException e) {
            if (e.getCause() instanceof InvalidPetalsBus) {
                throw (InvalidPetalsBus) e.getCause();
            } else {
                throw e;
            }
        }
    }

    private static WorkspaceContent doBuildAndSaveToDatabase(Configuration jooq, long bId, Domain topology)
            throws InvalidPetalsBus {
        Map<String, BusFull> importedBuses = new HashMap<>();
        Map<String, BusInProgress> busesInProgress = new HashMap<>();
        Map<String, ContainerFull> cs = new HashMap<>();
        Map<String, ComponentFull> comps = new HashMap<>();
        Map<String, ServiceUnitMin> sus = new HashMap<>();

        Set<String> containers = new HashSet<>();
        for (Container container : topology.getContainers()) {
            Integer port = container.getPorts().get(PortType.JMX);
            assert port != null;

            ContainersRecord cDb = new ContainersRecord(null, bId, container.getContainerName(), container.getHost(),
                    port, container.getJmxUsername(), container.getJmxPassword());
            cDb.attach(jooq);
            int cDbi = cDb.insert();
            assert cDbi == 1;

            Set<String> components = new HashSet<>();
            for (Component component : container.getComponents()) {
                ComponentMin.State compState = ComponentMin.State.from(component.getState());
                ComponentMin.Type compType = ComponentMin.Type.from(component.getComponentType());

                ComponentsRecord compDb = new ComponentsRecord(null, cDb.getId(), component.getName(), compState.name(),
                        compType.name());
                compDb.attach(jooq);
                int compDbi = compDb.insert();
                assert compDbi == 1;

                Set<String> serviceUnits = new HashSet<>();
                for (ServiceAssembly sa : container.getServiceAssemblies()) {
                    if (sa.getServiceUnits().size() != 1) {
                        throw new InvalidPetalsBus("Buses with not-single SU SAs are not supported!");
                    }
                    for (ServiceUnit su : sa.getServiceUnits()) {
                        if (su.getTargetComponent().equals(component.getName())) {
                            // TODO is this information returned by admin correct? Some SUs could be in a different
                            // state in case of problems...!
                            ServiceUnitMin.State suState = ServiceUnitMin.State.from(sa.getState());

                            ServiceunitsRecord suDb = new ServiceunitsRecord(null, compDb.getId(), su.getName(),
                                    suState.name(), sa.getName());
                            suDb.attach(jooq);
                            int suDbi = suDb.insert();
                            assert suDbi == 1;

                            serviceUnits.add(Long.toString(suDb.getId()));
                            sus.put(Long.toString(suDb.getId()),
                                    new ServiceUnitMin(suDb.getId(), su.getName(), suState, sa.getName()));
                        }
                    }
                }

                components.add(Long.toString(compDb.getId()));
                comps.put(Long.toString(compDb.getId()), new ComponentFull(
                        new ComponentMin(compDb.getId(), component.getName(), compState, compType), serviceUnits));

            }

            containers.add(Long.toString(cDb.getId()));
            cs.put(Long.toString(cDb.getId()),
                    new ContainerFull(new ContainerMin(cDb.getId(), container.getContainerName()), components));
        }

        importedBuses.put(Long.toString(bId), new BusFull(new BusMin(bId, topology.getName()), containers));

        DSL.using(jooq).update(BUSES).set(BUSES.IMPORTED, true).set(BUSES.NAME, topology.getName())
                .where(BUSES.ID.eq(bId)).execute();

        return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sus);
    }

    /**
     * TODO this should be done by {@link WorkspaceActor}
     */
    public static WorkspaceContent buildFromDatabase(Configuration conf, WorkspacesRecord w) {
        Map<String, BusFull> importedBuses = new HashMap<>();
        Map<String, BusInProgress> busesInProgress = new HashMap<>();
        Map<String, ContainerFull> cs = new HashMap<>();
        Map<String, ComponentFull> comps = new HashMap<>();
        Map<String, ServiceUnitMin> sus = new HashMap<>();

        DSLContext ctx = DSL.using(conf);
        for (BusesRecord b : ctx.selectFrom(BUSES).where(BUSES.WORKSPACE_ID.eq(w.getId())).fetchInto(BUSES)) {
            if (b.getImported()) {
                Set<String> containers = new HashSet<>();
                for (ContainersRecord c : ctx.selectFrom(CONTAINERS).where(CONTAINERS.BUS_ID.eq(b.getId()))) {
                    Set<String> components = new HashSet<>();
                    for (ComponentsRecord comp : ctx.selectFrom(COMPONENTS)
                            .where(COMPONENTS.CONTAINER_ID.eq(c.getId()))) {
                        Set<String> serviceUnits = new HashSet<>();
                        for (ServiceunitsRecord su : ctx.selectFrom(SERVICEUNITS)
                                .where(SERVICEUNITS.COMPONENT_ID.eq(comp.getId()))) {
                            serviceUnits.add(Long.toString(su.getId()));
                            ServiceUnitMin.State state = ServiceUnitMin.State.valueOf(su.getState());
                            sus.put(Long.toString(su.getId()),
                                    new ServiceUnitMin(su.getId(), su.getName(), state, su.getSaName()));
                        }
                        components.add(Long.toString(comp.getId()));
                        ComponentMin.State state = ComponentMin.State.valueOf(comp.getState());
                        ComponentMin.Type type = ComponentMin.Type.valueOf(comp.getType());
                        comps.put(Long.toString(comp.getId()), new ComponentFull(
                                new ComponentMin(comp.getId(), comp.getName(), state, type), serviceUnits));
                    }
                    containers.add(Long.toString(c.getId()));
                    cs.put(Long.toString(c.getId()),
                            new ContainerFull(new ContainerMin(c.getId(), c.getName()), components));
                }
                importedBuses.put(Long.toString(b.getId()),
                        new BusFull(new BusMin(b.getId(), b.getName()), containers));
            } else {
                busesInProgress.put(Long.toString(b.getId()), new BusInProgress(b.getId(), b.getImportIp(),
                        b.getImportPort(), b.getImportUsername(), b.getImportError()));
            }
        }

        return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sus);
    }

    public static class BusFull {

        @Valid
        @JsonUnwrapped
        public final BusMin bus;

        @JsonProperty
        public final ImmutableSet<String> containers;

        public BusFull(BusMin bus, Set<String> containers) {
            this.bus = bus;
            this.containers = ImmutableSet.copyOf(containers);
        }

        @JsonCreator
        private BusFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new BusMin(0, ""), ImmutableSet.of());
        }
    }

    public static class ContainerFull {

        @Valid
        @JsonUnwrapped
        public final ContainerMin container;

        @JsonProperty
        public final ImmutableSet<String> components;

        public ContainerFull(ContainerMin container, Set<String> components) {
            this.container = container;
            this.components = ImmutableSet.copyOf(components);
        }

        @JsonCreator
        private ContainerFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new ContainerMin(0, ""), ImmutableSet.of());
        }
    }

    public static class ComponentFull {

        @Valid
        @JsonUnwrapped
        public final ComponentMin component;

        @JsonProperty
        public final ImmutableSet<String> serviceUnits;

        public ComponentFull(ComponentMin component, Set<String> serviceUnits) {
            this.component = component;
            this.serviceUnits = ImmutableSet.copyOf(serviceUnits);
        }

        @JsonCreator
        private ComponentFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new ComponentMin(0, "", State.Unknown, Type.BC), ImmutableSet.of());
        }
    }
}