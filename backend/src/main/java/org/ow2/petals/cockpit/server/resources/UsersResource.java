/**
 * Copyright (C) 2017-2018 Linagora
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

import java.util.Collection;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.exception.DataAccessException;
import org.jooq.exception.SQLStateClass;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.bundles.security.CockpitAuthenticator;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.bundles.security.CockpitSecurityBundle;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.pac4j.jax.rs.annotations.Pac4JSecurity;

import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/users")
@Pac4JSecurity(authorizers = CockpitSecurityBundle.IS_ADMIN_AUTHORIZER)
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UsersResource {

    private final Configuration jooq;

    @Inject
    public UsersResource(Configuration jooq) {
        this.jooq = jooq;
    }

    @GET
    @Pac4JSecurity(ignore = true)
    public Collection<UserMin> getAllUsers() {
        return DSL.using(jooq).selectFrom(USERS).stream().map(UserMin::new).collect(Collectors.toList());
    }

    @POST
    public void add(@Valid NewUser user) {
        try {
            DSL.using(jooq).executeInsert(new UsersRecord(user.username,
                    CockpitAuthenticator.passwordEncoder.encode(user.password), user.name, null, false, false));
        } catch (DataAccessException e) {
            if (e.sqlStateClass().equals(SQLStateClass.C23_INTEGRITY_CONSTRAINT_VIOLATION)) {
                throw new WebApplicationException(Status.CONFLICT);
            } else {
                throw e;
            }
        }
    }

    @GET
    @Path("/{username}")
    public UserMin user(@NotEmpty @PathParam("username") String username) {
        UsersRecord user = DSL.using(jooq).fetchOne(USERS, USERS.USERNAME.eq(username));

        if (user == null) {
            throw new NotFoundException();
        }

        return new UserMin(user);
    }

    @DELETE
    @Path("/{username}")
    public void delete(@NotEmpty @PathParam("username") String username) {
        int deleted = DSL.using(jooq).deleteFrom(USERS).where(USERS.USERNAME.eq(username)).execute();
        if (deleted < 1) {
            throw new NotFoundException();
        }
    }

    @PUT
    @Path("/{username}")
    public void update(@NotEmpty @PathParam("username") String username, @Valid UpdateUser user) {
        UsersRecord r = new UsersRecord();
        String name = user.name;
        if (name != null && !name.trim().isEmpty()) {
            r.set(USERS.NAME, name);
        }
        String password = user.password;
        if (password != null && !password.trim().isEmpty()) {
            r.set(USERS.PASSWORD, CockpitAuthenticator.passwordEncoder.encode(password));
        }
        if (r.changed()) {
            DSL.using(jooq).executeUpdate(r, USERS.USERNAME.eq(username));
        }
    }

    public static class UpdateUser {

        @Nullable
        @JsonProperty
        public final String password;

        @Nullable
        @JsonProperty
        public final String name;

        public UpdateUser(@Nullable @JsonProperty("password") String password,
                @Nullable @JsonProperty("name") String name) {
            this.password = password;
            this.name = name;
        }
    }

    public static class NewUser extends Authentication {

        @NotEmpty
        @JsonProperty
        public final String name;

        public NewUser(@JsonProperty("username") String username, @JsonProperty("password") String password,
                @JsonProperty("name") String name) {
            super(username, password);
            this.name = name;
        }
    }

    public static class UserMin {

        @NotEmpty
        @JsonProperty
        public final String id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public UserMin(UsersRecord record) {
            this(record.getUsername(), record.getName());
        }

        private UserMin(@JsonProperty("id") String id, @JsonProperty("name") String name) {
            this.id = id;
            this.name = name;
        }
    }
}
