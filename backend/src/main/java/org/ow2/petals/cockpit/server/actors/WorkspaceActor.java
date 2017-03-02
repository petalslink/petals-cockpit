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
import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_USERS_USERNAME;
import static org.ow2.petals.cockpit.server.db.generated.Tables.BUSES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.io.IOException;
import java.util.List;

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
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.ArtifactAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.artifact.Artifact;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.lifecycle.ArtifactLifecycle;
import org.ow2.petals.admin.api.artifact.lifecycle.ComponentLifecycle;
import org.ow2.petals.admin.api.artifact.lifecycle.ServiceAssemblyLifecycle;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
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
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.NewBus;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.NewComponentState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.NewSUState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceChange;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.Fiber;
import co.paralleluniverse.fibers.SuspendExecution;
import co.paralleluniverse.fibers.Suspendable;
import co.paralleluniverse.strands.SuspendableCallable;
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
public class WorkspaceActor extends CockpitActor<Msg> {

    private static final Logger LOG = LoggerFactory.getLogger(WorkspaceActor.class);

    private static final long serialVersionUID = -2202357041789526859L;

    private final SseBroadcaster broadcaster = new SseBroadcaster();

    private final long wId;

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
    protected Void doRun() throws InterruptedException, SuspendExecution {
        for (;;) {
            Msg msg = receive();
            if (msg instanceof WorkspaceEventAction) {
                WorkspaceEventAction action = (WorkspaceEventAction) msg;
                broadcast(action.action.run());
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
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", wId, msg);
            }
        }
    }

    private void doInActorLoop(SuspendableCallable<WorkspaceChange> action) throws SuspendExecution {
        assert !isInActor();
        self().send(new WorkspaceEventAction(action));
    }

    /**
     * This should only be called from inside the actor loop!
     */
    private void broadcast(WorkspaceChange event) {
        assert isInActor();
        OutboundEvent oe = new OutboundEvent.Builder().name(event.event.name())
                .mediaType(MediaType.APPLICATION_JSON_TYPE).data(event.data).build();
        broadcaster.broadcast(oe);
    }

    private <R, T extends CockpitRequest<R>> void answer(T r, CheckedFunction1<T, Either<Status, R>> f)
            throws SuspendExecution {
        try {
            RequestReplyHelper.reply(r, f.apply(r));
        } catch (Throwable e) {
            RequestReplyHelper.replyError(r, e);
        }
    }

    private Either<Status, EventOutput> addBroadcastClient(NewWorkspaceClient nc) throws IOException, SuspendExecution {

        LOG.debug("New SSE client for workspace {}", wId);

        Either<Status, WorkspaceFullContent> content = runTransaction(conf -> {
            // TODO merge queries
            WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wId)).fetchOne();

            // this should never happen!
            assert ws != null;

            Record user = DSL.using(conf).selectFrom(USERS_WORKSPACES).where(USERS_WORKSPACES.USERNAME.eq(nc.user))
                    .and(USERS_WORKSPACES.WORKSPACE_ID.eq(wId)).fetchOne();

            if (user == null) {
                return Either.left(Status.FORBIDDEN);
            }

            WorkspaceContent c = WorkspaceContent.buildFromDatabase(conf, ws);

            List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(wId)).fetchInto(USERS);

            DSL.using(conf).update(USERS).set(USERS.LAST_WORKSPACE, wId).where(USERS.USERNAME.eq(nc.user)).execute();

            return Either.right(new WorkspaceFullContent(ws, wsUsers, c));
        });

        if (content.isLeft()) {
            return Either.left(content.getLeft());
        }

        EventOutput eo = new EventOutput();

        eo.write(new OutboundEvent.Builder().name(WorkspaceChange.Type.WORKSPACE_CONTENT.name())
                .mediaType(MediaType.APPLICATION_JSON_TYPE).data(content.get()).build());

        broadcaster.add(eo);

        return Either.right(eo);
    }

    private Either<Status, @Nullable Void> handleDeleteBus(DeleteBus bus) throws SuspendExecution {
        final Either<Status, @Nullable Void> mDeleted = runTransaction(conf -> {
            // TODO merge queries
            // TODO is the case where the bus does not exist covered? (no!)
            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).where(BUSES.ID.eq(bus.bId)
                            .and(USERS_WORKSPACES.USERNAME.eq(bus.user)).and(USERS_WORKSPACES.WORKSPACE_ID.eq(wId)))
                    .fetchOne();

            if (user == null) {
                return Either.left(Status.FORBIDDEN);
            }

            int deleted = DSL.using(conf).deleteFrom(BUSES).where(BUSES.ID.eq(bus.bId)).execute();

            if (deleted < 1) {
                return Either.left(Status.NOT_FOUND);
            }

            return Either.right(null);
        });

        mDeleted.forEach(v -> broadcast(WorkspaceChange.busDeleted(new BusDeleted(bus.bId))));

        return mDeleted;
    }

    private Either<Status, BusInProgress> handleImportBus(ImportBus bus) throws SuspendExecution {
        final NewBus nb = bus.nb;

        final Either<Status, Long> mbId = runTransaction(conf -> {
            // TODO merge queries
            Record user = DSL.using(conf).selectFrom(USERS_WORKSPACES)
                    .where(USERS_WORKSPACES.WORKSPACE_ID.eq(wId).and(USERS_WORKSPACES.USERNAME.eq(bus.user)))
                    .fetchOne();

            if (user == null) {
                return Either.left(Status.FORBIDDEN);
            }

            BusesRecord br = new BusesRecord(null, wId, false, nb.ip, nb.port, nb.username, nb.password, nb.passphrase,
                    null, null);
            br.attach(conf);
            br.insert();

            return Either.right(br.getId());
        });

        // we use a fiber to let the actor handles other message during bus import
        mbId.forEach(bId -> importBusInFiber(nb, bId));

        return mbId.map(bId -> new BusInProgress(bId, nb.ip, nb.port, nb.username));
    }

    private void importBusInFiber(final NewBus nb, final long bId) {
        new Fiber<>(() -> {
            // this can be interrupted by Fiber.cancel
            final Either<String, Domain> res = doImportExistingBus(nb);

            // once we got the topology, it can't be cancelled anymore
            // that's why the actions are passed back to the actor
            // (we don't want the fiber to be interrupted!)
            doInActorLoop(
                    () -> runTransaction(conf -> res.<Either<String, WorkspaceContent>> fold(Either::left, topology -> {
                        try {
                            return Either.right(WorkspaceContent.buildAndSaveToDatabase(conf, bId, topology));
                        } catch (WorkspaceContent.InvalidPetalsBus e) {
                            return Either.left(e.getMessage());
                        }
                    }).fold(error -> {
                        LOG.info("Can't import bus from container {}:{}: {}", nb.ip, nb.port, error);
                        DSL.using(conf).update(BUSES).set(BUSES.IMPORT_ERROR, error).where(BUSES.ID.eq(bId)).execute();
                        return WorkspaceChange
                                .busImportError(new BusInProgress(bId, nb.ip, nb.port, nb.username, error));
                    }, content -> WorkspaceChange.busImportOk(content))));
        }).start();
    }

    // TODO in the future, there should be multiple methods like this for multiple type of imports
    @Suspendable
    private Either<String, Domain> doImportExistingBus(NewBus bus) {
        try {
            Domain topology = runBlockingAdmin(bus.ip, bus.port, bus.username, bus.password,
                    petals -> petals.newContainerAdministration().getTopology(bus.passphrase, true));
            return Either.right(topology);
        } catch (InterruptedException e) {
            return Either.left("Import cancelled");
        } catch (Exception e) {
            String m = e.getMessage();
            String message = m != null ? m : e.getClass().getName();

            LOG.debug("Can't import bus from container {}:{}", bus.ip, bus.port, e);

            return Either.left(message);
        }
    }

    private Either<Status, ComponentOverview> handleComponentStateChange(ChangeComponentState change)
            throws SuspendExecution {
        return runTransaction(conf -> {
            ComponentsRecord comp = DSL.using(conf).selectFrom(COMPONENTS).where(COMPONENTS.ID.eq(change.compId)).fetchOne();
            
            if (comp == null) {
                return Either.left(Status.NOT_FOUND);
            }
            
            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(COMPONENTS)
                    .onKey(FK_COMPONENTS_CONTAINERS_ID).where(COMPONENTS.ID.eq(change.compId)
                            .and(USERS_WORKSPACES.USERNAME.eq(change.user)).and(USERS_WORKSPACES.WORKSPACE_ID.eq(wId)))
                    .fetchOne();

            if (user == null) {
                return Either.left(Status.FORBIDDEN);
            }
            
            return handleComponentStateChange(change, comp, conf);
        });
    }

    private Either<Status, ComponentOverview> handleComponentStateChange(ChangeComponentState change,
            ComponentsRecord comp, Configuration conf) throws Exception {

        ComponentMin.State currentState = ComponentMin.State.valueOf(comp.getState());

        if (currentState.equals(change.newState)) {
            return Either.right(new ComponentOverview(comp.getId(), comp.getName(), currentState,
                    ComponentMin.Type.valueOf(comp.getType())));
        }

        if (!isComponentStateTransitionOk(comp, currentState, change.newState)) {
            // TODO or should I rely on the information from the container instead of my own?
            return Either.left(Status.CONFLICT);
        }

        if (change.newState == ComponentMin.State.Unloaded
                && DSL.using(conf).fetchExists(SERVICEUNITS, SERVICEUNITS.COMPONENT_ID.eq(comp.getId()))) {
            // TODO or should I rely on the information from the container instead of my own?
            return Either.left(Status.CONFLICT);
        }

        // TODO merge with previous requests...
        ContainersRecord cont = DSL.using(conf).selectFrom(CONTAINERS).where(CONTAINERS.ID.eq(comp.getContainerId()))
                .fetchOne();
        assert cont != null;

        // we already are in a thread pool
        ComponentOverview res = runAdmin(cont.getIp(), cont.getPort(), cont.getUsername(), cont.getPassword(),
                petals -> {
                    ArtifactAdministration aa = petals.newArtifactAdministration();
                    Artifact a = aa.getArtifact(comp.getType(), comp.getName(), null);
                    assert a instanceof Component;
                    Component compo = (Component) a;
                    ComponentMin.State newState = changeComponentState(petals, compo, change.newState);
                    return new ComponentOverview(comp.getId(), comp.getName(), newState,
                            ComponentMin.Type.valueOf(comp.getType()));
                });
        assert res != null;

        componentStateUpdated(res, conf);

        return Either.right(res);
    }

    /**
     * Note : petals admin does not expose a way to go to shutdown (except from {@link ComponentMin.State#Unloaded} via
     * {@link ArtifactLifecycle#deploy(java.net.URL)}, but we don't support it yet!)
     */
    private boolean isComponentStateTransitionOk(ComponentsRecord comp, ComponentMin.State from,
            ComponentMin.State to) {
        switch (from) {
            case Loaded:
                return to == ComponentMin.State.Unloaded; // via undeploy()
            case Shutdown:
                return to == ComponentMin.State.Unloaded // via undeploy()
                        || to == ComponentMin.State.Started; // via start()
            case Started:
                return to == ComponentMin.State.Stopped; // via stop()
            case Stopped:
                return to == ComponentMin.State.Started // via start()
                        || to == ComponentMin.State.Unloaded; // via undeploy()
            default:
                LOG.warn("Impossible case for state transition check from {} to {} for Component {} ({})", from, to,
                        comp.getName(), comp.getId());
                return false;
        }
    }

    private ComponentMin.State changeComponentState(PetalsAdministration petals, Component comp,
            ComponentMin.State desiredState) throws ArtifactAdministrationException {
        ComponentLifecycle sal = petals.newArtifactLifecycleFactory().createComponentLifecycle(comp);
        switch (desiredState) {
            case Unloaded:
                sal.undeploy();
                break;
            case Started:
                sal.start();
                break;
            case Stopped:
                sal.stop();
                break;
            default:
                LOG.warn("Impossible case for state transition from {} to {} for Component {} ({})", comp.getState(),
                        desiredState, comp.getName());
        }
        if (desiredState != ComponentMin.State.Unloaded) {
            sal.updateState();
            return ComponentMin.State.from(comp.getState());
        } else {
            // we can't call updateState for this one, it will fail since it has been unloaded
            return ComponentMin.State.Unloaded;
        }
    }

    private void componentStateUpdated(ComponentMin comp, Configuration conf) throws SuspendExecution {
        // TODO error handling???
        if (comp.state != ComponentMin.State.Unloaded) {
            DSL.using(conf).update(COMPONENTS).set(COMPONENTS.STATE, comp.state.name()).where(COMPONENTS.ID.eq(comp.id))
                    .execute();
        } else {
            DSL.using(conf).deleteFrom(COMPONENTS).where(COMPONENTS.ID.eq(comp.id)).execute();
        }

        // we want the event to be sent after we answered
        doInActorLoop(() -> WorkspaceChange.componentStateChange(new NewComponentState(comp.id, comp.state)));
    }

    private Either<Status, ServiceUnitOverview> handleSUStateChange(ChangeServiceUnitState change)
            throws SuspendExecution {
        return runTransaction(conf -> {
            // TODO merge queries
            ServiceunitsRecord su = DSL.using(conf).selectFrom(SERVICEUNITS).where(SERVICEUNITS.ID.eq(change.suId))
                    .fetchOne();

            if (su == null) {
                return Either.left(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).select().from(USERS_WORKSPACES).join(BUSES)
                    .on(BUSES.WORKSPACE_ID.eq(USERS_WORKSPACES.WORKSPACE_ID)).join(CONTAINERS)
                    .onKey(FK_CONTAINERS_BUSES_ID).join(COMPONENTS).onKey(FK_COMPONENTS_CONTAINERS_ID)
                    .join(SERVICEUNITS)
                    .onKey(FK_SERVICEUNITS_COMPONENTS_ID).where(SERVICEUNITS.ID.eq(change.suId)
                            .and(USERS_WORKSPACES.USERNAME.eq(change.user)).and(USERS_WORKSPACES.WORKSPACE_ID.eq(wId)))
                    .fetchOne();

            if (user == null) {
                return Either.left(Status.FORBIDDEN);
            }

            return handleSUStateChange(change, su, conf);
        });
    }

    private Either<Status, ServiceUnitOverview> handleSUStateChange(ChangeServiceUnitState change,
            ServiceunitsRecord su, Configuration conf) throws Exception {

        ServiceUnitMin.State currentState = ServiceUnitMin.State.valueOf(su.getState());

        if (currentState.equals(change.newState)) {
            return Either.right(new ServiceUnitOverview(su.getId(), su.getName(), currentState, su.getSaName()));
        }

        if (!isSAStateTransitionOk(su, currentState, change.newState)) {
            // TODO or should I rely on the information from the container instead of my own?
            return Either.left(Status.CONFLICT);
        }

        // TODO merge with previous request...
        ContainersRecord cont = DSL.using(conf).select().from(CONTAINERS).join(COMPONENTS)
                .onKey(FK_COMPONENTS_CONTAINERS_ID).where(COMPONENTS.ID.eq(su.getComponentId()))
                .fetchOneInto(CONTAINERS);
        assert cont != null;

        // we already are in a thread pool
        ServiceUnitOverview res = runAdmin(cont.getIp(), cont.getPort(), cont.getUsername(), cont.getPassword(),
                petals -> {
                    ArtifactAdministration aa = petals.newArtifactAdministration();
                    Artifact a = aa.getArtifact(ServiceAssembly.TYPE, su.getSaName(), null);
                    assert a instanceof ServiceAssembly;
                    ServiceAssembly sa = (ServiceAssembly) a;
                    ServiceUnitMin.State newState = changeSAState(petals, sa, change.newState);
                    return new ServiceUnitOverview(su.getId(), su.getName(), newState, su.getSaName());
                });
        assert res != null;

        serviceUnitStateUpdated(res, conf);

        return Either.right(res);
    }

    private void serviceUnitStateUpdated(ServiceUnitMin su, Configuration conf) throws SuspendExecution {
        // TODO error handling???
        if (su.state != ServiceUnitMin.State.Unloaded) {
            DSL.using(conf).update(SERVICEUNITS).set(SERVICEUNITS.STATE, su.state.name())
                    .where(SERVICEUNITS.ID.eq(su.id)).execute();
        } else {
            DSL.using(conf).deleteFrom(SERVICEUNITS).where(SERVICEUNITS.ID.eq(su.id)).execute();
        }

        // we want the event to be sent after we answered
        doInActorLoop(() -> WorkspaceChange.suStateChange(new NewSUState(su.id, su.state)));
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
            default:
                LOG.warn("Impossible case for state transition check from {} to {} for SU {} ({})", from, to,
                        su.getName(), su.getId());
                return false;
        }
    }

    private ServiceUnitMin.State changeSAState(PetalsAdministration petals, ServiceAssembly sa,
            ServiceUnitMin.State desiredState) throws ArtifactAdministrationException {
        ServiceAssemblyLifecycle sal = petals.newArtifactLifecycleFactory().createServiceAssemblyLifecycle(sa);
        switch (desiredState) {
            case Unloaded:
                sal.undeploy();
                break;
            case Started:
                sal.start();
                break;
            case Stopped:
                sal.stop();
                break;
            default:
                LOG.warn("Impossible case for state transition from {} to {} for SA {} ({})", sa.getState(),
                        desiredState, sa.getName());
        }
        if (desiredState != ServiceUnitMin.State.Unloaded) {
            sal.updateState();
            return ServiceUnitMin.State.from(sa.getState());
        } else {
            // we can't call updateState for this one, it will fail since it has been unloaded
            return ServiceUnitMin.State.Unloaded;
        }
    }

    public interface Msg {
        // marker interface for messages to this actor
    }

    public static class WorkspaceRequest<T> extends CockpitRequest<T> implements Msg {

        private static final long serialVersionUID = -564899978996631515L;

        public WorkspaceRequest(String user) {
            super(user);
        }
    }

    public static class NewWorkspaceClient extends WorkspaceRequest<EventOutput> {

        private static final long serialVersionUID = 1L;

        public NewWorkspaceClient(String user) {
            super(user);
        }
    }

    public static class ImportBus extends WorkspaceRequest<BusInProgress> {

        private static final long serialVersionUID = 1286574765918364762L;

        final NewBus nb;

        public ImportBus(String user, NewBus nb) {
            super(user);
            this.nb = nb;
        }
    }

    public static class DeleteBus extends WorkspaceRequest<@Nullable Void> {

        private static final long serialVersionUID = 1L;

        final long bId;

        public DeleteBus(String user, long bId) {
            super(user);
            this.bId = bId;
        }
    }

    public static class ChangeServiceUnitState extends WorkspaceRequest<ServiceUnitOverview> {

        private static final long serialVersionUID = 8119375036012239516L;

        final ServiceUnitMin.State newState;

        final long suId;

        public ChangeServiceUnitState(String user, long suId, ServiceUnitMin.State newState) {
            super(user);
            this.suId = suId;
            this.newState = newState;
        }
    }

    public static class ChangeComponentState extends WorkspaceRequest<ComponentOverview> {

        private static final long serialVersionUID = 8119375036012239516L;

        final ComponentMin.State newState;

        final long compId;

        public ChangeComponentState(String user, long compId, ComponentMin.State newState) {
            super(user);
            this.compId = compId;
            this.newState = newState;
        }
    }

    /**
     * Uses with {@link WorkspaceActor#doInActorLoop(SuspendableCallable)}
     */
    public static class WorkspaceEventAction implements Msg {

        final SuspendableCallable<WorkspaceChange> action;

        public WorkspaceEventAction(SuspendableCallable<WorkspaceChange> action) {
            this.action = action;
        }
    }
}
