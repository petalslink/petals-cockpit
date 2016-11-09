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

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
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

    /**
     * Note: Security is covered by the global filter
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public User getUserData(@Pac4JProfile CockpitProfile profile) {
        LOG.debug("Returning infos for {}", profile.getId());

        DbUser user = profile.getUser();

        return new User(user.getUsername(), user.getName());
    }

    @GET
    @Path("/session")
    @Produces(MediaType.APPLICATION_JSON)
    @Pac4JSecurity(authorizers = "isAuthenticated")
    public User status(@Pac4JProfile CockpitProfile profile) {
        return getUserData(profile);
    }

    @POST
    @Path("/session")
    @Pac4JCallback(defaultUrl = "/user/session", renewSession = false)
    public void login() {
    }

    @DELETE
    @Path("/session")
    @Pac4JLogout
    public void logout() {
    }

    public static class User {

        private final String username;

        private final String name;

        public User(@NotEmpty @JsonProperty("username") String username,
                @NotEmpty @JsonProperty("name") String name) {
            this.username = username;
            this.name = name;
        }

        @JsonProperty
        public String getUsername() {
            return username;
        }

        @JsonProperty
        public String getName() {
            return name;
        }
    }
}
