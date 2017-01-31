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

import java.io.IOException;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.io.EofException;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseBroadcaster;
import org.glassfish.jersey.server.BroadcasterListener;
import org.glassfish.jersey.server.ChunkedOutput;
import org.ow2.petals.admin.api.ArtifactAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.artifact.Artifact;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.lifecycle.ServiceAssemblyLifecycle;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.CockpitActors.CockpitRequest;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbContainer;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbServiceUnit;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin.State;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInError;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.BusInProgress;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.NewBus;
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
                answer((DeleteBus) msg, b -> {
                    final int deleted = buses.delete(b.bId);
                    if (deleted < 1) {
                        return Either.left(Status.NOT_FOUND);
                    } else {
                        broadcast(WorkspaceChange.busDeleted(new BusDeleted(b.bId)));
                        return Either.right(null);
                    }
                });
            } else if (msg instanceof NewWorkspaceClient) {
                LOG.debug("New SSE client for workspace {}", wId);
                // this one is coming from the SSE resource
                answer((NewWorkspaceClient) msg, this::addBroadcastClient);
            } else if (msg instanceof ChangeServiceUnitState) {
                ChangeServiceUnitState change = (ChangeServiceUnitState) msg;
                DbServiceUnit su = run(() -> buses.getServiceUnitById(change.suId, change.user));
                if (su == null) {
                    RequestReplyHelper.reply(change, Either.left(Status.NOT_FOUND));
                } else if (su.acl == null) {
                    RequestReplyHelper.reply(change, Either.left(Status.FORBIDDEN));
                } else {
                    handleSUStateChange(change, su);
                }
            } else {
                LOG.warn("Unexpected event for workspace {}: {}", wId, msg);
            }
        }
    }

    private void doInActorLoop(SuspendableCallable<WorkspaceChange> action) throws SuspendExecution {
        self().send(new WorkspaceEventAction(action));
    }

    private Either<Status, EventOutput> addBroadcastClient(NewWorkspaceClient nc)
            throws IOException, SuspendExecution {

        // TODO ALL of this should be done in one transaction...
        Either<Status, WorkspaceFullContent> content = run(() -> {

            DbWorkspace ws = workspaces.getWorkspaceById(wId, nc.user);

            if (ws == null) {
                LOG.error("Couldn't find workspace {} in db while being inside its actor!", wId);
                return Either.left(Status.NOT_FOUND);
            }

            if (ws.acl == null) {
                return Either.left(Status.FORBIDDEN);
            }

            return Either.right(new WorkspaceFullContent(ws, workspaces.getWorkspaceUsers(wId),
                    WorkspaceContent.buildFromDatabase(buses, ws)));
        });

        if (content.isLeft()) {
            return Either.left(content.getLeft());
        } else {
            EventOutput eo = new EventOutput();

            eo.write(new OutboundEvent.Builder().name(WorkspaceChange.Type.WORKSPACE_CONTENT.name())
                    .mediaType(MediaType.APPLICATION_JSON_TYPE).data(content.get()).build());

            broadcaster.add(eo);

            return Either.right(eo);
        }
    }

    /**
     * This should only be called from inside the actor loop!
     */
    private void broadcast(WorkspaceChange event) {
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

    // TODO verify access rights? access is verified in resource for now...
    private Either<Status, BusInProgress> handleImportBus(ImportBus bus) throws SuspendExecution {
        final NewBus nb = bus.nb;

        final long bId = run(() -> buses.createBus(nb.ip, nb.port, nb.username, nb.password, nb.passphrase, wId));

        // we use a fiber to let the actor handles other message during bus import
        new Fiber<>(() -> {
            // this can be interrupted by Fiber.cancel
            final Either<String, Domain> res = doImportExistingBus(nb);

            // once we got the topology, it can't be cancelled anymore
            // that's why the actions are passed back to the actor
            // (we don't want the fiber to be interrupted!)
            doInActorLoop(() -> {
                return run(() -> {
                    return res.<Either<String, WorkspaceContent>> fold(Either::left, topology -> {
                        try {
                            return Either.right(buses.saveImport(bId, topology));
                        } catch (WorkspaceContent.InvalidPetalsBus e) {
                            return Either.left(e.getMessage());
                        }
                    }).fold(error -> {
                        LOG.info("Can't import bus from container {}:{}: {}", nb.ip, nb.port, error);
                        buses.saveError(bId, error);
                        return WorkspaceChange.busImportError(new BusInError(bId, nb.ip, nb.port, nb.username, error));
                    }, content -> WorkspaceChange.busImportOk(content));
                });
            });
        }).start();

        return Either.right(new BusInProgress(bId, nb.ip, nb.port, nb.username));
    }

    // TODO in the future, there should be multiple methods like this for multiple type of imports
    @Suspendable
    private Either<String, Domain> doImportExistingBus(NewBus bus) {
        try {
            Domain topology = runAdmin(bus.ip, bus.port, bus.username, bus.password,
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

    private void handleSUStateChange(ChangeServiceUnitState change, DbServiceUnit su) throws SuspendExecution {
        if (su.state.equals(change.newState)) {
            RequestReplyHelper.reply(change,
                    Either.right(new ServiceUnitOverview(su.id, su.name, su.state, su.saName)));
        } else if (!isSAStateTransitionOk(su, change.newState)) {
            // TODO or should I rely on the information from the container instead of my own?
            RequestReplyHelper.reply(change, Either.left(Status.CONFLICT));
        } else {
            DbContainer db = run(() -> buses.getContainerById(su.containerId, null));
            assert db != null;
            try {
                ServiceUnitOverview res = runAdmin(db.ip, db.port, db.username, db.password, petals -> {
                    ArtifactAdministration aa = petals.newArtifactAdministration();
                    Artifact a = aa.getArtifact(ServiceAssembly.TYPE, su.saName, null);
                    assert a instanceof ServiceAssembly;
                    ServiceAssembly sa = (ServiceAssembly) a;
                    State newState = changeSAState(petals, sa, change.newState);
                    return new ServiceUnitOverview(su.id, su.name, newState, su.saName);
                });
                assert res != null;

                serviceUnitStateUpdated(res);

                RequestReplyHelper.reply(change, Either.right(res));
            } catch (Exception e) {
                RequestReplyHelper.replyError(change, e);
            }
        }
    }

    private void serviceUnitStateUpdated(ServiceUnitMin su) throws SuspendExecution {
        // TODO error handling???
        run(() -> su.state != ServiceUnitMin.State.Unloaded ? buses.updateServiceUnitState(su.id, su.state)
                : buses.removeServiceUnit(su.id));

        // we want the event to be sent after we answered
        doInActorLoop(() -> WorkspaceChange.suStateChange(new NewSUState(su.id, su.state)));
    }

    /**
     * 
     * Note : petals admin does not expose a way to go to shutdown (except from {@link ServiceUnitMin.State#Unloaded},
     * but we don't support it yet!)
     */
    private boolean isSAStateTransitionOk(DbServiceUnit su, ServiceUnitMin.State to) {
        switch (su.state) {
            case Shutdown:
                return to == ServiceUnitMin.State.Unloaded || to == ServiceUnitMin.State.Started;
            case Started:
                return to == ServiceUnitMin.State.Stopped;
            case Stopped:
                return to == ServiceUnitMin.State.Started || to == ServiceUnitMin.State.Unloaded;
            default:
                LOG.warn("Impossible case for state transition check from {} to {} for SU {} ({})", su.state, to,
                        su.name, su.id);
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

        final State newState;

        final long suId;

        public ChangeServiceUnitState(String user, long suId, State newState) {
            super(user);
            this.suId = suId;
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
