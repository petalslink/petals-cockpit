/**
 * Copyright (c) 2016 Linagora
 * 
 * This program/library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 2.1 of the License, or (at your
 * option) any later version.
 * 
 * This program/library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
 * for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program/library; If not, see http://www.gnu.org/licenses/
 * for the GNU Lesser General Public License version 2.1.
 */
package org.ow2.petals.cockpit.server.resources;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.representations.UserData;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.jax.rs.annotations.Pac4JCallback;
import org.pac4j.jax.rs.annotations.Pac4JLogout;
import org.pac4j.jax.rs.annotations.Pac4JProfile;
import org.pac4j.jax.rs.annotations.Pac4JSecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author vnoel
 */
@Path("/user")
public class UserSession {

    private static final Logger LOG = LoggerFactory.getLogger(UserSession.class);

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Pac4JSecurity(authorizers = "isAuthenticated")
    public UserData getUserData(@Pac4JProfile CommonProfile profile) {
        LOG.debug("Returning infos for {}", profile.getId());

        return new UserData(profile.getId(), profile.getDisplayName());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/session")
    @Pac4JSecurity(authorizers = "isAuthenticated")
    public UserData status(@Pac4JProfile CommonProfile profile) {
        // this simply mirrors getUserData
        return getUserData(profile);
    }

    @POST
    @Path("/session")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Pac4JCallback(skipResponse = true, renewSession = false)
    public UserData login(@Nullable @Pac4JProfile CommonProfile profile) {
        if (profile != null) {
            LOG.debug("Logging in for {}", profile.getId());
            return getUserData(profile);
        } else {
            throw new WebApplicationException(Status.UNAUTHORIZED);
        }
    }

    @DELETE
    @Path("/session")
    @Pac4JLogout(skipResponse = true)
    public void logout() {
        // TODO it would be nicer if we could get the id of the logging out user... but because of the logout, I can't
        // inject CommonProfile in the method parameters...
    }
}
