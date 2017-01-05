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

import java.util.ArrayList;
import java.util.List;

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
import org.ow2.petals.cockpit.server.resources.BusesResource.MinBus;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.MinComponent;
import org.ow2.petals.cockpit.server.resources.ContainersResource.MinContainer;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.MinServiceUnit;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInError;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.MinWorkspace;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;

import co.paralleluniverse.fibers.Suspendable;

public class WorkspaceTree extends MinWorkspace {

    @Valid
    @JsonProperty
    public final ImmutableList<BusInProgress> busesInProgress;

    @Valid
    @JsonProperty
    public final ImmutableList<BusTree> buses;

    @JsonCreator
    public WorkspaceTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
            @JsonProperty("buses") List<BusTree> buses,
            @JsonProperty("busesInProgress") List<BusInProgress> busesInProgress) {
        super(id, name);
        this.buses = ImmutableList.copyOf(buses);
        this.busesInProgress = ImmutableList.copyOf(busesInProgress);
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
    public static BusTree buildAndSaveToDatabase(BusesDAO buses, long bId, Domain topology) throws InvalidPetalsBus {
        List<ContainerTree> cs = new ArrayList<>();
        for (Container container : topology.getContainers()) {
            Integer port = container.getPorts().get(PortType.JMX);
            assert port != null;
            long cId = buses.createContainer(container.getContainerName(), container.getHost(), port,
                    container.getJmxUsername(), container.getJmxPassword(), bId);
            List<ComponentTree> comps = new ArrayList<>();
            for (Component component : container.getComponents()) {
                MinComponent.State compState = MinComponent.State.from(component.getState());
                MinComponent.Type compType = MinComponent.Type.from(component.getComponentType());
                long compId = buses.createComponent(component.getName(), compState, compType, cId);
                List<SUTree> sus = new ArrayList<>();
                for (ServiceAssembly sa : container.getServiceAssemblies()) {
                    if (sa.getServiceUnits().size() != 1) {
                        throw new InvalidPetalsBus("Buses with not-single SU SAs are not supported!");
                    }
                    for (ServiceUnit su : sa.getServiceUnits()) {
                        if (su.getTargetComponent().equals(component.getName())) {
                            // TODO is this information returned by admin correct? Some SUs could be in a different
                            // state in case of problems...!
                            SUTree.State suState = SUTree.State.from(sa.getState());
                            long suId = buses.createServiceUnit(su.getName(), suState, compId, sa.getName());
                            sus.add(new SUTree(suId, su.getName(), suState, sa.getName()));
                        }
                    }
                }
                comps.add(new ComponentTree(compId, component.getName(), compState, compType, sus));
            }
            cs.add(new ContainerTree(cId, container.getContainerName(), comps));
        }

        buses.updateBus(bId, topology.getName());

        return new BusTree(bId, topology.getName(), cs);
    }

    /**
     * TODO this should be done by {@link WorkspaceActor}
     */
    public static WorkspaceTree buildFromDatabase(BusesDAO buses, DbWorkspace w) {
        List<BusTree> importedBus = new ArrayList<>();
        List<BusInProgress> busInProgress = new ArrayList<>();
        for (DbBus b : buses.getBusesByWorkspace(w.id)) {
            if (b instanceof DbBusImported) {
                List<ContainerTree> cs = new ArrayList<>();
                for (DbContainer c : buses.getContainersByBus(b.id)) {
                    List<ComponentTree> comps = new ArrayList<>();
                    for (DbComponent comp : buses.getComponentsByContainer(c)) {
                        List<SUTree> sus = new ArrayList<>();
                        for (DbServiceUnit su : buses.getServiceUnitByComponent(comp)) {
                            sus.add(new SUTree(su.id, su.name, su.state, su.saName));
                        }
                        comps.add(new ComponentTree(comp.id, comp.name, comp.state, comp.type, sus));
                    }
                    cs.add(new ContainerTree(c.id, c.name, comps));
                }
                importedBus.add(new BusTree(b.id, ((DbBusImported) b).name, cs));
            } else if (b instanceof DbBusInImport) {
                busInProgress.add(new BusInProgress(b.id, b.importIp, b.importPort, b.importUsername));
            } else if (b instanceof DbBusInError) {
                busInProgress.add(
                        new BusInError(b.id, b.importIp, b.importPort, b.importUsername, ((DbBusInError) b).error));
            } else {
                throw new AssertionError();
            }
        }

        return new WorkspaceTree(w.id, w.name, importedBus, busInProgress);
    }

    public static class BusTree extends MinBus {

        @Valid
        @JsonProperty
        public final ImmutableList<ContainerTree> containers;

        @JsonCreator
        public BusTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("containers") List<ContainerTree> containers) {
            super(id, name);
            this.containers = ImmutableList.copyOf(containers);
        }
    }

    public static class ContainerTree extends MinContainer {

        @Valid
        @JsonProperty
        public final ImmutableList<ComponentTree> components;

        @JsonCreator
        public ContainerTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("components") List<ComponentTree> components) {
            super(id, name);
            this.components = ImmutableList.copyOf(components);
        }
    }

    public static class ComponentTree extends MinComponent {

        @Valid
        @JsonProperty
        public final ImmutableList<SUTree> serviceUnits;

        public ComponentTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("type") Type type,
                @JsonProperty("serviceUnits") List<SUTree> serviceUnits) {
            super(id, name, state, type);
            this.serviceUnits = ImmutableList.copyOf(serviceUnits);
        }
    }

    public static class SUTree extends MinServiceUnit {

        public SUTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("saName") String saName) {
            super(id, name, state, saName);
        }
    }
}