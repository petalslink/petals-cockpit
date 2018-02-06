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

import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_COMPONENTS_CONTAINERS_ID;
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_CONTAINERS_BUSES_ID;
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_USERS_WORKSPACES_USERNAME;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES_COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Future;

import javax.inject.Inject;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jetty.io.EofException;
import org.glassfish.hk2.api.ServiceLocator;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.server.BroadcasterListener;
import org.glassfish.jersey.server.ChunkedOutput;
import org.jooq.Configuration;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.endpoint.EndpointDirectoryView;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceassembliesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.EndpointsResource;
import org.ow2.petals.cockpit.server.resources.EndpointsResource.EndpointFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.ServicesResource;
import org.ow2.petals.cockpit.server.resources.ServicesResource.ServiceFull;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryFull;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.WorkspaceContentBuilder;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusImport;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeParameters;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentStateChanged;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAStateChanged;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SLChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SLStateChanged;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import javaslang.Tuple2;
import javaslang.control.Either;

public class WorkspacesService {

    private static final Logger LOG = LoggerFactory.getLogger(WorkspacesService.class);

    private final ServiceLocator serviceLocator;

    private final Configuration jooq;

    private final PetalsAdmin petals;

    private final WorkspaceDbOperations workspaceDb;

    private final ConcurrentMap<Long, WorkspaceService> workspaces = new ConcurrentHashMap<>();

    @Inject
    public WorkspacesService(ServiceLocator serviceLocator, Configuration jooq, PetalsAdmin petals,
            WorkspaceDbOperations workspaceDb) {
        this.serviceLocator = serviceLocator;
        this.jooq = jooq;
        this.petals = petals;
        this.workspaceDb = workspaceDb;
    }

    public WorkspaceService get(long wId, String username) {
        return DSL.using(jooq).transactionResult(conf -> {
            // this checks both existence and access
            // we check everytime to avoid race conditions during actor deletion
            if (!DSL.using(jooq).fetchExists(USERS_WORKSPACES,
                    USERS_WORKSPACES.USERNAME.eq(username).and(USERS_WORKSPACES.WORKSPACE_ID.eq(wId)))) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            return workspaces.computeIfAbsent(wId, id -> {
                WorkspaceService w = new WorkspaceService(id);
                serviceLocator.inject(w);
                return w;
            });
        });
    }

    public class WorkspaceService {

        private final long wId;

        private final SseBroadcaster broadcaster = new SseBroadcaster();

        private final Map<Long, Future<?>> importsInProgress = new HashMap<>();

        public WorkspaceService(long id) {
            this.wId = id;
            this.broadcaster.add(new BroadcasterListener<OutboundEvent>() {
                @Override
                public void onException(ChunkedOutput<OutboundEvent> chunkedOutput, Exception exception) {
                    if (exception instanceof EofException) {
                        LOG.debug("Lost SSE connection in workspace {}", wId, exception);
                    } else {
                        LOG.error("Error in SSE broadcaster for workspace {}", wId, exception);
                    }
                }

                @Override
                public void onClose(ChunkedOutput<OutboundEvent> chunkedOutput) {
                    LOG.debug("Client left workspace {}", wId);
                }
            });
        }

        private OutboundEvent event(WorkspaceEvent event) {
            return new OutboundEvent.Builder().name(event.event.name()).mediaType(MediaType.APPLICATION_JSON_TYPE)
                    .data(event.data).build();
        }

        private void broadcast(WorkspaceEvent event) {
            broadcaster.broadcast(event(event));
        }

        public synchronized EventOutput addBroadcastClient(String user) throws IOException {

            LOG.debug("New SSE client for workspace {}", wId);

            WorkspaceFullContent content = DSL.using(jooq).transactionResult(conf -> {
                WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wId)).fetchOne();

                // this should never happen!
                assert ws != null;

                WorkspaceContentBuilder c = WorkspaceContent.builder();
                workspaceDb.fetchWorkspaceFromDatabase(conf, ws, c);

                List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                        .onKey(FK_USERS_WORKSPACES_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(wId))
                        .fetchInto(USERS);

                DSL.using(conf).update(USERS).set(USERS.LAST_WORKSPACE, wId).where(USERS.USERNAME.eq(user)).execute();

                return new WorkspaceFullContent(ws, wsUsers, c.build());
            });
            assert content != null;

            EventOutput eo = new EventOutput();

            eo.write(event(WorkspaceEvent.content(content)));

            broadcaster.add(eo);

            return eo;
        }

        public synchronized WorkspaceDeleted delete() {
            DSL.using(jooq).transaction(conf -> {
                workspaceDb.deleteWorkspace(wId, conf);

                // unregister while still in the transaction!
                workspaces.remove(wId);
            });

            // now we are sure nobody can get a hold of this actor!

            // let's cancel current imports
            for (Future<?> f : importsInProgress.values()) {
                f.cancel(true);
            }

            this.importsInProgress.clear();

            WorkspaceDeleted wd = new WorkspaceDeleted(wId);

            broadcast(WorkspaceEvent.workspaceDeleted(wd));

            // now we close all connection (and if they reconnect they will get a 404,
            // but anyway the frontend should have stopped the connection as soon as
            // it got the deleted workspace event.
            broadcaster.closeAll();

            return wd;
        }

        public synchronized BusDeleted deleteBus(String user, long bId) {
            workspaceDb.deleteBus(bId, wId, jooq);

            Future<?> future = importsInProgress.remove(bId);

            String reason;
            if (future == null) {
                reason = "Bus deleted by " + user;
            } else {
                // TODO if it returns false, is there something specific to do?
                // I don't think so because we delete the bus in that case
                future.cancel(true);
                reason = "Import cancelled by " + user;
            }

            BusDeleted bd = new BusDeleted(bId, reason);

            broadcast(WorkspaceEvent.busDeleted(bd));

            return bd;
        }


        public synchronized BusInProgress importBus(BusImport nb) {
            final BusesRecord bDb = DSL.using(jooq).transactionResult(conf -> {
                BusesRecord br = new BusesRecord(null, wId, false, nb.ip, nb.port, nb.username, null, null);
                br.attach(conf);
                br.insert();
                return br;
            });
            assert bDb != null;

            BusInProgress bip = new BusInProgress(bDb);

            broadcast(WorkspaceEvent.busImport(bip));

            // we use a future to let the actor handles other message during bus import
            importBusInFuture(nb, bDb);

            return bip;
        }

        private void importBusInFuture(BusImport nb, BusesRecord bDb) {
            Runnable importer = () -> {
                // this can be interrupted by Future.cancel: if it happens, the future will simply be stopped
                // and removed from the map by the delete handling
                Either<String, Domain> res = doImportExistingBus(nb);

                // once we got the topology, it can't be cancelled anymore
                // that's why the actions are passed back to the actor
                // so that the future terminate and can't be cancelled
                CompletableFuture.runAsync(() -> finishImport(bDb, res));
            };

            // TODO store it before starting to prevent race condition (not likely to happen but well...)
            importsInProgress.put(bDb.getId(), CompletableFuture.runAsync(importer));
        }

        private synchronized void finishImport(BusesRecord bDb, Either<String, Domain> res) {
            // in any case we now remove it if it's there
            Future<?> f = importsInProgress.remove(bDb.getId());

            // if it's null, it has been cancelled!
            if (f != null) {
                broadcast(res.<Either<String, WorkspaceContent>> fold(Either::left, topology -> {
                    WorkspaceContentBuilder b = WorkspaceContent.builder();
                    DSL.using(jooq).transaction(c -> workspaceDb.saveDomainToDatabase(c, bDb, topology, b));
                    WorkspaceContent result = b.build();

                    // TODO create a specific class to be cleaner
                    final Tuple2<ImmutableMap<String, ServiceFull>, ImmutableMap<String, EndpointFull>> workspaceServices = getWorkspaceServices();
                    result.services = workspaceServices._1();
                    result.endpoints = workspaceServices._2();

                    return Either.right(result);
                }).fold(error -> {
                    LOG.info("Can't import bus from container {}:{}: {}", bDb.getImportIp(), bDb.getImportPort(),
                            error);
                    bDb.setImportError(error);
                    bDb.attach(jooq);
                    bDb.update();
                    return WorkspaceEvent.busImportError(new BusInProgress(bDb));
                }, WorkspaceEvent::busImportOk));
            }
        }



        // TODO in the future, there should be multiple methods like this for multiple type of imports
        private Either<String, Domain> doImportExistingBus(BusImport bus) {
            try {
                /*
                 * TODO even though getTopology can be interrupted, the petals admin code is based on RMI which cannot
                 * be interrupted, so it will continue to be executed even after InterruptedException is thrown. There
                 * is nothing we can do for this until petals admin is changed, but it's ok since there is no side
                 * effect in this operation: it will run in the background while we consider the operation interrupted
                 * on our side.
                 */

                Domain topology = petals.getTopology(bus.ip, bus.port, bus.username, bus.password, bus.passphrase);
                return Either.right(topology);
            } catch (Exception e) {
                String m = e instanceof PetalsAdminException ? e.getCause().getMessage() : e.getMessage();
                String message = m != null ? m : e.getClass().getName();

                LOG.debug("Can't import bus from container {}:{}", bus.ip, bus.port, e);

                return Either.left(message);
            }
        }

        public synchronized void changeComponentParameters(long compId, ComponentChangeParameters action) {
            DSL.using(jooq).transaction(conf -> {
                ComponentsRecord comp = DSL.using(conf).select(COMPONENTS.fields()).from(COMPONENTS).join(CONTAINERS)
                        .onKey(FK_COMPONENTS_CONTAINERS_ID).join(BUSES).onKey(FK_CONTAINERS_BUSES_ID)
                        .where(COMPONENTS.ID.eq(compId).and(BUSES.WORKSPACE_ID.eq(wId)))
                        .fetchOneInto(ComponentsRecord.class);

                if (comp == null) {
                    throw new WebApplicationException(Status.NOT_FOUND);
                }

                ComponentMin.Type type = ComponentMin.Type.from(comp.getType());
                assert type != null;

                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS)
                        .where(CONTAINERS.ID.eq(comp.getContainerId())).fetchOne();
                assert cont != null;

                petals.setParameters(cont.getIp(), cont.getPort(), cont.getUsername(), cont.getPassword(),
                        comp.getName(), type.to(), action.parameters);
            });
        }

        public synchronized ComponentStateChanged changeComponentState(long compId, ComponentChangeState action) {
            return DSL.using(jooq).transactionResult(conf -> {

                ComponentsRecord comp = DSL.using(conf).select(COMPONENTS.fields()).from(COMPONENTS).join(CONTAINERS)
                        .onKey(FK_COMPONENTS_CONTAINERS_ID).join(BUSES).onKey(FK_CONTAINERS_BUSES_ID)
                        .where(COMPONENTS.ID.eq(compId).and(BUSES.WORKSPACE_ID.eq(wId)))
                        .fetchOneInto(ComponentsRecord.class);

                if (comp == null) {
                    throw new WebApplicationException(Status.NOT_FOUND);
                }

                ComponentMin.State currentState = ComponentMin.State.valueOf(comp.getState());
                ComponentMin.State newState = action.state;

                if (currentState.equals(newState)) {
                    return new ComponentStateChanged(comp.getId(), newState);
                }

                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS)
                        .where(CONTAINERS.ID.eq(comp.getContainerId())).fetchOne();
                assert cont != null;

                ComponentMin.State newCurrentState = petals.changeComponentState(cont.getIp(), cont.getPort(),
                        cont.getUsername(), cont.getPassword(), comp.getType(), comp.getName(), newState);

                ComponentStateChanged res = new ComponentStateChanged(comp.getId(), newCurrentState);

                componentStateUpdated(res, conf, currentState);

                return res;
            });
        }

        private void componentStateUpdated(ComponentStateChanged comp, Configuration conf,
                ComponentMin.State previousState) {
            Record1<Long> contId = null;
            boolean endpointsChanged = comp.mayChangeServicesCommingFrom(previousState);
            if (endpointsChanged) {
                contId = DSL.using(conf).select(COMPONENTS.CONTAINER_ID).from(COMPONENTS)
                        .where(COMPONENTS.ID.eq(comp.id)).fetchOne();
            }

            if (comp.state != ComponentMin.State.Unloaded) {
                DSL.using(conf).update(COMPONENTS).set(COMPONENTS.STATE, comp.state.name())
                        .where(COMPONENTS.ID.eq(comp.id)).execute();
            } else {
                workspaceDb.deleteComponent(comp.id, conf);
            }

            broadcast(WorkspaceEvent.componentStateChange(comp));

            if (endpointsChanged && contId != null && contId.value1() != null) {
                containerServicesChanged(contId.value1(), true);
            }
        }


        public synchronized SAStateChanged changeSAState(long saId, SAChangeState action) {
            return DSL.using(jooq).transactionResult(conf -> {
                ServiceassembliesRecord sa = DSL.using(conf).select(SERVICEASSEMBLIES.fields()).from(SERVICEASSEMBLIES)
                        .join(CONTAINERS).onKey().join(BUSES).onKey()
                        .where(SERVICEASSEMBLIES.ID.eq(saId).and(BUSES.WORKSPACE_ID.eq(wId)))
                        .fetchOneInto(ServiceassembliesRecord.class);

                if (sa == null) {
                    throw new WebApplicationException(Status.NOT_FOUND);
                }

                ServiceAssemblyMin.State currentState = ServiceAssemblyMin.State.valueOf(sa.getState());
                ServiceAssemblyMin.State newState = action.state;

                if (currentState.equals(newState)) {
                    return new SAStateChanged(saId, currentState);
                }

                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS)
                        .where(CONTAINERS.ID.eq(sa.getContainerId())).fetchOne();
                assert cont != null;

                ServiceAssemblyMin.State newCurrentState = petals.changeSAState(cont.getIp(), cont.getPort(),
                        cont.getUsername(), cont.getPassword(), sa.getName(), newState);

                SAStateChanged res = new SAStateChanged(sa.getId(), newCurrentState);

                serviceAssemblyStateUpdated(res, conf, currentState);

                return res;
            });
        }

        private void serviceAssemblyStateUpdated(SAStateChanged sa, Configuration conf,
                ServiceAssemblyMin.State previousState) {
            Record1<Long> contId = null;
            boolean endpointsMayHaveChanged = sa.mayChangeServicesCommingFrom(previousState);
            if (endpointsMayHaveChanged) {
                contId = DSL.using(conf).select(SERVICEASSEMBLIES.CONTAINER_ID).from(SERVICEASSEMBLIES)
                        .where(SERVICEASSEMBLIES.ID.eq(sa.id)).fetchOne();
            }

            if (sa.state != ServiceAssemblyMin.State.Unloaded) {
                DSL.using(conf).update(SERVICEASSEMBLIES).set(SERVICEASSEMBLIES.STATE, sa.state.name())
                        .where(SERVICEASSEMBLIES.ID.eq(sa.id)).execute();
            } else {
                DSL.using(conf).deleteFrom(SERVICEASSEMBLIES).where(SERVICEASSEMBLIES.ID.eq(sa.id)).execute();
            }

            broadcast(WorkspaceEvent.saStateChange(sa));

            if (endpointsMayHaveChanged && contId != null && contId.value1() != null) {
                containerServicesChanged(contId.value1(), true);
            }
        }


        public synchronized SLStateChanged changeSLState(long slId, SLChangeState action) {
            return DSL.using(jooq).transactionResult(conf -> {
                SharedlibrariesRecord sl = DSL.using(conf).select(SHAREDLIBRARIES.fields()).from(SHAREDLIBRARIES)
                        .join(CONTAINERS).onKey().join(BUSES).onKey()
                        .where(SHAREDLIBRARIES.ID.eq(slId).and(BUSES.WORKSPACE_ID.eq(wId)))
                        .fetchOneInto(SharedlibrariesRecord.class);

                if (sl == null) {
                    throw new WebApplicationException(Status.NOT_FOUND);
                }

                if (action.state == SharedLibraryMin.State.Loaded) {
                    return new SLStateChanged(slId, SharedLibraryMin.State.Loaded);
                }

                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS)
                        .where(CONTAINERS.ID.eq(sl.getContainerId())).fetchOne();
                assert cont != null;

                petals.undeploySL(cont.getIp(), cont.getPort(), cont.getUsername(), cont.getPassword(), sl.getName());

                SLStateChanged res = new SLStateChanged(sl.getId(), SharedLibraryMin.State.Unloaded);

                sharedLibraryStateUpdated(res, conf);

                return res;
            });
        }

        private void sharedLibraryStateUpdated(SLStateChanged sl, Configuration conf) {
            if (sl.state == SharedLibraryMin.State.Unloaded) {
                DSL.using(conf).deleteFrom(SHAREDLIBRARIES).where(SHAREDLIBRARIES.ID.eq(sl.id)).execute();
            }

            broadcast(WorkspaceEvent.slStateChange(sl));
        }

        public synchronized WorkspaceContent deployServiceAssembly(String name, URL saUrl, long cId) {
            return DSL.using(jooq).transactionResult(conf -> {
                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(cId)).fetchOne();
                assert cont != null;

                ServiceAssembly deployedSA = petals.deploySA(cont.getIp(), cont.getPort(), cont.getUsername(),
                        cont.getPassword(), name, saUrl);

                final WorkspaceContent result = serviceAssemblyDeployed(deployedSA, cId, conf);
                return result;
            });
        }

        private WorkspaceContent serviceAssemblyDeployed(ServiceAssembly deployedSA, long cId, Configuration conf) {

            ServiceAssemblyMin.State state = ServiceAssemblyMin.State.from(deployedSA.getState());
            ServiceassembliesRecord saDb = new ServiceassembliesRecord(null, cId, deployedSA.getName(), state.name());
            saDb.attach(conf);
            int saDbi = saDb.insert();
            assert saDbi == 1;

            workspaceDb.serviceAssemblyAdded(deployedSA, saDb);

            Map<String, ServiceUnitFull> serviceUnitsDb = new HashMap<>();
            for (ServiceUnit su : deployedSA.getServiceUnits()) {
                // use ServiceunitsRecord for the typing of its constructor
                ServiceunitsRecord suDb = new ServiceunitsRecord(null, null, su.getName(), saDb.getId(), cId);
                ServiceunitsRecord inserted = DSL.using(conf).insertInto(SERVICEUNITS).set(suDb)
                        .set(SERVICEUNITS.COMPONENT_ID,
                                DSL.select(COMPONENTS.ID).from(COMPONENTS)
                                        .where(COMPONENTS.NAME.eq(su.getTargetComponent())
                                                .and(COMPONENTS.CONTAINER_ID.eq(cId))))
                        .returning(SERVICEUNITS.ID, SERVICEUNITS.COMPONENT_ID).fetchOne();
                suDb.from(inserted, SERVICEUNITS.ID, SERVICEUNITS.COMPONENT_ID);
                serviceUnitsDb.put(Long.toString(suDb.getId()), new ServiceUnitFull(suDb));
            }

            WorkspaceContent res = new WorkspaceContent(
                    ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap
                            .of(Long.toString(saDb.getId()), new ServiceAssemblyFull(saDb, serviceUnitsDb.keySet())),
                    serviceUnitsDb, ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of());

            broadcast(WorkspaceEvent.saDeployed(res));

            return res;
        }

        public synchronized WorkspaceContent deployComponent(String name, ComponentMin.Type type, URL saUrl, long cId) {
            return DSL.using(jooq).transactionResult(conf -> {
                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(cId)).fetchOne();
                assert cont != null;

                Component deployedComp = petals.deployComponent(cont.getIp(), cont.getPort(), cont.getUsername(),
                        cont.getPassword(), type.to(), name, saUrl);

                return componentDeployed(deployedComp, cId, conf);
            });
        }

        private WorkspaceContent componentDeployed(Component deployedComp, long cId, Configuration conf) {

            ComponentMin.State state = ComponentMin.State.from(deployedComp.getState());
            ComponentMin.Type type = ComponentMin.Type.from(deployedComp.getType());
            assert type != null;

            ComponentsRecord compDb = new ComponentsRecord(null, cId, deployedComp.getName(), state.name(),
                    type.name());
            compDb.attach(conf);
            int compDbi = compDb.insert();
            assert compDbi == 1;

            workspaceDb.componentAdded(deployedComp, compDb);

            Set<String> sls = new HashSet<>();
            for (SharedLibrary sl : deployedComp.getSharedLibraries()) {
                SelectConditionStep<Record1<Long>> where = DSL.using(conf).select(SHAREDLIBRARIES.ID)
                        .from(SHAREDLIBRARIES)
                        .where(SHAREDLIBRARIES.NAME.eq(sl.getName()).and(SHAREDLIBRARIES.VERSION.eq(sl.getVersion()))
                                .and(SHAREDLIBRARIES.CONTAINER_ID.eq(cId)));
                int inserted = DSL.using(conf).insertInto(SHAREDLIBRARIES_COMPONENTS)
                        .set(SHAREDLIBRARIES_COMPONENTS.COMPONENT_ID, compDb.getId())
                        .set(SHAREDLIBRARIES_COMPONENTS.SHAREDLIBRARY_ID, where).execute();
                assert inserted == 1;
                Record1<Long> slId = where.fetchOne();
                assert slId != null;
                sls.add(Long.toString(slId.value1()));
            }

            WorkspaceContent res = new WorkspaceContent(ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                    ImmutableMap.of(Long.toString(compDb.getId()), new ComponentFull(compDb, ImmutableSet.of(), sls)),
                    ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of());

            broadcast(WorkspaceEvent.componentDeployed(res));

            return res;
        }

        public synchronized WorkspaceContent deploySharedLibrary(String name, String version, URL saUrl, long cId) {
            return DSL.using(jooq).transactionResult(conf -> {
                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(cId)).fetchOne();
                assert cont != null;

                SharedLibrary deployedSL = petals.deploySL(cont.getIp(), cont.getPort(), cont.getUsername(),
                        cont.getPassword(), name, version, saUrl);

                return sharedLibraryDeployed(deployedSL, cId, conf);
            });
        }

        private WorkspaceContent sharedLibraryDeployed(SharedLibrary deployedSL, long cId, Configuration conf) {
            SharedlibrariesRecord slDb = new SharedlibrariesRecord(null, deployedSL.getName(), deployedSL.getVersion(),
                    cId);
            slDb.attach(conf);
            int slDbi = slDb.insert();
            assert slDbi == 1;

            workspaceDb.sharedLibraryAdded(deployedSL, slDb);

            WorkspaceContent res = new WorkspaceContent(ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                    ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                    ImmutableMap.of(Long.toString(slDb.getId()), new SharedLibraryFull(slDb, ImmutableSet.of())),
                    ImmutableMap.of(), ImmutableMap.of());

            broadcast(WorkspaceEvent.sharedLibraryDeployed(res));

            return res;
        }

        public Tuple2<ImmutableMap<String, ServiceFull>, ImmutableMap<String, EndpointFull>> getWorkspaceServices() {
            DSL.using(jooq).select(CONTAINERS.ID).from(CONTAINERS).join(BUSES).onKey(FK_CONTAINERS_BUSES_ID)
                    .where(BUSES.WORKSPACE_ID.eq(wId)).fetchStream()
                    .forEach(containerRecord -> {
                        updateContainerServices(containerRecord.value1());
                    });

            return new Tuple2<ImmutableMap<String, ServiceFull>, ImmutableMap<String, EndpointFull>>(
                    workspaceDb.getWorkspaceServices(wId, jooq), workspaceDb.getWorkspaceEndpoints(wId, jooq));
        }

        private ImmutableMap<String, ServiceFull> containerServicesChanged(Long containerId,
                boolean broadcastServices) {
            updateContainerServices(containerId);
            Map<String, ServicesResource.ServiceFull> allServices = workspaceDb
                    .getWorkspaceServices(wId, jooq);
            Map<String, EndpointsResource.EndpointFull> allEndpoints = workspaceDb.getWorkspaceEndpoints(wId, jooq);

            // The caller may want to broadcast outside this method, along with other workspace content
            if (broadcastServices) {
                WorkspaceContent res = new WorkspaceContent(ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                        ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                        ImmutableMap.copyOf(allServices), ImmutableMap.copyOf(allEndpoints));

                LOG.debug("Service list updated for cont#{}, broadcasting {} services.", containerId,
                        res.services.size());
                broadcast(WorkspaceEvent.servicesUpdated(res));
            }

            return ImmutableMap.copyOf(allServices);
        }

        private void updateContainerServices(long cId) {
            EndpointDirectoryView edpView = getContainerEndpointsView(cId);
            workspaceDb.storeServicesList(edpView, cId, jooq);
        }

        private EndpointDirectoryView getContainerEndpointsView(long cId) {
            return DSL.using(jooq).transactionResult(conf -> {
                ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(cId)).fetchOne();

                assert cont != null;
                final String ip = cont.getIp();
                final String username = cont.getUsername();
                final String password = cont.getPassword();
                final Integer port = cont.getPort();
                assert ip != null && username != null && password != null && port != null;

                return petals.getEndpointDirectoryView(ip, port, username, password);
            });
        }

    }
}
