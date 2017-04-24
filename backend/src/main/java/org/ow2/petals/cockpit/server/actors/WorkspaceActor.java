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
package org.ow2.petals.cockpit.server.actors;

import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_COMPONENTS_CONTAINERS_ID;
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_CONTAINERS_BUSES_ID;
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_SERVICEUNITS_COMPONENTS_ID;
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_USERS_WORKSPACES_USERNAME;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.io.EofException;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.server.BroadcasterListener;
import org.glassfish.jersey.server.ChunkedOutput;
import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.api.artifact.lifecycle.ArtifactLifecycle;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.CockpitActors.CockpitRequest;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ContainersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ServiceunitsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.State;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusImport;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentDeployed;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentStateChanged;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SUChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SUDeployed;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SUStateChanged;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.services.PetalsAdmin;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;
import org.ow2.petals.cockpit.server.services.PetalsDb;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.paralleluniverse.actors.BasicActor;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.Fiber;
import co.paralleluniverse.fibers.SuspendExecution;
import co.paralleluniverse.fibers.Suspendable;
import co.paralleluniverse.strands.SuspendableRunnable;
import javaslang.CheckedFunction1;
import javaslang.control.Either;

/**
 * TODO should we make it die after some time if there is no listeners? not sure, see next TODO
 * 
 * TODO should we start it on application start? for now it doesn't make any sense since the actor are not proactively
 * monitoring the buses
 * 
 * @author vnoel
 *
 */
public class WorkspaceActor extends BasicActor<Msg, @Nullable Void> {

    private static final Logger LOG = LoggerFactory.getLogger(WorkspaceActor.class);

    private static final long serialVersionUID = -2202357041789526859L;

    private final SseBroadcaster broadcaster = new SseBroadcaster();

    private final Map<Long, Fiber<?>> importsInProgress = new HashMap<>();

    private final long wId;

    @Inject
    protected PetalsAdmin petals;

    @Inject
    protected PetalsDb db;

    public WorkspaceActor(long wId) {
        this.wId = wId;
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

    @Override
    @SuppressWarnings("squid:S2189")
    @Nullable
    protected Void doRun() throws InterruptedException, SuspendExecution {
        for (;;) {
            Msg msg = receive();
            if (msg instanceof WorkspaceActorAction) {
                ((WorkspaceActorAction) msg).action.run();
            } else if (msg instanceof DeleteWorkspace) {
                answer((DeleteWorkspace) msg, this::handleDeleteWorkspace);
                // the actor will die!
                return null;
            } else if (msg instanceof ImportBus) {
                answer((ImportBus) msg, this::handleImportBus);
            } else if (msg instanceof DeleteBus) {
                answer((DeleteBus) msg, this::handleDeleteBus);
            } else if (msg instanceof NewWorkspaceClient) {
                answer((NewWorkspaceClient) msg, this::addBroadcastClient);
            } else if (msg instanceof ChangeServiceUnitState) {
                answer((ChangeServiceUnitState) msg, this::handleSUStateChange);
            } else if (msg instanceof ChangeComponentState) {
                answer((ChangeComponentState) msg, this::handleComponentStateChange);
            } else if (msg instanceof DeployServiceUnit) {
                answer((DeployServiceUnit) msg, this::handleDeployServiceUnit);
            } else if (msg instanceof DeployComponent) {
                answer((DeployComponent) msg, this::handleDeployComponent);
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", wId, msg);
            }
        }
    }

    @Suspendable
    private void doInActorLoop(SuspendableRunnable action) {
        try {
            self().send(new WorkspaceActorAction(action));
        } catch (SuspendExecution e) {
            throw new AssertionError(e);
        }
    }

    private static OutboundEvent event(WorkspaceEvent event) {
        return new OutboundEvent.Builder().name(event.event.name()).mediaType(MediaType.APPLICATION_JSON_TYPE)
                .data(event.data).build();
    }

    /**
     * This should only be called from inside the actor loop!
     */
    private void broadcast(WorkspaceEvent event) {
        assert isInActor();
        broadcaster.broadcast(event(event));
    }

    private <R, T extends CockpitRequest<R>> void answer(T r, CheckedFunction1<T, R> f) throws SuspendExecution {
        try {
            RequestReplyHelper.reply(r, f.apply(r));
        } catch (Throwable e) {
            RequestReplyHelper.replyError(r, e);
        }
    }

    private EventOutput addBroadcastClient(NewWorkspaceClient nc)
            throws IOException, SuspendExecution, InterruptedException {

        LOG.debug("New SSE client for workspace {}", wId);

        WorkspaceFullContent content = db.runTransaction(conf -> {
            // TODO merge queries
            WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wId)).fetchOne();

            // this should never happen!
            assert ws != null;

            WorkspaceContent c = WorkspaceContent.buildFromDatabase(conf, ws);

            List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_WORKSPACES_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(wId)).fetchInto(USERS);

            DSL.using(conf).update(USERS).set(USERS.LAST_WORKSPACE, wId).where(USERS.USERNAME.eq(nc.user)).execute();

            return new WorkspaceFullContent(ws, wsUsers, c);
        });
        assert content != null;

        EventOutput eo = new EventOutput();

        eo.write(event(WorkspaceEvent.content(content)));

        broadcaster.add(eo);

        return eo;
    }

    private WorkspaceDeleted handleDeleteWorkspace(DeleteWorkspace dw)
            throws SuspendExecution, InterruptedException, RuntimeException {
        db.runTransaction(conf -> {
            // remove from db (it will propagate to all its contained elements!)
            DSL.using(conf).deleteFrom(WORKSPACES).where(WORKSPACES.ID.eq(wId)).execute();

            // unregister while still in the transaction!
            this.unregister();
        });

        // now we are sure nobody can get a hold of this actor!

        // let's cancel current imports
        for (Fiber<?> f : importsInProgress.values()) {
            f.cancel(true);
        }

        this.importsInProgress.clear();

        WorkspaceDeleted wd = new WorkspaceDeleted(wId);

        // this is the only case where we broadcast directly
        broadcast(WorkspaceEvent.workspaceDeleted(wd));

        // now we close all connection (and if they reconnect they will get a 404,
        // but anyway the frontend should have stopped the connection as soon as
        // it got the deleted workspace event.
        broadcaster.closeAll();

        return wd;
    }

    private BusDeleted handleDeleteBus(DeleteBus bus) throws SuspendExecution, InterruptedException {
        db.runTransaction(conf -> {
            int deleted = DSL.using(conf).deleteFrom(BUSES).where(BUSES.ID.eq(bus.bId).and(BUSES.WORKSPACE_ID.eq(wId)))
                    .execute();

            if (deleted < 1) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }
        });

        Fiber<?> fiber = importsInProgress.remove(bus.bId);

        String reason;
        if (fiber == null) {
            reason = "Bus deleted by " + bus.user;
        } else {
            // TODO if it returns false, is there something specific to do?
            // I don't think so because we delete the bus in that case
            fiber.cancel(true);
            reason = "Import cancelled by " + bus.user;
        }

        BusDeleted bd = new BusDeleted(bus.bId, reason);

        doInActorLoop(() -> broadcast(WorkspaceEvent.busDeleted(bd)));

        return bd;
    }

    private BusInProgress handleImportBus(ImportBus bus) throws SuspendExecution, InterruptedException {
        final BusImport nb = bus.nb;

        final long bId = db.runTransaction(conf -> {
            BusesRecord br = new BusesRecord(null, wId, false, nb.ip, nb.port, nb.username, nb.password, nb.passphrase,
                    null, null);
            br.attach(conf);
            br.insert();

            Long id = br.getId();
            assert id != null;

            return id;
        });

        BusInProgress bip = new BusInProgress(bId, nb.ip, nb.port, nb.username);

        doInActorLoop(() -> broadcast(WorkspaceEvent.busImport(bip)));

        // we use a fiber to let the actor handles other message during bus import
        importBusInFiber(nb, bId);

        return bip;
    }

    private void importBusInFiber(final BusImport nb, final long bId) {
        Fiber<?> importFiber = new Fiber<>(() -> {
            // this can be interrupted by Fiber.cancel: if it happens, the fiber will simply be stopped
            // and removed from the map by the delete handling
            final Either<String, Domain> res = doImportExistingBus(nb);

            // once we got the topology, it can't be cancelled anymore
            // that's why the actions are passed back to the actor
            // so that the fiber terminate and can't be cancelled
            doInActorLoop(() -> {
                // in any case we now remove it if it's there
                Fiber<?> f = importsInProgress.remove(bId);

                // if it's null, it has been cancelled!
                if (f != null) {
                    broadcast(db.runTransaction(conf -> {
                        return res.<Either<String, WorkspaceContent>> fold(Either::left, topology -> {
                            try {
                                return Either.right(WorkspaceContent.buildAndSaveToDatabase(conf, bId, topology));
                            } catch (WorkspaceContent.InvalidPetalsBus e) {
                                return Either.left(e.getMessage());
                            }
                        }).fold(error -> {
                            LOG.info("Can't import bus from container {}:{}: {}", nb.ip, nb.port, error);
                            DSL.using(conf).update(BUSES).set(BUSES.IMPORT_ERROR, error).where(BUSES.ID.eq(bId))
                                    .execute();
                            return WorkspaceEvent
                                    .busImportError(new BusInProgress(bId, nb.ip, nb.port, nb.username, error));
                        }, WorkspaceEvent::busImportOk);
                    }));
                }
            });
        });

        // store it before starting to prevent race condition
        importsInProgress.put(bId, importFiber);

        importFiber.start();
    }

    // TODO in the future, there should be multiple methods like this for multiple type of imports
    @Suspendable
    private Either<String, Domain> doImportExistingBus(BusImport bus) throws InterruptedException {
        try {
            // TODO even though runBlocking can be interrupted, the petals admin code is based on RMI which cannot be
            // interrupted, so it will continue to be executed even after InterruptedException is thrown. There is
            // nothing we can do for this until petals admin is changed.
            Domain topology = petals.getTopology(bus.ip, bus.port, bus.username, bus.password, bus.passphrase);
            return Either.right(topology);
        } catch (InterruptedException e) {
            // let's let it propagate up to the fiber and be swallowed
            throw e;
        } catch (Exception e) {
            String m = e instanceof PetalsAdminException ? e.getCause().getMessage() : e.getMessage();
            String message = m != null ? m : e.getClass().getName();

            LOG.debug("Can't import bus from container {}:{}", bus.ip, bus.port, e);

            return Either.left(message);
        }
    }

    private ComponentStateChanged handleComponentStateChange(ChangeComponentState change)
            throws SuspendExecution, InterruptedException {
        return db.runTransaction(conf -> {

            ComponentsRecord comp = DSL.using(conf).select(COMPONENTS.fields()).from(COMPONENTS).join(CONTAINERS)
                    .onKey(FK_COMPONENTS_CONTAINERS_ID).join(BUSES).onKey(FK_CONTAINERS_BUSES_ID)
                    .where(COMPONENTS.ID.eq(change.compId).and(BUSES.WORKSPACE_ID.eq(wId)))
                    .fetchOneInto(ComponentsRecord.class);

            if (comp == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            ComponentMin.State currentState = ComponentMin.State.valueOf(comp.getState());
            ComponentMin.State newState = change.action.state;

            if (currentState.equals(newState)) {
                return new ComponentStateChanged(change.compId, currentState);
            }

            if (!isComponentStateTransitionOk(comp, currentState, newState)) {
                // TODO or should I rely on the information from the container instead of my own?
                throw new WebApplicationException(Status.CONFLICT);
            }

            if (newState == ComponentMin.State.Unloaded
                    && DSL.using(conf).fetchExists(SERVICEUNITS, SERVICEUNITS.COMPONENT_ID.eq(comp.getId()))) {
                // TODO or should I rely on the information from the container instead of my own?
                throw new WebApplicationException(Status.CONFLICT);
            }

            // TODO merge with previous requests...
            ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS)
                    .where(CONTAINERS.ID.eq(comp.getContainerId())).fetchOne();
            assert cont != null;

            State newCurrentState = petals.changeState(cont.getIp(), cont.getPort(), cont.getUsername(),
                    cont.getPassword(), comp.getType(), comp.getName(), currentState, newState,
                    change.action.parameters);

            ComponentStateChanged res = new ComponentStateChanged(comp.getId(), newCurrentState);

            componentStateUpdated(res, conf);

            return res;
        });
    }

    /**
     * Note : petals admin does not expose a way to go to shutdown (except from {@link ComponentMin.State#Unloaded} via
     * {@link ArtifactLifecycle#deploy(java.net.URL)}, but we don't support it yet!)
     */
    private boolean isComponentStateTransitionOk(ComponentsRecord comp, ComponentMin.State from,
            ComponentMin.State to) {
        switch (from) {
            case Loaded:
                return to == ComponentMin.State.Shutdown // via install()
                        || to == ComponentMin.State.Unloaded; // via undeploy()
            case Shutdown:
                return to == ComponentMin.State.Unloaded // via undeploy()
                        || to == ComponentMin.State.Loaded // via uninstall()
                        || to == ComponentMin.State.Started; // via start()
            case Started:
                return to == ComponentMin.State.Stopped; // via stop()
            case Stopped:
                return to == ComponentMin.State.Started // via start()
                        || to == ComponentMin.State.Loaded // via uninstall()
                        || to == ComponentMin.State.Unloaded; // via undeploy()
            case Unknown:
                return to == ComponentMin.State.Unloaded; // via undeploy()
            default:
                LOG.warn("Impossible case for state transition check from {} to {} for Component {} ({})", from, to,
                        comp.getName(), comp.getId());
                return false;
        }
    }

    private void componentStateUpdated(ComponentStateChanged comp, Configuration conf) {
        // TODO error handling???
        if (comp.state != ComponentMin.State.Unloaded) {
            DSL.using(conf).update(COMPONENTS).set(COMPONENTS.STATE, comp.state.name()).where(COMPONENTS.ID.eq(comp.id))
                    .execute();
        } else {
            DSL.using(conf).deleteFrom(COMPONENTS).where(COMPONENTS.ID.eq(comp.id)).execute();
        }

        // we want the event to be sent after we answered
        doInActorLoop(() -> broadcast(WorkspaceEvent.componentStateChange(comp)));
    }

    private SUStateChanged handleSUStateChange(ChangeServiceUnitState change)
            throws SuspendExecution, InterruptedException {
        return db.runTransaction(conf -> {
            ServiceunitsRecord su = DSL.using(conf).select(SERVICEUNITS.fields()).from(SERVICEUNITS).join(COMPONENTS)
                    .onKey(FK_SERVICEUNITS_COMPONENTS_ID).join(CONTAINERS).onKey(FK_COMPONENTS_CONTAINERS_ID)
                    .join(BUSES).onKey(FK_CONTAINERS_BUSES_ID)
                    .where(SERVICEUNITS.ID.eq(change.suId).and(BUSES.WORKSPACE_ID.eq(wId)))
                    .fetchOneInto(ServiceunitsRecord.class);

            if (su == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            ServiceUnitMin.State currentState = ServiceUnitMin.State.valueOf(su.getState());
            ServiceUnitMin.State newState = change.action.state;

            if (currentState.equals(newState)) {
                return new SUStateChanged(change.suId, currentState);
            }

            if (!isSAStateTransitionOk(su, currentState, newState)) {
                // TODO or should I rely on the information from the container instead of my own?
                throw new WebApplicationException(Status.CONFLICT);
            }

            // TODO merge with previous request...
            ContainersRecord cont = DSL.using(conf).select().from(CONTAINERS).join(COMPONENTS)
                    .onKey(FK_COMPONENTS_CONTAINERS_ID).where(COMPONENTS.ID.eq(su.getComponentId()))
                    .fetchOneInto(CONTAINERS);
            assert cont != null;

            ServiceUnitMin.State newCurrentState = petals.changeState(cont.getIp(), cont.getPort(), cont.getUsername(),
                    cont.getPassword(), su.getSaName(), newState);

            SUStateChanged res = new SUStateChanged(su.getId(), newCurrentState);

            serviceUnitStateUpdated(res, conf);

            return res;
        });
    }

    private void serviceUnitStateUpdated(SUStateChanged su, Configuration conf) {
        // TODO error handling???
        if (su.state != ServiceUnitMin.State.Unloaded) {
            DSL.using(conf).update(SERVICEUNITS).set(SERVICEUNITS.STATE, su.state.name())
                    .where(SERVICEUNITS.ID.eq(su.id)).execute();
        } else {
            DSL.using(conf).deleteFrom(SERVICEUNITS).where(SERVICEUNITS.ID.eq(su.id)).execute();
        }

        // we want the event to be sent after we answered
        doInActorLoop(() -> broadcast(WorkspaceEvent.suStateChange(su)));
    }

    /**
     * Note : petals admin does not expose a way to go to shutdown (except from {@link ServiceUnitMin.State#Unloaded}
     * via {@link ArtifactLifecycle#deploy(java.net.URL)}, but we don't support it yet!)
     */
    private boolean isSAStateTransitionOk(ServiceunitsRecord su, ServiceUnitMin.State from, ServiceUnitMin.State to) {
        switch (from) {
            case Shutdown:
                return to == ServiceUnitMin.State.Unloaded // via undeploy()
                        || to == ServiceUnitMin.State.Started; // via start()
            case Started:
                return to == ServiceUnitMin.State.Stopped; // via stop()
            case Stopped:
                return to == ServiceUnitMin.State.Started // via start()
                        || to == ServiceUnitMin.State.Unloaded; // via undeploy()
            case Unknown:
                return to == ServiceUnitMin.State.Unloaded; // via undeploy()
            default:
                LOG.warn("Impossible case for state transition check from {} to {} for SU {} ({})", from, to,
                        su.getName(), su.getId());
                return false;
        }
    }

    private SUDeployed handleDeployServiceUnit(DeployServiceUnit su) throws SuspendExecution, InterruptedException {
        return db.runTransaction(conf -> {
            ContainersRecord cont = DSL.using(conf).select().from(CONTAINERS).join(COMPONENTS)
                    .onKey(FK_COMPONENTS_CONTAINERS_ID).where(COMPONENTS.ID.eq(su.compId)).fetchOneInto(CONTAINERS);
            assert cont != null;

            ServiceAssembly deployedSA = petals.deploy(cont.getIp(), cont.getPort(), cont.getUsername(),
                    cont.getPassword(), su.saName, su.saUrl);

            return serviceUnitDeployed(deployedSA, su.compId, conf);
        });
    }

    private SUDeployed serviceUnitDeployed(ServiceAssembly deployedSA, long compId, Configuration conf) {
        // there should be exactly one SU in it
        ServiceUnit deployedSU = deployedSA.getServiceUnits().iterator().next();
        ServiceUnitMin.State state = ServiceUnitMin.State.from(deployedSA.getState());

        ServiceunitsRecord suDb = new ServiceunitsRecord(null, compId, deployedSU.getName(), state.name(),
                deployedSA.getName());
        suDb.attach(conf);
        int suDbi = suDb.insert();
        assert suDbi == 1;

        SUDeployed res = new SUDeployed(compId,
                new ServiceUnitMin(suDb.getId(), suDb.getName(), state, suDb.getSaName()));

        // we want the event to be sent after we answered
        doInActorLoop(() -> broadcast(WorkspaceEvent.suDeployed(res)));

        return res;
    }

    private ComponentDeployed handleDeployComponent(DeployComponent comp)
            throws SuspendExecution, InterruptedException {
        return db.runTransaction(conf -> {
            ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(comp.cId)).fetchOne();
            assert cont != null;

            Component deployedComp = petals.deploy(cont.getIp(), cont.getPort(), cont.getUsername(), cont.getPassword(),
                    comp.type.to(), comp.name, comp.saUrl);

            return componentDeployed(deployedComp, comp.cId, conf);
        });
    }

    private ComponentDeployed componentDeployed(Component deployedComp, long cId, Configuration conf) {

        ComponentMin.State state = ComponentMin.State.from(deployedComp.getState());
        ComponentMin.Type type = ComponentMin.Type.from(deployedComp.getType());
        assert type != null;

        ComponentsRecord compDb = new ComponentsRecord(null, cId, deployedComp.getName(), state.name(), type.name());
        compDb.attach(conf);
        int suDbi = compDb.insert();
        assert suDbi == 1;

        ComponentDeployed res = new ComponentDeployed(cId,
                new ComponentMin(compDb.getId(), compDb.getName(), state, type));

        // we want the event to be sent after we answered
        doInActorLoop(() -> broadcast(WorkspaceEvent.componentDeployed(res)));

        return res;
    }

    public interface Msg {
        // marker interface for messages to this actor
    }

    public static class WorkspaceRequest<T> extends CockpitRequest<T> implements Msg {

        private static final long serialVersionUID = -564899978996631515L;
    }

    public static class NewWorkspaceClient extends WorkspaceRequest<EventOutput> {

        private static final long serialVersionUID = 1L;

        private final String user;

        public NewWorkspaceClient(String user) {
            this.user = user;
        }
    }

    public static class DeleteWorkspace extends WorkspaceRequest<WorkspaceDeleted> {

        private static final long serialVersionUID = 9055119816237335262L;

    }

    public static class ImportBus extends WorkspaceRequest<BusInProgress> {

        private static final long serialVersionUID = 1286574765918364762L;

        final BusImport nb;

        public ImportBus(BusImport nb) {
            this.nb = nb;
        }
    }

    public static class DeleteBus extends WorkspaceRequest<BusDeleted> {

        private static final long serialVersionUID = 1L;

        final String user;

        final long bId;

        public DeleteBus(String user, long bId) {
            this.user = user;
            this.bId = bId;
        }
    }

    public static class ChangeServiceUnitState extends WorkspaceRequest<SUStateChanged> {

        private static final long serialVersionUID = 8119375036012239516L;

        final SUChangeState action;

        final long suId;

        public ChangeServiceUnitState(long suId, SUChangeState action) {
            this.suId = suId;
            this.action = action;
        }
    }

    public static class ChangeComponentState extends WorkspaceRequest<ComponentStateChanged> {

        private static final long serialVersionUID = 8119375036012239516L;

        final ComponentChangeState action;

        final long compId;

        public ChangeComponentState(long compId, ComponentChangeState action) {
            this.compId = compId;
            this.action = action;
        }
    }

    public static class DeployServiceUnit extends WorkspaceRequest<SUDeployed> {

        private static final long serialVersionUID = 3305750050657001574L;

        final String saName;

        final URL saUrl;

        final long compId;

        public DeployServiceUnit(String saName, URL saUrl, long compId) {
            this.saName = saName;
            this.saUrl = saUrl;
            this.compId = compId;
        }
    }

    public static class DeployComponent extends WorkspaceRequest<ComponentDeployed> {

        private static final long serialVersionUID = 3305750050657001574L;

        final String name;

        final ComponentMin.Type type;

        final URL saUrl;

        final long cId;

        public DeployComponent(String name, ComponentMin.Type type, URL saUrl, long cId) {
            this.name = name;
            this.type = type;
            this.saUrl = saUrl;
            this.cId = cId;
        }
    }

    /**
     * Uses with {@link WorkspaceActor#doInActorLoop(SuspendableRunnable)}
     */
    private static class WorkspaceActorAction implements Msg {

        final SuspendableRunnable action;

        public WorkspaceActorAction(SuspendableRunnable action) {
            this.action = action;
        }
    }
}
