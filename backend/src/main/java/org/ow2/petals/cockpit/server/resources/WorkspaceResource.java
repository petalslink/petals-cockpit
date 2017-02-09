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

import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_USERS_USERNAME;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.List;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.glassfish.jersey.process.internal.RequestScoped;
import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.ChangeServiceUnitState;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.DeleteBus;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.ImportBus;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.NewWorkspaceClient;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin.State;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.UserSession.UserMin;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.Workspace;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

@RequestScoped
@Path("/workspaces/{wsId}")
public class WorkspaceResource {

    private final CockpitActors as;

    private final long wsId;

    private final Configuration jooq;

    @Inject
    public WorkspaceResource(@PathParam("wsId") @Min(1) long wsId, CockpitActors as, Configuration jooq) {
        this.as = as;
        this.wsId = wsId;
        this.jooq = jooq;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON + ";qs=1")
    @Valid
    public WorkspaceFullContent get(@Pac4JProfile CockpitProfile profile) {
        return DSL.using(jooq).transactionResult(conf -> {
            WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wsId)).fetchOne();

            if (ws == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).selectFrom(USERS_WORKSPACES)
                    .where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId())))
                    .fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }

            WorkspaceContent content = WorkspaceContent.buildFromDatabase(conf, ws);

            List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(ws.getId())).fetchInto(USERS);

            DSL.using(conf).update(USERS).set(USERS.LAST_WORKSPACE, wsId).where(USERS.USERNAME.eq(profile.getId()))
                    .execute();

            return new WorkspaceFullContent(ws, wsUsers, content);
        });
    }

    /**
     * Produces {@link WorkspaceChange}
     */
    @GET
    @Produces(SseFeature.SERVER_SENT_EVENTS + ";qs=0.5")
    public EventOutput sse(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
        // TODO ACL is done by actor for now
        return as.call(wsId, new NewWorkspaceClient(profile.getId()))
                .getOrElseThrow(s -> new WebApplicationException(s));
    }

    @POST
    @Path("/buses")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public BusInProgress addBus(@Pac4JProfile CockpitProfile profile, @Valid NewBus nb)
            throws WebApplicationException, InterruptedException {
        DSL.using(jooq).transaction(conf -> {
            // TODO simplify requests?
            WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wsId)).fetchOne();

            if (ws == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).selectFrom(USERS_WORKSPACES)
                    .where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId())))
                    .fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }
        });

        return as.call(wsId, new ImportBus(profile.getId(), nb)).getOrElseThrow(s -> new WebApplicationException(s));
    }
    }

    @DELETE
    @Path("/buses/{bId}")
    public void delete(@PathParam("bId") @Min(1) long bId, @Pac4JProfile CockpitProfile profile)
            throws WebApplicationException, InterruptedException {
        DSL.using(jooq).transaction(conf -> {
            // TODO simplify requests?
            WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wsId)).fetchOne();

            if (ws == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            Record user = DSL.using(conf).selectFrom(USERS_WORKSPACES)
                    .where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId).and(USERS_WORKSPACES.USERNAME.eq(profile.getId())))
                    .fetchOne();

            if (user == null) {
                throw new WebApplicationException(Status.FORBIDDEN);
            }
        });

        as.call(wsId, new DeleteBus(profile.getId(), bId)).getOrElseThrow(s -> new WebApplicationException(s));
    }

    @PUT
    @Path("/serviceunits/{suId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public ServiceUnitOverview changeSUState(@PathParam("suId") @Min(1) long suId, @Pac4JProfile CockpitProfile profile,
            @Valid ChangeState action) throws InterruptedException {
        // TODO ACL is done by actor for now
        return as.call(wsId, new ChangeServiceUnitState(profile.getId(), suId, action.state))
                .getOrElseThrow(s -> new WebApplicationException(s));
    }

    public static class NewBus {

        @NotEmpty
        @JsonProperty
        public final String ip;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int port;

        @NotEmpty
        @JsonProperty
        public final String username;

        @NotEmpty
        @JsonProperty
        public final String password;

        @NotEmpty
        @JsonProperty
        public final String passphrase;

        public NewBus(@JsonProperty("ip") String ip, @JsonProperty("port") int port,
                @JsonProperty("username") String username, @JsonProperty("password") String password,
                @JsonProperty("passphrase") String passphrase) {
            this.ip = ip;
            this.port = port;
            this.username = username;
            this.password = password;
            this.passphrase = passphrase;
        }
    }

    public static class BusInProgress {

        @NotEmpty
        @JsonProperty
        public final String ip;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int port;

        @NotEmpty
        @JsonProperty
        public final String username;

        @Min(1)
        public final long id;

        @Nullable
        @JsonProperty
        @JsonInclude(Include.NON_EMPTY)
        public final String importError;

        @JsonCreator
        private BusInProgress(@JsonProperty("id") String id, @JsonProperty("ip") String ip,
                @JsonProperty("port") int port, @JsonProperty("username") String username,
                @Nullable @JsonProperty("importError") String importError) {
            this(Long.valueOf(id), ip, port, username, importError);
        }

        public BusInProgress(long id, String ip, int port, String username) {
            this(id, ip, port, username, null);
        }

        public BusInProgress(long id, String ip, int port, String username, @Nullable String importError) {
            this.id = id;
            this.ip = ip;
            this.port = port;
            this.username = username;
            this.importError = importError;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }

    }

    public static class NewSUState {

        @Min(1)
        public final long id;

        @NotNull
        @JsonProperty
        public final ServiceUnitMin.State state;

        @JsonCreator
        public NewSUState(@JsonProperty("id") long id, @JsonProperty("state") State state) {
            this.id = id;
            this.state = state;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class BusDeleted {

        @Min(1)
        public final long id;

        @JsonCreator
        public BusDeleted(@JsonProperty("id") long id) {
            this.id = id;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class WorkspaceFullContent {

        @Valid
        @JsonProperty
        public final Workspace workspace;

        @Valid
        @JsonProperty
        public final ImmutableMap<String, UserMin> users;

        @Valid
        @JsonUnwrapped
        public final WorkspaceContent content;

        public WorkspaceFullContent(WorkspacesRecord ws, List<UsersRecord> users, WorkspaceContent content) {
            this.users = users.stream().collect(ImmutableMap.toImmutableMap(UsersRecord::getUsername,
                    u -> new UserMin(u.getUsername(), u.getName())));
            List<String> wsUsernames = users.stream().map(UsersRecord::getUsername)
                    .collect(ImmutableList.toImmutableList());
            this.workspace = new Workspace(ws.getId(), ws.getName(), wsUsernames);
            this.content = content;
        }

        @JsonCreator
        private WorkspaceFullContent() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this.users = ImmutableMap.of();
            this.content = new WorkspaceContent(ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                    ImmutableMap.of(), ImmutableMap.of());
            this.workspace = new Workspace(0, "", ImmutableList.of());
        }
    }

    public static class WorkspaceChange {

        public enum Type {
            WORKSPACE_CONTENT, BUS_IMPORT_ERROR, BUS_IMPORT_OK, SU_STATE_CHANGE, BUS_DELETED
        }

        @JsonProperty
        public final Type event;

        @JsonProperty
        public final Object data;

        private WorkspaceChange(Type event, Object data) {
            this.event = event;
            this.data = data;
        }

        public static WorkspaceChange busImportError(BusInProgress bus) {
            assert bus.importError != null && !bus.importError.isEmpty();
            return new WorkspaceChange(Type.BUS_IMPORT_ERROR, bus);
        }

        public static WorkspaceChange busImportOk(WorkspaceContent bus) {
            return new WorkspaceChange(Type.BUS_IMPORT_OK, bus);
        }

        public static WorkspaceChange suStateChange(NewSUState ns) {
            return new WorkspaceChange(Type.SU_STATE_CHANGE, ns);
        }

        public static WorkspaceChange busDeleted(BusDeleted bd) {
            return new WorkspaceChange(Type.BUS_DELETED, bd);
        }

        @Override
        public String toString() {
            return "WorkspaceEvent [event=" + event + ", data=" + data + "]";
        }
    }

    public static class ChangeState {

        @NotNull
        @JsonProperty
        public final ServiceUnitMin.State state;

        public ChangeState(@JsonProperty("state") ServiceUnitMin.State state) {
            this.state = state;
        }
    }
}
