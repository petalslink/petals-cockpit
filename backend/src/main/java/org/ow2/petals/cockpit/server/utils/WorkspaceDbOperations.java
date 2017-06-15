/**
 * Copyright (C) 2017 Linagora
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
package org.ow2.petals.cockpit.server.utils;

import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES_COMPONENTS;

import java.util.HashMap;
import java.util.Map;

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
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;

import com.google.common.collect.LinkedHashMultimap;
import com.google.common.collect.SetMultimap;

public class WorkspaceDbOperations {

    private WorkspaceDbOperations() {
        // utility
    }

    public interface SaveWorkspaceDbWitness {

        public final static SaveWorkspaceDbWitness NOP = new SaveWorkspaceDbWitness() {

            @Override
            public void busAdded(Domain bus, BusesRecord bDb) {
                // NOP
            }

            @Override
            public void containerAdded(Container container, ContainersRecord cDb) {
                // NOP
            }

            @Override
            public void componentAdded(Component component, ComponentsRecord compDb) {
                // NOP
            }

            @Override
            public void sharedLibraryAdded(SharedLibrary sl, SharedlibrariesRecord slDb) {
                // NOP
            }

            @Override
            public void serviceAssemblyAdded(ServiceAssembly sa, ServiceassembliesRecord saDb) {
                // NOP
            }

            @Override
            public void serviceUnitAdded(ServiceUnit su, ServiceunitsRecord suDb) {
                // NOP
            }

        };

        public void busAdded(Domain bus, BusesRecord bDb);

        public void containerAdded(Container container, ContainersRecord cDb);

        public void componentAdded(Component component, ComponentsRecord compDb);

        public void sharedLibraryAdded(SharedLibrary sl, SharedlibrariesRecord slDb);

        public void serviceAssemblyAdded(ServiceAssembly sa, ServiceassembliesRecord saDb);

        public void serviceUnitAdded(ServiceUnit su, ServiceunitsRecord suDb);
    }

    public interface WorkspaceDbWitness {
        public final static WorkspaceDbWitness NOP = new WorkspaceDbWitness() {
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
    }

    public static void saveDomainToDatabase(Configuration jooq, BusesRecord bDb, Domain topology,
            WorkspaceDbWitness witness, SaveWorkspaceDbWitness saveWitness) {
        bDb.setImported(true);
        bDb.setName(topology.getName());
        bDb.attach(jooq);
        bDb.update();

        WorkspaceDbBusBuilder busBuilder = witness.addImportedBus(bDb);
        saveWitness.busAdded(topology, bDb);

        for (Container container : topology.getContainers()) {
            Integer port = container.getPorts().get(PortType.JMX);
            assert port != null;

            ContainersRecord cDb = new ContainersRecord(null, bDb.getId(), container.getContainerName(),
                    container.getHost(), port, container.getJmxUsername(), container.getJmxPassword());
            cDb.attach(jooq);
            int cDbi = cDb.insert();
            assert cDbi == 1;
            WorkspaceDbContainerBuilder containerBuilder = busBuilder.addContainer(cDb);
            saveWitness.containerAdded(container, cDb);

            long containerId = cDb.getId();

            SetMultimap<SharedLibrary, Long> componentsBySL = LinkedHashMultimap.create();
            Map<String, Long> components = new HashMap<>();
            for (Component component : container.getComponents()) {
                ComponentMin.State compState = ComponentMin.State.from(component.getState());
                ComponentMin.Type compType = ComponentMin.Type.from(component.getComponentType());
                ComponentsRecord compDb = new ComponentsRecord(null, containerId, component.getName(), compState.name(),
                        compType.name());
                compDb.attach(jooq);
                int compDbi = compDb.insert();
                assert compDbi == 1;

                containerBuilder.addComponent(compDb);
                saveWitness.componentAdded(component, compDb);

                components.put(component.getName(), compDb.getId());
                for (SharedLibrary sl : component.getSharedLibraries()) {
                    componentsBySL.put(sl, compDb.getId());
                }
            }

            for (SharedLibrary sl : container.getSharedLibraries()) {
                SharedlibrariesRecord slDb = new SharedlibrariesRecord(null, sl.getName(), sl.getVersion(),
                        containerId);
                slDb.attach(jooq);
                int slDbi = slDb.insert();
                assert slDbi == 1;
                containerBuilder.addSharedLibrary(slDb);
                saveWitness.sharedLibraryAdded(sl, slDb);

                for (Long componentId : componentsBySL.get(sl)) {
                    assert componentId != null;
                    SharedlibrariesComponentsRecord slCompDb = new SharedlibrariesComponentsRecord(slDb.getId(),
                            componentId);
                    slCompDb.attach(jooq);
                    int slCompDbi = slCompDb.insert();
                    assert slCompDbi == 1;
                    containerBuilder.addSharedLibraryComponent(slCompDb);
                }
            }

            for (ServiceAssembly sa : container.getServiceAssemblies()) {
                ServiceAssemblyMin.State state = ServiceAssemblyMin.State.from(sa.getState());
                ServiceassembliesRecord saDb = new ServiceassembliesRecord(null, containerId, sa.getName(),
                        state.name());
                saDb.attach(jooq);
                int saDbi = saDb.insert();
                assert saDbi == 1;
                containerBuilder.addServiceAssembly(saDb);
                saveWitness.serviceAssemblyAdded(sa, saDb);

                for (ServiceUnit su : sa.getServiceUnits()) {
                    Long componentId = components.get(su.getTargetComponent());
                    assert componentId != null;
                    ServiceunitsRecord suDb = new ServiceunitsRecord(null, componentId, su.getName(), saDb.getId(),
                            containerId);
                    suDb.attach(jooq);
                    int suDbi = suDb.insert();
                    assert suDbi == 1;
                    containerBuilder.addServiceUnit(suDb);
                    saveWitness.serviceUnitAdded(su, suDb);
                }
            }
        }
    }

    public static void fetchWorkspaceFromDatabase(Configuration conf, WorkspacesRecord w, WorkspaceDbWitness builder) {
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
                }
            } else {
                builder.addBusInProgress(b);
            }
        }
    }
}
