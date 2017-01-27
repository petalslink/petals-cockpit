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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.validation.Valid;

import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBus;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBusImported;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBusInError;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBusInImport;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbComponent;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbContainer;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbServiceUnit;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.State;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.Type;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInError;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import co.paralleluniverse.fibers.Suspendable;

public class WorkspaceContent {

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
    @Suspendable
    public static WorkspaceContent buildAndSaveToDatabase(BusesDAO buses, long bId, Domain topology)
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
            long cId = buses.createContainer(container.getContainerName(), container.getHost(), port,
                    container.getJmxUsername(), container.getJmxPassword(), bId);

            Set<String> components = new HashSet<>();
            for (Component component : container.getComponents()) {
                ComponentMin.State compState = ComponentMin.State.from(component.getState());
                ComponentMin.Type compType = ComponentMin.Type.from(component.getComponentType());
                long compId = buses.createComponent(component.getName(), compState, compType, cId);

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
                            long suId = buses.createServiceUnit(su.getName(), suState, compId, sa.getName());

                            serviceUnits.add(Long.toString(suId));
                            sus.put(Long.toString(suId), new ServiceUnitMin(suId, su.getName(), suState, sa.getName()));
                        }
                    }
                }

                components.add(Long.toString(compId));
                comps.put(Long.toString(compId), new ComponentFull(
                        new ComponentMin(compId, component.getName(), compState, compType), serviceUnits));

            }

            containers.add(Long.toString(cId));
            cs.put(Long.toString(cId),
                    new ContainerFull(new ContainerMin(cId, container.getContainerName()), components));
        }

        // TODO can I avoid transforming to string just for json output...
        importedBuses.put(Long.toString(bId), new BusFull(new BusMin(bId, topology.getName()), containers));

        buses.updateBus(bId, topology.getName());

        return new WorkspaceContent(busesInProgress, importedBuses, cs, comps, sus);
    }

    /**
     * TODO this should be done by {@link WorkspaceActor}
     */
    public static WorkspaceContent buildFromDatabase(BusesDAO buses, DbWorkspace w) {
        Map<String, BusFull> importedBuses = new HashMap<>();
        Map<String, BusInProgress> busesInProgress = new HashMap<>();
        Map<String, ContainerFull> cs = new HashMap<>();
        Map<String, ComponentFull> comps = new HashMap<>();
        Map<String, ServiceUnitMin> sus = new HashMap<>();

        for (DbBus b : buses.getBusesByWorkspace(w.id)) {
            if (b instanceof DbBusImported) {
                Set<String> containers = new HashSet<>();
                for (DbContainer c : buses.getContainersByBus(b.id)) {
                    Set<String> components = new HashSet<>();
                    for (DbComponent comp : buses.getComponentsByContainer(c)) {
                        Set<String> serviceUnits = new HashSet<>();
                        for (DbServiceUnit su : buses.getServiceUnitByComponent(comp)) {
                            serviceUnits.add(Long.toString(su.id));
                            sus.put(Long.toString(su.id), new ServiceUnitMin(su.id, su.name, su.state, su.saName));
                        }
                        components.add(Long.toString(comp.id));
                        comps.put(Long.toString(comp.id), new ComponentFull(
                                new ComponentMin(comp.id, comp.name, comp.state, comp.type), serviceUnits));
                    }
                    containers.add(Long.toString(c.id));
                    cs.put(Long.toString(c.id), new ContainerFull(new ContainerMin(c.id, c.name), components));
                }
                importedBuses.put(Long.toString(b.id),
                        new BusFull(new BusMin(b.id, ((DbBusImported) b).name), containers));
            } else if (b instanceof DbBusInImport) {
                busesInProgress.put(Long.toString(b.id),
                        new BusInProgress(b.id, b.importIp, b.importPort, b.importUsername));
            } else if (b instanceof DbBusInError) {
                busesInProgress.put(Long.toString(b.id),
                        new BusInError(b.id, b.importIp, b.importPort, b.importUsername, ((DbBusInError) b).error));
            } else {
                // TODO or log?
                throw new AssertionError();
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