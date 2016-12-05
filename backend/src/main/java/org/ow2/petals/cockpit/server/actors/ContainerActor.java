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

import javax.ws.rs.core.Response.Status;

import org.ow2.petals.admin.api.exception.ContainerAdministrationException;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.actors.ContainerActor.Msg;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbContainer;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerOverview;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ComponentTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.SUTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.Tuple;
import javaslang.collection.List;
import javaslang.control.Either;
import javaslang.control.Option;

public class ContainerActor extends CockpitActor<Msg> {

    private static final Logger LOG = LoggerFactory.getLogger(ContainerActor.class);

    private static final long serialVersionUID = -6353310817718062675L;

    private final ContainerTree tree;

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
            if (msg instanceof GetContainerOverview) {
                GetContainerOverview get = (GetContainerOverview) msg;
                assert get.cId == db.id;
                try {
                    final Domain topology = getTopology(db.ip, db.port, db.username, db.password, Option.none());
                    Map<String, String> reachabilities = javaslang.collection.List.ofAll(topology.getContainers())
                            .filter(c -> !Objects.equals(db.name, c.getContainerName()))
                            .toJavaMap(c -> Tuple.of(c.getContainerName(), c.getState().toString()));
                    RequestReplyHelper.reply(get,
                            Either.right(new ContainerOverview(db.id, db.name, db.ip, db.port, reachabilities)));
                } catch (ContainerAdministrationException e) {
                    RequestReplyHelper.replyError(get, e);
                }
            } else if (msg instanceof GetComponentOverview) {
                GetComponentOverview get = (GetComponentOverview) msg;
                assert get.cId == db.id;
                RequestReplyHelper.reply(get, getComponent(get.compId)
                        .map(c -> new ComponentOverview(c.id, c.name, c.state, c.type)).toRight(Status.NOT_FOUND));
            } else if (msg instanceof GetServiceUnitOverview) {
                GetServiceUnitOverview get = (GetServiceUnitOverview) msg;
                assert get.cId == db.id;
                RequestReplyHelper.reply(get, getServiceUnit(get.compId, get.suId)
                        .map(su -> new ServiceUnitOverview(su.id, su.name, su.state)).toRight(Status.NOT_FOUND));
            } else {
                LOG.warn("Unexpected event for container {}: {}", db.id, msg);
            }
        }
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

    public static class ContainerRequest<T> extends CockpitActors.Request<T> implements Msg {

        private static final long serialVersionUID = -564899978996631515L;

        public ContainerRequest(String user) {
            super(user);
        }
    }

    public interface ForwardedMsg extends Msg, BusActor.ForwardedMsg, WorkspaceActor.Msg {
        long getContainerId();
    }

    public static class ForwardedContainerRequest<T> extends ContainerRequest<T> implements ForwardedMsg {

        private static final long serialVersionUID = 308263095400474513L;

        final long bId;

        final long cId;

        public ForwardedContainerRequest(String user, long bId, long cId) {
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

    public static class GetContainerOverview extends ForwardedContainerRequest<ContainerOverview> {

        private static final long serialVersionUID = -2520646870000161079L;

        public GetContainerOverview(String user, long bId, long cId) {
            super(user, bId, cId);
        }
    }

    public static class GetComponentOverview extends ForwardedContainerRequest<ComponentOverview> {

        private static final long serialVersionUID = -7710132982021451498L;

        final long compId;

        public GetComponentOverview(String user, long bId, long cId, long compId) {
            super(user, bId, cId);
            this.compId = compId;
        }
    }

    public static class GetServiceUnitOverview extends ForwardedContainerRequest<ServiceUnitOverview> {

        private static final long serialVersionUID = -9164203963795147371L;

        final long compId;

        final long suId;

        public GetServiceUnitOverview(String user, long bId, long cId, long compId, long suId) {
            super(user, bId, cId);
            this.compId = compId;
            this.suId = suId;
        }
    }
}
