/**
 * Copyright (C) 2017 Linagora
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
package org.ow2.petals.cockpit.server.utils;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.ext.ExceptionMapper;

import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;

import com.ebmwebsourcing.easycommons.lang.ExceptionHelper;

import io.dropwizard.jersey.errors.ErrorMessage;

public class PetalsAdminExceptionMapper implements ExceptionMapper<PetalsAdminException> {

    private final boolean showDetails;

    public PetalsAdminExceptionMapper(boolean showDetails) {
        this.showDetails = showDetails;
    }

    @Override
    public Response toResponse(PetalsAdminException exception) {
        System.out.println(exception.getCause().getMessage());
        return Response.status(Status.CONFLICT).type(MediaType.APPLICATION_JSON_TYPE)
                .entity(new ErrorMessage(Status.CONFLICT.getStatusCode(), exception.getCause().getMessage(),
                        showDetails ? ExceptionHelper.getStackTrace(exception.getCause()) : null))
                .build();
    }

}
