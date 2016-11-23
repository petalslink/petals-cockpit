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
import javax.ws.rs.core.Response.Status;

import org.glassfish.hk2.api.ServiceLocator;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.WorkspaceRequest;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.ActorRegistry;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.control.Either;

public class ActorsComponent {

    private final ServiceLocator serviceLocator;

    @Inject
    public ActorsComponent(ServiceLocator serviceLocator) {
        this.serviceLocator = serviceLocator;
    }

    @SuppressWarnings("resource")
    public Optional<ActorRef<Msg>> getWorkspace(long wId) throws SuspendExecution {
        String name = "workspace-" + wId;

        ActorRef<Msg> a = ActorRegistry.tryGetActor(name);

        if (a == null) {
            WorkspacesDAO workspaces = serviceLocator.getService(WorkspacesDAO.class);
            assert workspaces != null;
            DbWorkspace ws = workspaces.findById(wId);
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

    @SuppressWarnings("resource")
    public <O, I extends WorkspaceRequest<O> & Msg> Either<Status, O> call(long wsId, I msg)
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
}
