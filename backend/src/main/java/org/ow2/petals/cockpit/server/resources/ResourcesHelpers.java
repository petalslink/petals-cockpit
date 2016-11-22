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
package org.ow2.petals.cockpit.server.resources;

import java.util.Optional;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.ow2.petals.cockpit.server.actors.WorkspaceActor;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.Msg;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.WorkspaceRequest;

import co.paralleluniverse.actors.ActorRef;
import co.paralleluniverse.actors.behaviors.RequestReplyHelper;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.control.Either;

public class ResourcesHelpers {

    private ResourcesHelpers() {
        // helper class
    }

    /**
     * @throws WebApplicationException
     */
    @SuppressWarnings("resource")
    public static <O, I extends WorkspaceRequest<O> & Msg> O call(long wsId, I msg)
            throws InterruptedException {
        try {
            Optional<ActorRef<Msg>> ma = WorkspaceActor.get(wsId);
            if (ma.isPresent()) {
                ActorRef<Msg> a = ma.get();
                Either<Status, O> res = RequestReplyHelper.call(a, msg);

                if (res.isLeft()) {
                    throw new WebApplicationException(res.getLeft());
                } else {
                    return res.get();
                }
            } else {
                throw new WebApplicationException(Status.NOT_FOUND);
            }
        } catch (SuspendExecution e) {
            throw new AssertionError(e);
        }
    }
}
