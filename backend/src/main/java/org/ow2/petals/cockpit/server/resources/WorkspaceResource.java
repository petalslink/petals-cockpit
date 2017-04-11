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

import static org.ow2.petals.cockpit.server.db.generated.Keys.FK_USERS_WORKSPACES_USERNAME;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.CONTAINERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.BadRequestException;
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

import org.apache.commons.io.IOUtils;
import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.glassfish.jersey.process.internal.RequestScoped;
import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.ChangeComponentState;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.ChangeServiceUnitState;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.DeleteBus;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.DeleteWorkspace;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.DeployComponent;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.DeployServiceUnit;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.ImportBus;
import org.ow2.petals.cockpit.server.actors.WorkspaceActor.NewWorkspaceClient;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin.Type;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.UserSession.UserMin;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.Workspace;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.ow2.petals.cockpit.server.services.ArtifactServer;
import org.ow2.petals.cockpit.server.services.ArtifactServer.ServicedArtifact;
import org.ow2.petals.cockpit.server.utils.PetalsUtils;
import org.ow2.petals.jbi.descriptor.JBIDescriptorException;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.webcohesion.enunciate.metadata.rs.ResponseCode;
import com.webcohesion.enunciate.metadata.rs.Warnings;

@RequestScoped
@Path("/workspaces/{wsId}")
public class WorkspaceResource {

    private final CockpitActors as;

    private final long wsId;

    private final CockpitProfile profile;

    private final Configuration jooq;

    private final ArtifactServer httpServer;

    @Inject
    public WorkspaceResource(@NotNull @PathParam("wsId") @Min(1) long wsId, @Pac4JProfile CockpitProfile profile,
            CockpitActors as, Configuration jooq, ArtifactServer httpServer) {
        this.profile = profile;
        this.as = as;
        this.wsId = wsId;
        this.jooq = jooq;
        this.httpServer = httpServer;
    }

    private void checkAccess(Configuration conf) {
        // TODO merge queries with others?
        if (!DSL.using(conf).fetchExists(USERS_WORKSPACES,
                USERS_WORKSPACES.USERNAME.eq(profile.getId()).and(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)))) {
            throw new WebApplicationException(Status.FORBIDDEN);
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON + ";qs=1")
    public WorkspaceFullContent content() {
        return DSL.using(jooq).transactionResult(conf -> {

            checkAccess(conf);

            WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wsId)).fetchOne();

            if (ws == null) {
                throw new WebApplicationException(Status.NOT_FOUND);
            }

            WorkspaceContent content = WorkspaceContent.buildFromDatabase(conf, ws);

            List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_WORKSPACES_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)).fetchInto(USERS);

            return new WorkspaceFullContent(ws, wsUsers, content);

        });
    }

    /**
     * Produces {@link WorkspaceEvent}
     */
    @GET
    @Produces(SseFeature.SERVER_SENT_EVENTS + ";qs=0.5")
    public EventOutput sse() throws InterruptedException {

        checkAccess(jooq);

        return as.call(wsId, new NewWorkspaceClient(profile.getId()));
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceDeleted delete() throws InterruptedException {

        checkAccess(jooq);

        return as.call(wsId, new DeleteWorkspace());
    }

    @POST
    @Path("/buses")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public BusInProgress addBus(@NotNull @Valid BusImport nb) throws InterruptedException {

        checkAccess(jooq);

        return as.call(wsId, new ImportBus(nb));
    }

    @DELETE
    @Path("/buses/{bId}")
    @Produces(MediaType.APPLICATION_JSON)
    public BusDeleted delete(@NotNull @PathParam("bId") @Min(1) long bId) throws InterruptedException {

        checkAccess(jooq);

        return as.call(wsId, new DeleteBus(profile.getId(), bId));
    }

    @PUT
    @Path("/serviceunits/{suId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Warnings({ @ResponseCode(code = 409, condition = "The state transition is not valid.") })
    public SUStateChanged changeSUState(@NotNull @PathParam("suId") @Min(1) long suId,
            @NotNull @Valid SUChangeState action) throws InterruptedException {

        checkAccess(jooq);

        return as.call(wsId, new ChangeServiceUnitState(suId, action));
    }

    @PUT
    @Path("/components/{compId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Warnings({ @ResponseCode(code = 409, condition = "The state transition is not valid.") })
    public ComponentStateChanged changeComponentState(@NotNull @PathParam("compId") @Min(1) long compId,
            @NotNull @Valid ComponentChangeState action) throws InterruptedException {

        checkAccess(jooq);

        return as.call(wsId, new ChangeComponentState(compId, action));
    }

    @POST
    @Path("/components/{componentId}/serviceunits")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public SUDeployed deployServiceUnit(@NotNull @PathParam("componentId") @Min(1) long componentId,
            @NotNull @FormDataParam("file") InputStream file,
            @NotNull @FormDataParam("file") FormDataContentDisposition fileDisposition,
            @NotEmpty @FormDataParam("name") String name)
            throws IOException, InterruptedException, JBIDescriptorException {

        checkAccess(jooq);

        String componentName = DSL.using(jooq).selectFrom(COMPONENTS).where(COMPONENTS.ID.eq(componentId))
                .fetchOne(COMPONENTS.NAME);

        if (componentName == null) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        String saName = "sa-" + name;

        try (ServicedArtifact sa = httpServer.serve(saName + ".zip",
                os -> PetalsUtils.createSAfromSU(file, os, saName, name, componentName))) {
            return as.call(wsId, new DeployServiceUnit(saName, sa.getArtifactUrl(), componentId));
        }
    }

    @POST
    @Path("/containers/{containerId}/components")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public ComponentDeployed deployServiceUnit(@NotNull @PathParam("containerId") @Min(1) long containerId,
            @NotNull @FormDataParam("file") InputStream file,
            @NotNull @FormDataParam("file") FormDataContentDisposition fileDisposition,
            @NotEmpty @FormDataParam("name") String name,
            @NotEmpty @FormDataParam("type") String type)
            throws IOException, InterruptedException {

        checkAccess(jooq);

        if (!DSL.using(jooq).fetchExists(CONTAINERS, CONTAINERS.ID.eq(containerId))) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        Type ttype = ComponentMin.Type.from(type);

        if (ttype == null) {
            throw new BadRequestException("Unsupported component type " + type);
        }

        try (ServicedArtifact sa = httpServer.serve(name + ".zip", os -> IOUtils.copy(file, os))) {
            return as.call(wsId, new DeployComponent(name, ttype, sa.getArtifactUrl(), containerId));
        }
    }

    public static class WorkspaceDeleted implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long id;

        public WorkspaceDeleted(@JsonProperty("id") long id) {
            this.id = id;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class BusImport {

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

        public BusImport(@JsonProperty("ip") String ip, @JsonProperty("port") int port,
                @JsonProperty("username") String username, @JsonProperty("password") String password,
                @JsonProperty("passphrase") String passphrase) {
            this.ip = ip;
            this.port = port;
            this.username = username;
            this.password = password;
            this.passphrase = passphrase;
        }
    }

    public static class BusInProgress implements WorkspaceEvent.Data {

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

        @NotNull
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

    public static class SUStateChanged implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long id;

        @NotNull
        @JsonProperty
        public final ServiceUnitMin.State state;

        @JsonCreator
        public SUStateChanged(@JsonProperty("id") long id, @JsonProperty("state") ServiceUnitMin.State state) {
            this.id = id;
            this.state = state;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ComponentStateChanged implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long id;

        @NotNull
        @JsonProperty
        public final ComponentMin.State state;

        @JsonCreator
        public ComponentStateChanged(@JsonProperty("id") long id, @JsonProperty("state") ComponentMin.State state) {
            this.id = id;
            this.state = state;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class BusDeleted implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long id;

        @NotEmpty
        public final String reason;

        @JsonCreator
        public BusDeleted(@JsonProperty("id") long id, @JsonProperty("reason") String reason) {
            this.id = id;
            this.reason = reason;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class SUDeployed implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long componentId;

        @Valid
        @NotNull
        @JsonProperty
        public final ServiceUnitMin serviceUnit;

        @JsonCreator
        public SUDeployed(@JsonProperty("componentId") long componentId,
                @JsonProperty("serviceUnit") ServiceUnitMin serviceUnit) {
            this.componentId = componentId;
            this.serviceUnit = serviceUnit;
        }

        @JsonProperty
        public String getComponentId() {
            return Long.toString(componentId);
        }
    }

    public static class ComponentDeployed implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long containerId;

        @Valid
        @NotNull
        @JsonProperty
        public final ComponentMin component;

        @JsonCreator
        public ComponentDeployed(@JsonProperty("containerId") long containerId,
                @JsonProperty("component") ComponentMin component) {
            this.containerId = containerId;
            this.component = component;
        }

        @JsonProperty
        public String getContainerId() {
            return Long.toString(containerId);
        }
    }

    public static class WorkspaceFullContent implements WorkspaceEvent.Data {

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

    public static class WorkspaceEvent {

        public interface Data {

        }

        public enum Event {
            WORKSPACE_CONTENT, BUS_IMPORT, BUS_IMPORT_ERROR, BUS_IMPORT_OK, SU_STATE_CHANGE, COMPONENT_STATE_CHANGE,
            BUS_DELETED, SU_DEPLOYED, WORKSPACE_DELETED, COMPONENT_DEPLOYED
        }

        @JsonProperty
        public final Event event;

        @JsonProperty
        public final Data data;

        private WorkspaceEvent(Event event, Data data) {
            this.event = event;
            this.data = data;
        }

        public static WorkspaceEvent content(WorkspaceFullContent content) {
            return new WorkspaceEvent(Event.WORKSPACE_CONTENT, content);
        }

        public static WorkspaceEvent content(WorkspaceContent content) {
            return new WorkspaceEvent(Event.WORKSPACE_CONTENT, content);
        }

        public static WorkspaceEvent workspaceDeleted(WorkspaceDeleted wd) {
            return new WorkspaceEvent(Event.WORKSPACE_DELETED, wd);
        }

        public static WorkspaceEvent busImportError(BusInProgress bus) {
            assert bus.importError != null && !bus.importError.isEmpty();
            return new WorkspaceEvent(Event.BUS_IMPORT_ERROR, bus);
        }

        public static WorkspaceEvent busImportOk(WorkspaceContent bus) {
            return new WorkspaceEvent(Event.BUS_IMPORT_OK, bus);
        }

        public static WorkspaceEvent suStateChange(SUStateChanged ns) {
            return new WorkspaceEvent(Event.SU_STATE_CHANGE, ns);
        }

        public static WorkspaceEvent componentStateChange(ComponentStateChanged ns) {
            return new WorkspaceEvent(Event.COMPONENT_STATE_CHANGE, ns);
        }

        public static WorkspaceEvent busDeleted(BusDeleted bd) {
            return new WorkspaceEvent(Event.BUS_DELETED, bd);
        }

        public static WorkspaceEvent suDeployed(SUDeployed sud) {
            return new WorkspaceEvent(Event.SU_DEPLOYED, sud);
        }

        public static WorkspaceEvent componentDeployed(ComponentDeployed cd) {
            return new WorkspaceEvent(Event.COMPONENT_DEPLOYED, cd);
        }

        public static WorkspaceEvent busImport(BusInProgress bip) {
            return new WorkspaceEvent(Event.BUS_IMPORT, bip);
        }

        @Override
        public String toString() {
            return "WorkspaceEvent [event=" + event + ", data=" + data + "]";
        }
    }

    public static class SUChangeState {

        @NotNull
        @JsonProperty
        public final ServiceUnitMin.State state;

        public SUChangeState(@JsonProperty("state") ServiceUnitMin.State state) {
            this.state = state;
        }
    }

    public static class ComponentChangeState {

        @NotNull
        @JsonProperty
        public final ComponentMin.State state;

        public ComponentChangeState(@JsonProperty("state") ComponentMin.State state) {
            this.state = state;
        }
    }
}
