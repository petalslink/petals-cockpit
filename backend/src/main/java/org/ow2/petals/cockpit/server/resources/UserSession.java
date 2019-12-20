/**
 * Copyright (C) 2016-2019 Linagora
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

import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import javax.inject.Inject;
import javax.validation.constraints.Min;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.jdt.annotation.Nullable;
import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.UsersResource.UserMin;
import org.pac4j.core.context.DefaultAuthorizers;
import org.pac4j.jax.rs.annotations.Pac4JCallback;
import org.pac4j.jax.rs.annotations.Pac4JLogout;
import org.pac4j.jax.rs.annotations.Pac4JProfile;
import org.pac4j.jax.rs.annotations.Pac4JSecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The URL /user/session is protected via annotations, but /user itself is protected using the global filter (which
 * ignores /user/session)
 *
 * @author vnoel
 */
@Path("/user")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
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
    public CurrentUser getUserData(@Pac4JProfile CockpitProfile profile) {
        LOG.debug("Returning infos for {}", profile.getId());

        UsersRecord user = DSL.using(jooq).fetchOne(USERS, USERS.USERNAME.eq(profile.getId()));

        return new CurrentUser(user);
    }

    @GET
    @Path("/session")
    @Pac4JSecurity(authorizers = DefaultAuthorizers.IS_AUTHENTICATED)
    public CurrentUser status(@Pac4JProfile CockpitProfile profile) {
        return getUserData(profile);
    }

    @SuppressWarnings("unused")
    @POST
    @Path("/session")
    @Pac4JCallback(defaultUrl = "/user/session", renewSession = false)
    public CurrentUser login(Authentication auth) {
        // the method is never called, everything is handled by pac4j
        // the parameter is here for documentation purpose
        throw new AssertionError("impossible");
    }

    @DELETE
    @Path("/session")
    @Pac4JLogout(destroySession = true)
    // pac4j now returns a 204 (No Content)
    @Produces(MediaType.TEXT_PLAIN)
    public void logout() {
        // the method is never called, everything is handled by pac4j
        throw new AssertionError("impossible");
    }

    public static class CurrentUser extends UserMin {

        @Nullable
        @Min(1)
        public final Long lastWorkspace;

        public final boolean isAdmin;

        public final boolean isFromLdap;

        public CurrentUser(UsersRecord record) {
            super(record);
            this.lastWorkspace = record.getLastWorkspace();
            this.isAdmin = record.getAdmin();
            this.isFromLdap = record.getIsFromLdap();
        }

        @JsonCreator
        private CurrentUser(@JsonProperty("username") String username, @JsonProperty("name") String name,
                @Nullable @JsonProperty("lastWorkspace") Long lastWorkspace, @JsonProperty("isAdmin") boolean isAdmin,
                @JsonProperty("isFromLdap") boolean isFromLdap) {
            this(new UsersRecord(username, null, name, lastWorkspace, isAdmin, isFromLdap));
        }

        @Nullable
        @JsonProperty
        public String getLastWorkspace() {
            Long lw = lastWorkspace;
            return lw == null ? null : Long.toString(lw);
        }
    }
}
