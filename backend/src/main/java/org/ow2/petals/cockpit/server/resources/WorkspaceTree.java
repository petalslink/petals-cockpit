/**
 * Copyright (C) 2016 Linagora
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
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.admin.api.artifact.ArtifactState;
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
import org.ow2.petals.cockpit.server.resources.BusesResource.BusInError;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusInProgress;
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

    /**
     * Meant to be called from inside a DB transaction!
     * 
     * TODO this should be done by {@link WorkspaceActor}
     */
    @Suspendable
    public static BusTree buildAndSaveToDatabase(BusesDAO buses, long bId, Domain topology) {
        List<ContainerTree> cs = new ArrayList<>();
        for (Container container : topology.getContainers()) {
            Integer port = container.getPorts().get(PortType.JMX);
            assert port != null;
            long cId = buses.createContainer(container.getContainerName(), container.getHost(), port,
                    container.getJmxUsername(), container.getJmxPassword(), bId);
            List<ComponentTree> comps = new ArrayList<>();
            for (Component component : container.getComponents()) {
                ComponentTree.State compState = ComponentTree.State.from(component.getState());
                long compId = buses.createComponent(component.getName(), compState.name(), cId);
                List<SUTree> sus = new ArrayList<>();
                for (ServiceAssembly sa : container.getServiceAssemblies()) {
                    for (ServiceUnit su : sa.getServiceUnits()) {
                        if (su.getTargetComponent().equals(component.getName())) {
                            SUTree.State suState = SUTree.State.from(sa.getState());
                            long suId = buses.createServiceUnit(su.getName(), suState.name(), compId);
                            sus.add(new SUTree(suId, su.getName(), suState));
                        }
                    }
                }
                comps.add(new ComponentTree(compId, component.getName(), compState, sus));
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
        for (DbBus b : buses.getBusesByWorkspace(w)) {
            if (b instanceof DbBusImported) {
                List<ContainerTree> cs = new ArrayList<>();
                for (DbContainer c : buses.getContainersByBus(b)) {
                    List<ComponentTree> comps = new ArrayList<>();
                    for (DbComponent comp : buses.getComponentsByContainer(c)) {
                        List<SUTree> sus = new ArrayList<>();
                        for (DbServiceUnit su : buses.getServiceUnitByComponent(comp)) {
                            sus.add(new SUTree(su.id, su.name, SUTree.State.valueOf(su.state)));
                        }
                        comps.add(new ComponentTree(comp.id, comp.name, ComponentTree.State.valueOf(comp.state), sus));
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

    public static class BusTree {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @Valid
        @JsonProperty
        public final ImmutableList<ContainerTree> containers;

        @JsonCreator
        public BusTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("containers") List<ContainerTree> containers) {
            this.id = id;
            this.name = name;
            this.containers = ImmutableList.copyOf(containers);
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ContainerTree {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @Valid
        @JsonProperty
        public final ImmutableList<ComponentTree> components;

        @JsonCreator
        public ContainerTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("components") List<ComponentTree> components) {
            this.id = id;
            this.name = name;
            this.components = ImmutableList.copyOf(components);
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ComponentTree {

        public enum State {
            Loaded, Started, Stopped, Shutdown, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case LOADED:
                        return Loaded;
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    default:
                        throw new AssertionError();
                }
            }
        }

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotNull
        @JsonProperty
        public final State state;

        @Valid
        @JsonProperty
        public final ImmutableList<SUTree> serviceUnits;

        public ComponentTree(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("serviceUnits") List<SUTree> serviceUnits) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.serviceUnits = ImmutableList.copyOf(serviceUnits);
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class SUTree {

        public enum State {
            Loaded, Started, Stopped, Shutdown, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case LOADED:
                        return Loaded;
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    default:
                        throw new AssertionError();
                }
            }
        }

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotNull
        @JsonProperty
        public final State state;

        public SUTree(long id, String name, State state) {
            this.id = id;
            this.name = name;
            this.state = state;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }
}