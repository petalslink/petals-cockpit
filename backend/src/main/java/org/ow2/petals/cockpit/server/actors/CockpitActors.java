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

import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import javax.inject.Inject;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.core.Response.Status;

import org.glassfish.hk2.api.ServiceLocator;
import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.actors.behaviors.RequestMessage;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;

public class CockpitActors {

    private final ServiceLocator serviceLocator;

    private final Configuration jooq;

    @Inject
    public CockpitActors(ServiceLocator serviceLocator, Configuration jooq) {
        this.serviceLocator = serviceLocator;
        this.jooq = jooq;
    }

    public <M> ActorRef<M> getActor(CockpitActor<M> actor) {
        serviceLocator.inject(actor);
        return actor.spawn();
    }

    /**
     * TODO instead of doing this, we could always create the actor and let it answer with {@link Status#NOT_FOUND} if
     * needed and then let it die... this would ensure proper concurrency handling for the db queries as well as make
     * things homogeneous w.r.t. to other actors?
     */
    public ActorRef<WorkspaceActor.Msg> getWorkspace(long wId) throws SuspendExecution {
        String name = "workspace-" + wId;

        ActorRef<Msg> a = ActorRegistry.tryGetActor(name);

        if (a == null) {
            if (!DSL.using(jooq).fetchExists(WORKSPACES, WORKSPACES.ID.eq(wId))) {
                throw new WebApplicationException(Status.NOT_FOUND);
            } else {
                return ActorRegistry.getOrRegisterActor(name, () -> {
                    WorkspaceActor workspaceActor = new WorkspaceActor(wId);
                    serviceLocator.inject(workspaceActor);
                    return workspaceActor;
                });
            }
        } else {
            return a;
        }
    }

    /**
     * TODO instead of doing that, we could simply pass the request to the actor that will answer it with an
     * {@link AsyncResponse}. The problem is that we would loose the static typing of each of the REST methods (as well
     * as the possibility to automatically generate documentation from it)
     */
    public <O, I extends CockpitRequest<O> & WorkspaceActor.Msg> O call(long wsId, I msg) throws InterruptedException {
        try {
            return RequestReplyHelper.call(getWorkspace(wsId), msg);
        } catch (SuspendExecution e) {
            throw new AssertionError(e);
        }
    }

    /**
     * This represents requests coming from the REST API (i.e. Jersey's Resources)
     */
    public abstract static class CockpitRequest<R> extends RequestMessage<R> {

        private static final long serialVersionUID = -5915325922592086753L;

        final String user;

        public CockpitRequest(String user) {
            this.user = user;
        }
    }
}
