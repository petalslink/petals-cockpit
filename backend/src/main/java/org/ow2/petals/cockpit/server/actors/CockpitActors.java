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

import java.util.Optional;

import javax.inject.Inject;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.core.Response.Status;

import org.glassfish.hk2.api.ServiceLocator;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.actors.behaviors.RequestMessage;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.control.Either;

public class CockpitActors {

    private final ServiceLocator serviceLocator;

    private final WorkspacesDAO workspaces;

    @Inject
    public CockpitActors(ServiceLocator serviceLocator, WorkspacesDAO workspaces) {
        this.serviceLocator = serviceLocator;
        this.workspaces = workspaces;
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
    @SuppressWarnings("resource")
    public Optional<ActorRef<WorkspaceActor.Msg>> getWorkspace(long wId) throws SuspendExecution {
        String name = "workspace-" + wId;

        ActorRef<Msg> a = ActorRegistry.tryGetActor(name);

        if (a == null) {
            DbWorkspace ws = workspaces.getWorkspaceById(wId);
            if (ws != null) {
                a = ActorRegistry.getOrRegisterActor(name, () -> {
                    WorkspaceActor workspaceActor = new WorkspaceActor(ws);
                    serviceLocator.inject(workspaceActor);
                    return workspaceActor;
                });
            }
        }

        return Optional.ofNullable(a);
    }

    /**
     * TODO instead of doing that, we could simply pass the request to the actor that will answer it with an
     * {@link AsyncResponse}.
     */
    @SuppressWarnings("resource")
    public <O, I extends Request<O> & WorkspaceActor.Msg> Either<Status, O> call(long wsId, I msg)
            throws InterruptedException {
        try {
            Optional<ActorRef<Msg>> ma = getWorkspace(wsId);
            if (ma.isPresent()) {
                ActorRef<Msg> a = ma.get();
                return RequestReplyHelper.call(a, msg);
            } else {
                return Either.left(Status.NOT_FOUND);
            }
        } catch (SuspendExecution e) {
            throw new AssertionError(e);
        }
    }

    public abstract static class Request<R> extends RequestMessage<Either<Status, R>> {

        private static final long serialVersionUID = -5915325922592086753L;

        final String user;

        public Request(String user) {
            this.user = user;
        }
    }

}
