/**
 * Copyright (C) 2017-2019 Linagora
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
import javax.validation.constraints.NotNull;
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
import org.ldaptive.LdapException;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.LdapConfigFactory;
import org.ow2.petals.cockpit.server.bundles.security.CockpitAuthenticator;
import org.ow2.petals.cockpit.server.bundles.security.CockpitSecurityBundle;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.services.LdapService;
import org.pac4j.jax.rs.annotations.Pac4JSecurity;

import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/users")
@Pac4JSecurity(authorizers = CockpitSecurityBundle.ADMIN_AUTHORIZER)
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UsersResource {

    private final Configuration jooq;

    @Nullable
    private final LdapConfigFactory ldapConfig;

    private LdapService ldapService;

    @Inject
    public UsersResource(Configuration jooq, CockpitConfiguration config, LdapService ldapService) {
        this.jooq = jooq;
        this.ldapService = ldapService;
        ldapConfig = config.getLdapConfigFactory();
    }

    @GET
    @Pac4JSecurity(ignore = true)
    public Collection<UserMin> getAllUsers() {
        return DSL.using(jooq).transactionResult(conf -> {
            return DSL.using(jooq).selectFrom(USERS).stream().map(UserMin::new).collect(Collectors.toList());
        });
   }

    @POST
    public void add(@Valid NewUser user) {
        DSL.using(jooq).transaction(conf -> {
            try {
                if (ldapConfig != null) {
                    assert ldapService != null;
                    String name = ldapService.getUserByUsername(user.username).name;

                    DSL.using(jooq).executeInsert(
                            new UsersRecord(user.username, LdapConfigFactory.LDAP_PASSWORD, name, null, false, true));
                } else {
                    final String password = user.password;
                    final String name = user.name;
                    final boolean isAdmin = user.isAdmin;

                    if (password == null || password.isEmpty() || name == null || name.isEmpty()) {
                        throw new WebApplicationException("Unprocessable entity: password and name must be valid.",
                                422);
                    } else {
                        DSL.using(jooq).executeInsert(new UsersRecord(user.username,
                                CockpitAuthenticator.passwordEncoder.encode(password), name, null, isAdmin, false));
                    }
                }
            } catch (DataAccessException e) {
                if (e.sqlStateClass().equals(SQLStateClass.C23_INTEGRITY_CONSTRAINT_VIOLATION)) {
                    throw new WebApplicationException(Status.CONFLICT);
                } else {
                    throw e;
                }
            } catch (LdapException e) {
                throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
            }
        });
    }

    @GET
    @Path("/{username}")
    public UserMin user(@NotEmpty @PathParam("username") String username) {
        return DSL.using(jooq).transactionResult(conf -> {
            UsersRecord user = DSL.using(jooq).fetchOne(USERS, USERS.USERNAME.eq(username));
            if (user == null) {
                throw new NotFoundException();
            }
            return new UserMin(user);
        });
    }

    @DELETE
    @Path("/{username}")
    public void delete(@NotEmpty @PathParam("username") String username) {
        DSL.using(jooq).transaction(conf -> {
            int deleted = DSL.using(jooq).deleteFrom(USERS).where(USERS.USERNAME.eq(username)).execute();
            if (deleted < 1) {
                throw new NotFoundException();
            }
        });
    }

    @PUT
    @Path("/{username}")
    public void update(@NotEmpty @PathParam("username") String username, @Valid UpdateUser userUpdated) {
        DSL.using(jooq).transaction(conf -> {
            UsersRecord user = new UsersRecord();
            String name = userUpdated.name;
            if (name != null && !name.trim().isEmpty()) {
                failIfLdapMode();
                user.set(USERS.NAME, name);
            }
            String password = userUpdated.password;
            if (password != null && !password.trim().isEmpty()) {
                failIfLdapMode();
                user.set(USERS.PASSWORD, CockpitAuthenticator.passwordEncoder.encode(password));
            }

            final Integer currentAdminsCount = DSL.using(conf).selectCount().from(USERS).where(USERS.ADMIN.eq(true))
                    .fetchOne(0, int.class);
            boolean isAlreadyAdmin = DSL.using(conf).select(USERS.ADMIN).from(USERS).where(USERS.USERNAME.eq(username))
                    .fetchOne(0, boolean.class);
            boolean willBeAdmin = userUpdated.isAdmin;
            if ((currentAdminsCount == 1) && isAlreadyAdmin && !willBeAdmin) {
                throw new WebApplicationException("At least one cockpit administrator must remain!", Status.CONFLICT);
            }
            user.set(USERS.ADMIN, willBeAdmin);

            DSL.using(jooq).executeUpdate(user, USERS.USERNAME.eq(username));

        });
    }

    private void failIfLdapMode() {
        if (ldapConfig != null) {
            throw new WebApplicationException("Method not allowed: cannot change user name and password in LDAP mode",
                    Status.METHOD_NOT_ALLOWED);
        }
    }

    public static class UpdateUser {

        @Nullable
        @JsonProperty
        public final String password;

        @Nullable
        @JsonProperty
        public final String name;

        @NotNull
        @JsonProperty
        public final boolean isAdmin;

        public UpdateUser(@Nullable @JsonProperty("password") String password,
                @Nullable @JsonProperty("name") String name, @JsonProperty("isAdmin") boolean isAdmin) {
            this.password = password;
            this.name = name;
            this.isAdmin = isAdmin;
        }
    }

    public static class NewUser {

        @Nullable
        @JsonProperty
        public final String name;

        @NotEmpty
        @JsonProperty
        public final String username;

        @Nullable
        @JsonProperty
        public final String password;

        @NotNull
        @JsonProperty
        public final boolean isAdmin;

        public NewUser(@JsonProperty("username") String username, @Nullable @JsonProperty("password") String password,
                @Nullable @JsonProperty("name") String name, @JsonProperty("isAdmin") boolean isAdmin) {
            this.name = name;
            this.username = username;
            this.password = password;
            this.isAdmin = isAdmin;
        }
    }

    public static class UserMin {

        @NotEmpty
        @JsonProperty
        public final String id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotNull
        @JsonProperty
        public boolean isAdmin;

        public UserMin(UsersRecord record) {
            this(record.getUsername(), record.getName(), record.getAdmin());
        }

        private UserMin(@JsonProperty("id") String id, @JsonProperty("name") String name, @JsonProperty("isAdmin") boolean isAdmin) {
            this.id = id;
            this.name = name;
            this.isAdmin = isAdmin;
        }
    }
}
