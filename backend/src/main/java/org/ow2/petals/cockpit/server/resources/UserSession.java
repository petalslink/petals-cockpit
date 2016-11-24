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

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.jdt.annotation.Nullable;
import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JCallback;
import org.pac4j.jax.rs.annotations.Pac4JLogout;
import org.pac4j.jax.rs.annotations.Pac4JProfile;
import org.pac4j.jax.rs.annotations.Pac4JSecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The URL /user/session is protected via annotations, but /user itself is protected using the global filter (which
 * ignores /user/session)
 * 
 * @author vnoel
 */
@Path("/user")
public class UserSession {

    private static final Logger LOG = LoggerFactory.getLogger(UserSession.class);

    private final UsersDAO users;

    @Inject
    public UserSession(UsersDAO users) {
        this.users = users;
    }

    /**
     * Note: Security is covered by the global filter
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public User getUserData(@Pac4JProfile CockpitProfile profile) {
        LOG.debug("Returning infos for {}", profile.getId());

        DbUser user = profile.getUser();

        // it's better to query it now, since we are not sure the DbUser wasn't cached!
        Long lastWorkspace = users.getLastWorkspace(user);

        return new User(user.username, user.name, lastWorkspace);
    }

    @GET
    @Path("/session")
    @Produces(MediaType.APPLICATION_JSON)
    @Pac4JSecurity(authorizers = "isAuthenticated")
    @Valid
    public User status(@Pac4JProfile CockpitProfile profile) {
        return getUserData(profile);
    }

    @POST
    @Path("/session")
    @Pac4JCallback(defaultUrl = "/user/session", renewSession = false)
    public void login() {
        // the method is never called, everything is handled by pac4j
    }

    @DELETE
    @Path("/session")
    @Pac4JLogout
    public void logout() {
        // the method is never called, everything is handled by pac4j
    }

    public static class User {

        @NotEmpty
        @JsonProperty
        public final String username;

        @NotEmpty
        @JsonProperty
        public final String name;

        @Nullable
        @Min(1)
        public final Long lastWorkspace;

        public User(@JsonProperty("username") String username, @JsonProperty("name") String name,
                @Nullable @JsonProperty("lastWorkspace") Long lastWorkspace) {
            this.username = username;
            this.name = name;
            this.lastWorkspace = lastWorkspace;
        }

        @Nullable
        @JsonProperty
        public String getLastWorkspace() {
            Long lw = lastWorkspace;
            return lw == null ? null : Long.toString(lw);
        }
    }
}
