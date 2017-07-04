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
package org.ow2.petals.cockpit.server.resources;

import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import java.util.concurrent.atomic.AtomicBoolean;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.exception.DataAccessException;
import org.jooq.exception.SQLStateClass;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.bundles.security.CockpitAuthenticator;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;

import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/setup")
public class SetupResource {

    public static final String ADMIN_TOKEN = "admin-console-token";

    private final Configuration jooq;

    private final String adminConsoleToken;

    private final AtomicBoolean userCreated = new AtomicBoolean(false);

    @Inject
    public SetupResource(Configuration jooq, @Named(ADMIN_TOKEN) String adminConsoleToken) {
        this.jooq = jooq;
        this.adminConsoleToken = adminConsoleToken;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void setup(@Valid UserSetup setup) {
        if (!adminConsoleToken.equals(setup.token)) {
            throw new ForbiddenException("Invalid token");
        }

        // we check the db in case it changed externally since we started the application
        if (userCreated.get() || DSL.using(jooq).fetchExists(USERS, USERS.ADMIN.eq(true))) {
            userCreated.set(true);
            throw new NotFoundException("Petals Cockpit is already setup");
        }

        try {
            DSL.using(jooq).transaction(c -> {
                DSL.using(c).executeInsert(new UsersRecord(setup.username,
                        CockpitAuthenticator.passwordEncoder.encode(setup.password), setup.name, null, true));

                if (!userCreated.compareAndSet(false, true)) {
                    // this will rollback the transaction and cancel the insert
                    throw new NotFoundException("Petals Cockpit is already setup");
                }
            });
        } catch (DataAccessException e) {
            if (e.sqlStateClass().equals(SQLStateClass.C23_INTEGRITY_CONSTRAINT_VIOLATION)) {
                throw new WebApplicationException("User already exists", Status.CONFLICT);
            } else {
                throw e;
            }
        }
    }

    public static class UserSetup extends NewUser {

        @NotEmpty
        @JsonProperty
        public final String token;

        public UserSetup(@JsonProperty("token") String token, @JsonProperty("username") String username,
                @JsonProperty("password") String password, @JsonProperty("name") String name) {
            super(username, password, name);
            this.token = token;
        }
    }
}
