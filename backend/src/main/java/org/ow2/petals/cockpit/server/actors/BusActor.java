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

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.ws.rs.core.Response.Status;

import org.ow2.petals.cockpit.server.actors.BusActor.Msg;
import org.ow2.petals.cockpit.server.actors.CockpitActors.CockpitRequest;
import org.ow2.petals.cockpit.server.actors.ContainerActor.ForContainerMsg;
import org.ow2.petals.cockpit.server.actors.ContainerActor.GetContainerOverviewFromBus;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBus;
import org.ow2.petals.cockpit.server.db.BusesDAO.DbBusImported;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusOverview;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.ContainerTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.Tuple;
import javaslang.control.Either;

public class BusActor extends CockpitActor<Msg> {

    private static final Logger LOG = LoggerFactory.getLogger(BusActor.class);

    private static final long serialVersionUID = -6353310817718062675L;

    private final BusTree tree;

    private DbBusImported db = new DbBusImported(0, "", 0, "", "", "", "");

    private final ActorRef<WorkspaceActor.Msg> workspace;

    private final Map<Long, ActorRef<ContainerActor.Msg>> busContainers = new HashMap<>();

    public BusActor(BusTree bus, ActorRef<WorkspaceActor.Msg> workspace) {
        // TODO better manage the BusTree!
        this.tree = bus;
        this.workspace = workspace;
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {

        DbBus b = runDAO(() -> buses.getBusById(tree.id));

        assert b instanceof DbBusImported : tree.id;

        db = (DbBusImported) b;

        for (ContainerTree c : tree.containers) {
            busContainers.put(c.id, as.getActor(new ContainerActor(c, workspace, self())));
        }

        for (;;) {
            Msg msg = receive();
            if (msg instanceof GetBusOverview) {
                GetBusOverview get = (GetBusOverview) msg;
                assert get.bId == db.id;
                RequestReplyHelper.reply(get, Either.right(new BusOverview(db.id, db.name)));
            } else if (msg instanceof ForContainerMsg && msg instanceof CockpitRequest) {
                // requests for container actor
                forward((CockpitRequest<?> & ForContainerMsg) msg);
            } else if (msg instanceof GetContainerOverview) {
                // this request is a bit specific so we handle it differently
                GetContainerOverview get = (GetContainerOverview) msg;
                // the container needs that information
                forward(get.cId, get, r -> {
                    Map<String, Long> ids = javaslang.collection.List.ofAll(tree.containers)
                            .toJavaMap(c -> Tuple.of(c.name, c.id));
                    return new GetContainerOverviewFromBus(r, ids);
                });
            } else {
                LOG.warn("Unexpected event for bus {}: {}", db.id, msg);
            }
        }
    }

    public <R extends CockpitRequest<?> & ForContainerMsg> void forward(R req) throws SuspendExecution {
        forward(req.getContainerId(), req, m -> m);
    }

    public <R extends CockpitRequest<?>> void forward(long id, R req, Function<R, ContainerActor.Msg> f)
            throws SuspendExecution {
        @SuppressWarnings("resource")
        ActorRef<ContainerActor.Msg> container = busContainers.get(id);
        if (container == null) {
            RequestReplyHelper.reply(req, Either.left(Status.NOT_FOUND));
        } else {
            container.send(f.apply(req));
        }
    }

    public interface Msg {
        // marker interface for messages to this actor
    }

    /**
     * Meant to be forwarded to bus by workspace
     */
    public interface ForBusMsg extends BusActor.Msg, WorkspaceActor.Msg {
        long getBusId();
    }

    public static class ForBusRequest<T> extends CockpitRequest<T> implements ForBusMsg {

        private static final long serialVersionUID = -564899978996631515L;

        final long bId;

        public ForBusRequest(String user, long bId) {
            super(user);
            this.bId = bId;
        }

        @Override
        public long getBusId() {
            return bId;
        }
    }

    public static class GetBusOverview extends ForBusRequest<BusOverview> {

        private static final long serialVersionUID = -2520646870000161079L;

        public GetBusOverview(String user, long bId) {
            super(user, bId);
        }
    }

    public static class GetContainerOverview extends ForBusRequest<ContainerOverview> {

        private static final long serialVersionUID = -2520646870000161079L;

        final long cId;

        public GetContainerOverview(String user, long bId, long cId) {
            super(user, bId);
            this.cId = cId;
        }
    }
}
