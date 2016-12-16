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
package org.ow2.petals.cockpit.server.actors;

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.ws.rs.core.Response.Status;

import org.ow2.petals.admin.api.ArtifactAdministration;
import org.ow2.petals.admin.api.ContainerAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.artifact.Artifact;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.lifecycle.ServiceAssemblyLifecycle;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.BusActor.ForBusMsg;
import org.ow2.petals.cockpit.server.actors.BusActor.GetContainerOverview;
import org.ow2.petals.cockpit.server.actors.CockpitActors.CockpitRequest;
import org.ow2.petals.cockpit.server.actors.ContainerActor.Msg;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.WorkspaceEventMsg;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbContainer;
import org.ow2.petals.cockpit.server.resources.ContainerResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.ContainerResource.ContainerOverview;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinServiceUnit;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinServiceUnit.State;
import org.ow2.petals.cockpit.server.resources.ContainerResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.NewSUState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceEvent;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ComponentTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.SUTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.Tuple;
import javaslang.Tuple2;
import javaslang.collection.List;
import javaslang.control.Either;
import javaslang.control.Option;

public class ContainerActor extends CockpitActor<Msg> {

    private static final Logger LOG = LoggerFactory.getLogger(ContainerActor.class);

    private static final long serialVersionUID = -6353310817718062675L;

    private ContainerTree tree;

    private DbContainer db = new DbContainer(0, "", "", 0, "", "");

    private final ActorRef<WorkspaceActor.Msg> workspace;

    private final ActorRef<BusActor.Msg> bus;

    public ContainerActor(ContainerTree container, ActorRef<WorkspaceActor.Msg> workspace, ActorRef<BusActor.Msg> bus) {
        // TODO better manage the ContainerTree!
        this.tree = container;
        this.workspace = workspace;
        this.bus = bus;
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {

        db = runDAO(() -> buses.getContainerById(tree.id));

        for (;;) {
            Msg msg = receive();
            if (msg instanceof GetContainerOverviewFromBus) {
                GetContainerOverviewFromBus get = (GetContainerOverviewFromBus) msg;
                assert get.get.cId == db.id;
                try {
                    final Tuple2<Domain, String> topology = runAdmin(db.ip, db.port, db.username, db.password,
                            petals -> {
                                ContainerAdministration admin = petals.newContainerAdministration();
                                Domain domain = admin.getTopology(null, false);
                                String sysInfo = admin.getSystemInfo();
                                return Tuple.of(domain, sysInfo);
                            });

                    Map<String, String> reachabilities = javaslang.collection.List.ofAll(topology._1.getContainers())
                            // remove myself
                            .filter(c -> !Objects.equals(db.name, c.getContainerName()))
                            // get the ids (if they exist) TODO what do I do with unknown container names?
                            .flatMap(c -> Option.of(get.ids.get(c.getContainerName())).map(i -> Tuple.of(i, c)))
                            // transform to a reachability information
                            .toJavaMap(p -> p.map((i, c) -> Tuple.of(Long.toString(i), c.getState().name())));
                    RequestReplyHelper.reply(get.get, Either
                            .right(new ContainerOverview(db.id, db.name, db.ip, db.port, reachabilities, topology._2)));
                } catch (Exception e) {
                    RequestReplyHelper.replyError(get.get, e);
                }
            } else if (msg instanceof GetComponentOverview) {
                GetComponentOverview get = (GetComponentOverview) msg;
                assert get.cId == db.id;
                RequestReplyHelper.reply(get, getComponent(get.compId)
                        .map(c -> new ComponentOverview(c.id, c.name, c.state, c.type)).toRight(Status.NOT_FOUND));
            } else if (msg instanceof GetServiceUnitOverview) {
                GetServiceUnitOverview get = (GetServiceUnitOverview) msg;
                assert get.cId == db.id;
                RequestReplyHelper.reply(get,
                        getServiceUnit(get.compId, get.suId)
                                .map(su -> new ServiceUnitOverview(su.id, su.name, su.state, su.saName))
                                .toRight(Status.NOT_FOUND));
            } else if (msg instanceof ChangeServiceUnitState) {
                ChangeServiceUnitState change = (ChangeServiceUnitState) msg;
                assert change.cId == db.id;
                Option<SUTree> msu = getServiceUnit(change.compId, change.suId);
                if (!msu.isDefined()) {
                    RequestReplyHelper.reply(change, Either.left(Status.NOT_FOUND));
                } else {
                    handleSUStateChange(change, msu.get());
                }
            } else {
                LOG.warn("Unexpected event for container {}: {}", db.id, msg);
            }
        }
    }

    private void handleSUStateChange(ChangeServiceUnitState change, SUTree su)
            throws SuspendExecution, InterruptedException {
        if (su.state.equals(change.newState)) {
            RequestReplyHelper.reply(change,
                    Either.right(new ServiceUnitOverview(su.id, su.name, su.state, su.saName)));
        } else if (!isSAStateTransitionOk(su, change.newState)) {
            // TODO or should I rely on the information from the container instead of my own?
            RequestReplyHelper.reply(change, Either.left(Status.CONFLICT));
        } else {
            try {
                SUTree res = runAdmin(db.ip, db.port, db.username, db.password, petals -> {
                    ArtifactAdministration aa = petals.newArtifactAdministration();
                    Artifact a = aa.getArtifact(ServiceAssembly.TYPE, su.saName, null);
                    assert a instanceof ServiceAssembly;
                    ServiceAssembly sa = (ServiceAssembly) a;
                    changeSAState(petals, sa, change.newState);
                    return new SUTree(su.id, su.name, MinServiceUnit.State.from(sa.getState()), su.saName);
                });
                assert res != null;

                serviceUnitStateUpdated(res);
                RequestReplyHelper.reply(change,
                        Either.right(new ServiceUnitOverview(res.id, res.name, res.state, res.saName)));
            } catch (Exception e) {
                RequestReplyHelper.replyError(change, e);
            }
        }
    }

    private void serviceUnitStateUpdated(SUTree su) throws SuspendExecution, InterruptedException {
        // TODO error handling???
        // TODO I should have a suDb for it, no?
        runDAO(() -> buses.updateServiceUnitState(su.id, su.state));
        tree = updateSUinTree(tree, su);
        workspace.send(new WorkspaceEventMsg(WorkspaceEvent.suStateChange(new NewSUState(su.id, su.state))));
    }

    private static ContainerTree updateSUinTree(ContainerTree tree, SUTree su) {
        return new ContainerTree(tree.id, tree.name,
                tree.components.stream().map(c -> updateSUinTree(c, su)).collect(Collectors.toList()));
    }

    private static ComponentTree updateSUinTree(ComponentTree tree, SUTree su) {
        return new ComponentTree(tree.id, tree.name, tree.state, tree.type,
                tree.serviceUnits.stream().map(t -> t.id == su.id ? su : t).collect(Collectors.toList()));
    }

    /**
     * 
     * Note : petals admin does not expose a way to go to shutdown (except from {@link MinServiceUnit.State#Unloaded},
     * but we don't support it yet!)
     */
    private boolean isSAStateTransitionOk(SUTree su, MinServiceUnit.State to) {
        switch (su.state) {
            case Shutdown:
                return to == State.Unloaded || to == State.Started;
            case Started:
                return to == State.Stopped;
            case Stopped:
                return to == State.Started || to == State.Unloaded;
            default:
                LOG.warn("Impossible case for state transition check from {} to {} for SU {} ({})", su.state, to,
                        su.name, su.id);
                return false;
        }
    }

    private void changeSAState(PetalsAdministration petals, ServiceAssembly sa, State desiredState)
            throws ArtifactAdministrationException {
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
        sal.updateState();
    }

    private Option<SUTree> getServiceUnit(long compId, long suId) {
        return getComponent(compId).flatMap(c -> List.ofAll(c.serviceUnits).find(su -> su.id == suId));
    }

    private Option<ComponentTree> getComponent(long compId) {
        return List.ofAll(tree.components).find(c -> c.id == compId);
    }

    public interface Msg {
        // marker interface for messages to this actor
    }

    /**
     * Meant to be forwarded to container by bus (and before by workspace)
     */
    public interface ForContainerMsg extends ContainerActor.Msg, ForBusMsg {
        long getContainerId();
    }

    public static class ForContainerRequest<T> extends CockpitRequest<T> implements ForContainerMsg {

        private static final long serialVersionUID = 308263095400474513L;

        final long bId;

        final long cId;

        public ForContainerRequest(String user, long bId, long cId) {
            super(user);
            this.bId = bId;
            this.cId = cId;
        }

        @Override
        public long getContainerId() {
            return cId;
        }

        @Override
        public long getBusId() {
            return bId;
        }
    }

    public static class ForComponentRequest<T> extends ForContainerRequest<T> {

        private static final long serialVersionUID = -7710132982021451498L;

        final long compId;

        public ForComponentRequest(String user, long bId, long cId, long compId) {
            super(user, bId, cId);
            this.compId = compId;
        }
    }

    public static class GetComponentOverview extends ForComponentRequest<ComponentOverview> {

        private static final long serialVersionUID = -7710132982021451498L;

        public GetComponentOverview(String user, long bId, long cId, long compId) {
            super(user, bId, cId, compId);
        }
    }

    public static class ForServiceUnitRequest<T> extends ForComponentRequest<T> {

        private static final long serialVersionUID = -9164203963795147371L;

        final long suId;

        public ForServiceUnitRequest(String user, long bId, long cId, long compId, long suId) {
            super(user, bId, cId, compId);
            this.suId = suId;
        }
    }

    public static class GetServiceUnitOverview extends ForServiceUnitRequest<ServiceUnitOverview> {

        private static final long serialVersionUID = -9164203963795147371L;

        public GetServiceUnitOverview(String user, long bId, long cId, long compId, long suId) {
            super(user, bId, cId, compId, suId);
        }
    }

    public static class ChangeServiceUnitState extends ForServiceUnitRequest<ServiceUnitOverview> {

        private static final long serialVersionUID = 8119375036012239516L;

        final State newState;

        public ChangeServiceUnitState(String user, long bId, long cId, long compId, long suId, State newState) {
            super(user, bId, cId, compId, suId);
            this.newState = newState;
        }
    }

    public static class GetContainerOverviewFromBus implements Msg {

        final Map<String, Long> ids;

        final GetContainerOverview get;

        public GetContainerOverviewFromBus(GetContainerOverview get, Map<String, Long> ids) {
            this.get = get;
            this.ids = ids;
        }
    }
}
