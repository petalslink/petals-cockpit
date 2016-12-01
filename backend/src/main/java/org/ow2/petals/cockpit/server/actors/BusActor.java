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

import javax.inject.Inject;

import org.ow2.petals.cockpit.server.actors.BusActor.Msg;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.BasicActor;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.control.Either;

public class BusActor extends BasicActor<Msg, Void> {

    private static final Logger LOG = LoggerFactory.getLogger(BusActor.class);

    private static final long serialVersionUID = -6353310817718062675L;

    private final BusTree bus;

    private final ActorRef<WorkspaceActor.Msg> workspace;

    @Inject
    private BusesDAO buses;

    public BusActor(BusTree bus, ActorRef<WorkspaceActor.Msg> workspace) {
        this.bus = bus;
        this.workspace = workspace;
    }

    @Override
    @SuppressWarnings("squid:S2189")
    protected Void doRun() throws InterruptedException, SuspendExecution {
        for (;;) {
            Msg msg = receive();
            if (msg instanceof GetOverview) {
                GetOverview get = (GetOverview) msg;
                assert get.bId == bus.id;
                RequestReplyHelper.reply(get, Either.right(new BusOverview(bus.name)));
            } else {
                LOG.warn("Unexpected event for bus {}: {}", bus.id, msg);
            }
        }
    }

    public interface Msg {
        // marker interface for messages to this actor

        long getBusId();
    }

    public static class BusRequest<T> extends CockpitActors.Request<T> implements Msg, WorkspaceActor.Msg {

        private static final long serialVersionUID = -564899978996631515L;

        final long bId;

        public BusRequest(String user, long bId) {
            super(user);
            this.bId = bId;
        }

        @Override
        public long getBusId() {
            return bId;
        }
    }

    public static class GetOverview extends BusRequest<BusOverview> {

        private static final long serialVersionUID = -2520646870000161079L;

        public GetOverview(String user, long bId) {
            super(user, bId);
        }
    }

}
