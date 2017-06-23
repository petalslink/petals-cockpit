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
package org.ow2.petals.cockpit.server.resources;

import javax.inject.Inject;
import javax.validation.constraints.Min;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.jdt.annotation.Nullable;
import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.db.generated.Tables;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.pac4j.core.context.DefaultAuthorizers;
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

    private final Configuration jooq;

    @Inject
    public UserSession(Configuration jooq) {
        this.jooq = jooq;
    }

    /**
     * Note: Security is covered by the global filter
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public User getUserData(@Pac4JProfile CockpitProfile profile) {
        LOG.debug("Returning infos for {}", profile.getId());

        UsersRecord user = DSL.using(jooq).fetchOne(Tables.USERS, Tables.USERS.USERNAME.eq(profile.getId()));

        return new User(user.getUsername(), user.getName(), user.getLastWorkspace(), user.getAdmin());
    }

    @GET
    @Path("/session")
    @Produces(MediaType.APPLICATION_JSON)
    @Pac4JSecurity(authorizers = DefaultAuthorizers.IS_AUTHENTICATED)
    public User status(@Pac4JProfile CockpitProfile profile) {
        return getUserData(profile);
    }

    @POST
    @Path("/session")
    @Pac4JCallback(defaultUrl = "/user/session", renewSession = false)
    public User login(Authentication auth) {
        // the method is never called, everything is handled by pac4j
        // the parameter is here for documentation purpose
        throw new AssertionError("impossible");
    }

    @DELETE
    @Path("/session")
    @Pac4JLogout(destroySession = true)
    public void logout() {
        // the method is never called, everything is handled by pac4j
        throw new AssertionError("impossible");
    }

    public static class UserMin {

        @NotEmpty
        @JsonProperty
        public final String id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public UserMin(@JsonProperty("id") String id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }
    }

    public static class User extends UserMin {

        @Nullable
        @Min(1)
        public final Long lastWorkspace;

        public final boolean isAdmin;

        public User(@JsonProperty("username") String username, @JsonProperty("name") String name,
                @Nullable @JsonProperty("lastWorkspace") Long lastWorkspace, @JsonProperty("isAdmin") boolean isAdmin) {
            super(username, name);
            this.lastWorkspace = lastWorkspace;
            this.isAdmin = isAdmin;
        }

        @Nullable
        @JsonProperty
        public String getLastWorkspace() {
            Long lw = lastWorkspace;
            return lw == null ? null : Long.toString(lw);
        }
    }
}
