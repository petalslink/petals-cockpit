/**
 * Copyright (C) 2016-2018 Linagora
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
import java.io.OutputStream;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.ProviderNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipError;

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

import org.apache.commons.lang3.StringUtils;
import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.glassfish.jersey.process.internal.RequestScoped;
import org.hibernate.validator.constraints.NotEmpty;
import org.jooq.Configuration;
import org.jooq.exception.DataAccessException;
import org.jooq.exception.SQLStateClass;
import org.jooq.impl.DSL;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;
import org.ow2.petals.cockpit.server.db.generated.tables.records.BusesRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.ComponentsRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.db.generated.tables.records.WorkspacesRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryMin;
import org.ow2.petals.cockpit.server.resources.UsersResource.UserMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.WorkspaceContentBuilder;
import org.ow2.petals.cockpit.server.resources.WorkspacesResource.Workspace;
import org.ow2.petals.cockpit.server.services.ArtifactServer;
import org.ow2.petals.cockpit.server.services.ArtifactServer.ServedArtifact;
import org.ow2.petals.cockpit.server.services.WorkspaceDbOperations;
import org.ow2.petals.cockpit.server.services.WorkspacesService;
import org.ow2.petals.cockpit.server.services.WorkspacesService.WorkspaceService;
import org.ow2.petals.cockpit.server.utils.PetalsUtils;
import org.ow2.petals.jbi.descriptor.JBIDescriptorException;
import org.ow2.petals.jbi.descriptor.original.JBIDescriptorBuilder;
import org.ow2.petals.jbi.descriptor.original.generated.Component;
import org.ow2.petals.jbi.descriptor.original.generated.Jbi;
import org.pac4j.jax.rs.annotations.Pac4JProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.webcohesion.enunciate.metadata.rs.ResponseCode;
import com.webcohesion.enunciate.metadata.rs.Warnings;

@RequestScoped
@Path("/workspaces/{wsId}")
public class WorkspaceResource {

    private static final Logger LOG = LoggerFactory.getLogger(WorkspaceResource.class);

    private final WorkspaceService workspace;

    private final long wsId;

    private final CockpitProfile profile;

    private final Configuration jooq;

    private final ArtifactServer httpServer;

    private final WorkspaceDbOperations workspaceDb;

    @Inject
    public WorkspaceResource(@NotNull @PathParam("wsId") @Min(1) long wsId, @Pac4JProfile CockpitProfile profile,
            WorkspacesService workspaces, Configuration jooq, ArtifactServer httpServer,
            WorkspaceDbOperations workspaceDb) {
        this.profile = profile;
        this.wsId = wsId;
        this.jooq = jooq;
        this.httpServer = httpServer;
        this.workspaceDb = workspaceDb;
        this.workspace = workspaces.get(wsId, profile.getId());
    }

    private WorkspacesRecord get(Configuration conf) {
        WorkspacesRecord ws = DSL.using(conf).selectFrom(WORKSPACES).where(WORKSPACES.ID.eq(wsId)).fetchOne();

        if (ws == null) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        return ws;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceOverviewContent overview() {
        return DSL.using(jooq).transactionResult(conf -> {
            WorkspacesRecord ws = get(conf);

            List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_WORKSPACES_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)).fetchInto(USERS);

            return new WorkspaceOverviewContent(ws, wsUsers);
        });
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceOverviewContent put(WorkspaceUpdate update) {
        return DSL.using(jooq).transactionResult(conf -> {
            WorkspacesRecord ws = get(conf);

            if (update.name != null) {
                ws.setName(update.name);
            }

            if (update.description != null) {
                ws.setDescription(update.description);
            }

            ws.store();

            List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_WORKSPACES_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)).fetchInto(USERS);

            return new WorkspaceOverviewContent(ws, wsUsers);
        });
    }

    @GET
    @Path("/content")
    @Produces(MediaType.APPLICATION_JSON + ";qs=1")
    public WorkspaceFullContent content() {
        return DSL.using(jooq).transactionResult(conf -> {
            WorkspacesRecord ws = get(conf);

            WorkspaceContentBuilder c = WorkspaceContent.builder();
            workspaceDb.fetchWorkspaceFromDatabase(conf, ws, c);

            List<UsersRecord> wsUsers = DSL.using(conf).select().from(USERS).join(USERS_WORKSPACES)
                    .onKey(FK_USERS_WORKSPACES_USERNAME).where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId)).fetchInto(USERS);

            return new WorkspaceFullContent(ws, wsUsers, c.build());
        });
    }

    /**
     * Produces {@link WorkspaceEvent}
     */
    @GET
    @Path("/content")
    @Produces(SseFeature.SERVER_SENT_EVENTS + ";qs=0.5")
    public EventOutput sse() throws IOException {
        return workspace.addBroadcastClient(profile.getId());
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceDeleted delete() {
        return workspace.delete();
    }

    @POST
    @Path("/buses")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public BusInProgress addBus(@NotNull @Valid BusImport nb) {
        return workspace.importBus(nb);
    }

    @DELETE
    @Path("/buses/{bId}")
    @Produces(MediaType.APPLICATION_JSON)
    public BusDeleted delete(@NotNull @PathParam("bId") @Min(1) long bId) {
        return workspace.deleteBus(profile.getId(), bId);
    }

    @PUT
    @Path("/sharedlibraries/{slId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public SLStateChanged changeSLState(@NotNull @PathParam("slId") @Min(1) long slId,
            @NotNull @Valid SLChangeState action) {
        return workspace.changeSLState(slId, action);
    }

    @PUT
    @Path("/serviceassemblies/{saId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Warnings({ @ResponseCode(code = 409, condition = "The state transition is not valid.") })
    public SAStateChanged changeSAState(@NotNull @PathParam("saId") @Min(1) long saId,
            @NotNull @Valid SAChangeState action) {
        return workspace.changeSAState(saId, action);
    }

    @PUT
    @Path("/components/{compId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Warnings({ @ResponseCode(code = 409, condition = "The state transition is not valid.") })
    public ComponentStateChanged changeComponentState(@NotNull @PathParam("compId") @Min(1) long compId,
            @NotNull @Valid ComponentChangeState action) {
        return workspace.changeComponentState(compId, action);
    }

    @PUT
    @Path("/components/{compId}/parameters")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public void changeComponentParameters(@NotNull @PathParam("compId") @Min(1) long compId,
            @NotNull @Valid ComponentChangeParameters action) {
        workspace.changeComponentParameters(compId, action);
    }

    /**
     * @param containerId
     * @param file
     * @param fileDisposition
     * @param overrides Override the name and the version of the shared library.
     * An example of overrides:
     * <pre class="prettyprint language-json">
     * {
     *   "sharedLibrary": {
     *     "name": "SL 1",
     *     "version": "1.0"
     *   }
     * }
     * </pre>
     * @return
     * @throws Exception
     */
    @POST
    @Path("/containers/{containerId}/sharedlibraries")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceContent deploySharedLibrary(@NotNull @PathParam("containerId") @Min(1) long containerId,
            @NotNull @FormDataParam("file") InputStream file,
            @NotNull @FormDataParam("file") FormDataContentDisposition fileDisposition,
            @Nullable @Valid @FormDataParam("overrides") SLDeployOverrides overrides)
            throws Exception {
        if (!DSL.using(jooq).fetchExists(CONTAINERS, CONTAINERS.ID.eq(containerId))) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        String filename = StringUtils.isEmpty(fileDisposition.getFileName()) ? "sl.zip" : fileDisposition.getFileName();

        try (ServedArtifact sa = httpServer.serve(filename, file)) {

            Jbi descriptor;
            try (FileSystem fs = FileSystems.newFileSystem(sa.getFile().toPath(), null)) {
                java.nio.file.Path jbiPath = fs.getPath(JBIDescriptorBuilder.JBI_DESCRIPTOR_RESOURCE_IN_ARCHIVE);
                try (InputStream jbiIn = Files.newInputStream(jbiPath)) {
                    descriptor = JBIDescriptorBuilder.getInstance().buildJavaJBIDescriptor(jbiIn);
                }

                if (overrides != null && overrides.sharedLibrary != null) {
                    SharedLibraryIdentifier slOverrides = overrides.sharedLibrary;
                    descriptor.getSharedLibrary().getIdentification().setName(slOverrides.name);
                    descriptor.getSharedLibrary().setVersion(slOverrides.version);
                    Files.delete(jbiPath);
                    try (OutputStream jbiOut = Files.newOutputStream(jbiPath)) {
                        JBIDescriptorBuilder.getInstance().writeXMLJBIdescriptor(descriptor, jbiOut);
                    }
                }
            } catch (Exception e) {
                throw filterFileExceptions(e);
            } catch (ZipError e) {
                throw filterZipError(e);
            }

            return workspace.deploySharedLibrary(descriptor.getSharedLibrary().getIdentification().getName(),
                    descriptor.getSharedLibrary().getVersion(), sa.getArtifactExternalUrl(), containerId);
        }
    }

    @POST
    @Path("/components/{componentId}/serviceunits")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceContent deployServiceUnit(@NotNull @PathParam("componentId") @Min(1) long componentId,
            @NotNull @FormDataParam("file") InputStream file,
            @NotNull @FormDataParam("file") FormDataContentDisposition fileDisposition,
            @NotEmpty @FormDataParam("name") String name) throws IOException, JBIDescriptorException {
        ComponentsRecord component = DSL.using(jooq).selectFrom(COMPONENTS).where(COMPONENTS.ID.eq(componentId))
                .fetchOne();

        if (component == null) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        String saName = "sa-" + name;

        try (ServedArtifact sa = httpServer.serve(saName + ".zip",
                os -> PetalsUtils.createSAfromSU(file, os, saName, name, component.getName()))) {
            return workspace.deployServiceAssembly(saName, sa.getArtifactExternalUrl(), component.getContainerId());
        }
    }

    /**
     * @param containerId
     * @param file
     * @param fileDisposition
     * @param overrides Override the name of the component and/or the shared libraries needed by the component, they are optional.
     * An example of overrides:
     * <pre class="prettyprint language-json">
     * {
     *   "name": "petals-se-pojo",
     *   "sharedLibraries": [
     *     {
     *       "name": "SL 1",
     *       "version": "1.0"
     *     },
     *     {
     *       "name": "SL 2",
     *       "version": "2.0alpha"
     *     }
     *   ]
     * }
     * </pre>
     * @return
     * @throws Exception
     */
    @POST
    @Path("/containers/{containerId}/components")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceContent deployComponent(@NotNull @PathParam("containerId") @Min(1) long containerId,
            @NotNull @FormDataParam("file") InputStream file,
            @NotNull @FormDataParam("file") FormDataContentDisposition fileDisposition,
            @Nullable @Valid @FormDataParam("overrides") ComponentDeployOverrides overrides) throws Exception {
        if (!DSL.using(jooq).fetchExists(CONTAINERS, CONTAINERS.ID.eq(containerId))) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        String filename = StringUtils.isEmpty(fileDisposition.getFileName()) ? "component.zip"
                : fileDisposition.getFileName();

        try (ServedArtifact sa = httpServer.serve(filename, file)) {
            Jbi descriptor;
            try (FileSystem fs = FileSystems.newFileSystem(sa.getFile().toPath(), null)) {
                java.nio.file.Path jbiPath = fs.getPath(JBIDescriptorBuilder.JBI_DESCRIPTOR_RESOURCE_IN_ARCHIVE);
                try (InputStream jbiIn = Files.newInputStream(jbiPath)) {
                    descriptor = JBIDescriptorBuilder.getInstance().buildJavaJBIDescriptor(jbiIn);
                }

                if (overrides != null) {
                    boolean descriptorOverriden = false;
                    Set<SharedLibraryIdentifier> newSharedLibs = overrides.sharedLibraries;

                    if (newSharedLibs != null) {
                        List<Component.SharedLibrary> sharedLibraryList = descriptor.getComponent()
                                .getSharedLibraryList();
                        sharedLibraryList.clear();
                        newSharedLibs.forEach(sl -> sharedLibraryList.add(sl.toJbiXml()));
                        descriptorOverriden = true;
                    }

                    if (overrides.name != null && !overrides.name.trim().isEmpty()) {
                        descriptor.getComponent().getIdentification().setName(overrides.name);
                        descriptorOverriden = true;
                    }

                    if (descriptorOverriden) {
                        Files.delete(jbiPath);
                        try (OutputStream jbiOut = Files.newOutputStream(jbiPath)) {
                            JBIDescriptorBuilder.getInstance().writeXMLJBIdescriptor(descriptor, jbiOut);
                        }
                    }
                }
            } catch (Exception e) {
                throw filterFileExceptions(e);
            } catch (ZipError e) {
                throw filterZipError(e);
            }

            return workspace.deployComponent(descriptor.getComponent().getIdentification().getName(),
                    ComponentMin.Type.from(descriptor.getComponent().getType()), sa.getArtifactExternalUrl(),
                    containerId);
        }
    }

    /**
     * @param containerId
     * @param file
     * @param fileDisposition
     * @param overrides Override the name of the service assembly.
     * An example of overrides:
     * <pre>sa-new-name</pre>
     * @return
     * @throws Exception
     */
    @POST
    @Path("/containers/{containerId}/serviceassemblies")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public WorkspaceContent deployServiceAssembly(@NotNull @PathParam("containerId") @Min(1) long containerId,
            @NotNull @FormDataParam("file") InputStream file,
            @NotNull @FormDataParam("file") FormDataContentDisposition fileDisposition,
            @Nullable @Valid @FormDataParam("overrides") SADeployOverrides overrides)
            throws Exception {
        if (!DSL.using(jooq).fetchExists(CONTAINERS, CONTAINERS.ID.eq(containerId))) {
            throw new WebApplicationException(Status.NOT_FOUND);
        }

        String filename = StringUtils.isEmpty(fileDisposition.getFileName()) ? "sa.zip" : fileDisposition.getFileName();

        try (ServedArtifact sa = httpServer.serve(filename, file)) {
            Jbi descriptor;
            try (FileSystem fs = FileSystems.newFileSystem(sa.getFile().toPath(), null)) {
                java.nio.file.Path jbiPath = fs.getPath(JBIDescriptorBuilder.JBI_DESCRIPTOR_RESOURCE_IN_ARCHIVE);
                try (InputStream jbiIn = Files.newInputStream(jbiPath)) {
                    descriptor = JBIDescriptorBuilder.getInstance().buildJavaJBIDescriptor(jbiIn);
                }

                if (overrides != null && overrides.name != null && !overrides.name.trim().isEmpty()) {
                    descriptor.getServiceAssembly().getIdentification().setName(overrides.name);
                    Files.delete(jbiPath);
                    try (OutputStream jbiOut = Files.newOutputStream(jbiPath)) {
                        JBIDescriptorBuilder.getInstance().writeXMLJBIdescriptor(descriptor, jbiOut);
                    }
                }
            } catch (Exception e) {
                throw filterFileExceptions(e);
            } catch (ZipError e) {
                throw filterZipError(e);
            }

            return workspace.deployServiceAssembly(descriptor.getServiceAssembly().getIdentification().getName(),
                    sa.getArtifactExternalUrl(), containerId);
        }
    }

    private Exception filterFileExceptions(Exception e) {
        if (e instanceof NoSuchFileException || e instanceof ProviderNotFoundException) {
            LOG.debug("Returning 422 Unprocessable entity because of :", e);
            return new WebApplicationException("Unprocessable entity", e, 422);
        } else if (e instanceof JBIDescriptorException) {
            LOG.debug("Returning 422 Unprocessable JBI entity because of :", e);
            return new WebApplicationException("Unprocessable JBI entity", e, 422);
        }
            return e;
    }

    private WebApplicationException filterZipError(ZipError e) {
        LOG.debug("Returning 422 Unprocessable zip entity because of :", e);
        return new WebApplicationException("Unprocessable zip entity", e, 422);
    }

    @POST
    @Path("/users/")
    @Consumes(MediaType.APPLICATION_JSON)
    public void addUsers(@Valid AddUser userToAdd) {
        try {
            DSL.using(jooq).insertInto(USERS_WORKSPACES).set(USERS_WORKSPACES.WORKSPACE_ID, wsId)
                    .set(USERS_WORKSPACES.USERNAME, userToAdd.id).onDuplicateKeyIgnore().execute();
        } catch (DataAccessException e) {
            if (e.sqlStateClass().equals(SQLStateClass.C23_INTEGRITY_CONSTRAINT_VIOLATION)) {
                throw new WebApplicationException(Status.CONFLICT);
            } else {
                throw e;
            }
        }
    }

    @DELETE
    @Path("/users/{id}")
    public void deleteUser(@NotEmpty @PathParam("id") String username) {
        DSL.using(jooq).delete(USERS_WORKSPACES)
                .where(USERS_WORKSPACES.WORKSPACE_ID.eq(wsId).and(USERS_WORKSPACES.USERNAME.eq(username))).execute();
    }

    @POST
    @Path("/servicesrefresh/")
    public void servicesRefresh() {
        workspace.refreshServices();
    }

    public static class AddUser {

        @NotEmpty
        @JsonProperty
        public final String id;

        public AddUser(@JsonProperty("id") String id) {
            this.id = id;
        }
    }

    public static class WorkspaceOverviewContent {

        @Valid
        @JsonProperty
        public final WorkspaceOverview workspace;

        @Valid
        @JsonProperty
        public final ImmutableMap<String, UserMin> users;

        public WorkspaceOverviewContent(WorkspacesRecord ws, List<UsersRecord> users) {
            this.users = users.stream().collect(ImmutableMap.toImmutableMap(UsersRecord::getUsername, UserMin::new));
            List<String> wsUsernames = users.stream().map(UsersRecord::getUsername)
                    .collect(ImmutableList.toImmutableList());
            this.workspace = new WorkspaceOverview(ws.getId(), ws.getName(), wsUsernames, ws.getDescription());
        }

        @JsonCreator
        private WorkspaceOverviewContent(@JsonProperty("workspace") WorkspaceOverview workspace,
                @JsonProperty("users") Map<String, UserMin> users) {
            this.workspace = workspace;
            this.users = ImmutableMap.copyOf(users);
        }
    }

    @JsonInclude(Include.NON_NULL)
    public static class WorkspaceUpdate {

        @Nullable
        @JsonProperty
        private final String name;

        @Nullable
        @JsonProperty
        private final String description;

        public WorkspaceUpdate(@Nullable @JsonProperty("name") String name,
                @Nullable @JsonProperty("description") String description) {
            this.name = name;
            this.description = description;
        }
    }

    public static class WorkspaceOverview extends Workspace {

        @NotNull
        public final String description;

        public WorkspaceOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("users") List<String> users, @JsonProperty("description") String description) {
            super(id, name, users);
            this.description = description;
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

        public BusInProgress(BusesRecord bDb) {
            this(bDb.getId(), bDb.getImportIp(), bDb.getImportPort(), bDb.getImportUsername(), bDb.getImportError());
        }

        @JsonCreator
        private BusInProgress(@JsonProperty("id") String id, @JsonProperty("ip") String ip,
                @JsonProperty("port") int port, @JsonProperty("username") String username,
                @Nullable @JsonProperty("importError") String importError) {
            this(Long.valueOf(id), ip, port, username, importError);
        }

        private BusInProgress(long id, String ip, int port, String username, @Nullable String importError) {
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

    public static class SAStateChanged implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long id;

        @NotNull
        @JsonProperty
        public final ServiceAssemblyMin.State state;

        @JsonCreator
        public SAStateChanged(@JsonProperty("id") long id, @JsonProperty("state") ServiceAssemblyMin.State state) {
            this.id = id;
            this.state = state;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }

        public boolean mayChangeServicesCommingFrom(ServiceAssemblyMin.State previousState) {
            // SA starts proposing services when started
            // SA may stop proposing services when unloaded, so we check for shutdown and unknown as well
            switch (this.state) {
                case Unloaded:
                    switch (previousState) {
                        case Started:
                        case Stopped:
                        case Shutdown:
                            return true;
                        default:
                            return false;
                    }

                case Started:
                    switch (previousState) {
                        case Shutdown:
                        case Unloaded:
                            return true;
                        default:
                            return false;
                    }

                case Unknown:
                    switch (previousState) {
                        case Shutdown:
                        case Started:
                        case Stopped:
                            return true;
                        default:
                            return false;
                    }

                default:
                    return false;
            }
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

        public boolean mayChangeServicesCommingFrom(ComponentMin.State previousState) {
            // Component starts proposing services when started
            // Components stops proposing services when uninstalled(shutdown),
            // so we check for unloaded and unknown as well
            switch (this.state) {
                case Unloaded:
                case Loaded:
                    switch (previousState) {
                        case Started:
                        case Stopped:
                        case Shutdown:
                            return true;
                        default:
                            return false;
                    }

                case Started:
                    switch (previousState) {
                        case Shutdown:
                            return true;
                        default:
                            return false;
                    }

                case Unknown:
                    switch (previousState) {
                        case Loaded:
                        case Shutdown:
                        case Started:
                        case Stopped:
                            return true;
                        default:
                            return false;
                    }

                default:
                    return false;
            }
        }
    }

    public static class SLStateChanged implements WorkspaceEvent.Data {

        @NotNull
        @Min(1)
        public final long id;

        @NotNull
        @JsonProperty
        public final SharedLibraryMin.State state;

        @JsonCreator
        public SLStateChanged(@JsonProperty("id") long id, @JsonProperty("state") SharedLibraryMin.State state) {
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

        @Valid
        public final WorkspaceContent content;

        @JsonCreator
        public BusDeleted(@JsonProperty("id") long id, @JsonProperty("reason") String reason, @JsonProperty("content") WorkspaceContent content) {
            this.id = id;
            this.reason = reason;
            this.content = content;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class WorkspaceFullContent implements WorkspaceEvent.Data {

        @Valid
        @JsonProperty
        public final WorkspaceOverview workspace;

        @Valid
        @JsonProperty
        public final ImmutableMap<String, UserMin> users;

        @Valid
        @JsonUnwrapped
        public final WorkspaceContent content;

        public WorkspaceFullContent(WorkspacesRecord ws, List<UsersRecord> users, WorkspaceContent content) {
            this.users = users.stream().collect(ImmutableMap.toImmutableMap(UsersRecord::getUsername, UserMin::new));
            List<String> wsUsernames = users.stream().map(UsersRecord::getUsername)
                    .collect(ImmutableList.toImmutableList());
            this.workspace = new WorkspaceOverview(ws.getId(), ws.getName(), wsUsernames, ws.getDescription());
            this.content = content;
        }

        @JsonCreator
        private WorkspaceFullContent() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this.users = ImmutableMap.of();
            this.content = new WorkspaceContent(ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                    ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(), ImmutableMap.of(),
                    ImmutableMap.of(), ImmutableMap.of());
            this.workspace = new WorkspaceOverview(0, "", ImmutableList.of(), "");
        }
    }

    public static class WorkspaceEvent {

        public interface Data {

        }

        public enum Event {
            WORKSPACE_CONTENT, BUS_IMPORT, BUS_IMPORT_ERROR, BUS_IMPORT_OK, SA_STATE_CHANGE, COMPONENT_STATE_CHANGE,
            BUS_DELETED, SA_DEPLOYED, WORKSPACE_DELETED, COMPONENT_DEPLOYED, SL_DEPLOYED, SL_STATE_CHANGE,
            SERVICES_UPDATED
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

        public static WorkspaceEvent saStateChange(SAStateChanged ns) {
            return new WorkspaceEvent(Event.SA_STATE_CHANGE, ns);
        }

        public static WorkspaceEvent slStateChange(SLStateChanged ns) {
            return new WorkspaceEvent(Event.SL_STATE_CHANGE, ns);
        }

        public static WorkspaceEvent componentStateChange(ComponentStateChanged ns) {
            return new WorkspaceEvent(Event.COMPONENT_STATE_CHANGE, ns);
        }

        public static WorkspaceEvent busDeleted(BusDeleted bd) {
            return new WorkspaceEvent(Event.BUS_DELETED, bd);
        }

        public static WorkspaceEvent saDeployed(WorkspaceContent sud) {
            return new WorkspaceEvent(Event.SA_DEPLOYED, sud);
        }

        public static WorkspaceEvent componentDeployed(WorkspaceContent cd) {
            return new WorkspaceEvent(Event.COMPONENT_DEPLOYED, cd);
        }

        public static WorkspaceEvent sharedLibraryDeployed(WorkspaceContent cd) {
            return new WorkspaceEvent(Event.SL_DEPLOYED, cd);
        }

        public static WorkspaceEvent busImport(BusInProgress bip) {
            return new WorkspaceEvent(Event.BUS_IMPORT, bip);
        }

        public static WorkspaceEvent servicesUpdated(WorkspaceContent servicesList) {
            return new WorkspaceEvent(Event.SERVICES_UPDATED, servicesList);
        }

        @Override
        public String toString() {
            return "WorkspaceEvent [event=" + event + ", data=" + data + "]";
        }
    }

    public static class SAChangeState {

        @NotNull
        @JsonProperty
        public final ServiceAssemblyMin.State state;

        public SAChangeState(@JsonProperty("state") ServiceAssemblyMin.State state) {
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

    public static class ComponentChangeParameters {

        @NotEmpty
        @JsonProperty
        public final ImmutableMap<String, String> parameters;

        public ComponentChangeParameters(@JsonProperty("parameters") Map<String, String> parameters) {
            this.parameters = ImmutableMap.copyOf(parameters);
        }
    }

    public static class SLChangeState {

        @NotNull
        @JsonProperty
        public final SharedLibraryMin.State state;

        public SLChangeState(@JsonProperty("state") SharedLibraryMin.State state) {
            this.state = state;
        }
    }

    public static class SharedLibraryIdentifier {

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotEmpty
        @JsonProperty
        public final String version;

        public SharedLibraryIdentifier(@JsonProperty("name") String name, @JsonProperty("version") String version) {
            this.name = name;
            this.version = version;
        }

        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            result = prime * result + ((name == null) ? 0 : name.hashCode());
            result = prime * result + ((version == null) ? 0 : version.hashCode());
            return result;
        }

        @SuppressWarnings("unused")
        @Override
        public boolean equals(@Nullable Object obj) {
            if (this == obj)
                return true;
            if (obj == null)
                return false;
            if (getClass() != obj.getClass())
                return false;
            SharedLibraryIdentifier other = (SharedLibraryIdentifier) obj;
            if (name == null) {
                if (other.name != null)
                    return false;
            } else if (!name.equals(other.name))
                return false;
            if (version == null) {
                if (other.version != null)
                    return false;
            } else if (!version.equals(other.version))
                return false;
            return true;
        }


        public static SharedLibraryIdentifier from(SharedLibrary sl) {
            return new SharedLibraryIdentifier(sl.getName(), sl.getVersion());
        }

        public Component.SharedLibrary toJbiXml() {
            Component.SharedLibrary sharedLibrary = new Component.SharedLibrary();
            sharedLibrary.setContent(name);
            sharedLibrary.setVersion(version);
            return sharedLibrary;
        }

        public SharedLibrary toAdmin() {
            return new SharedLibrary(name, version);
        }
    }

    public static class ComponentDeployOverrides {

        @Nullable
        @JsonProperty
        public final String name;

        @Nullable
        @Valid
        @JsonProperty
        public final ImmutableSet<SharedLibraryIdentifier> sharedLibraries;

        public ComponentDeployOverrides(String name) {
            this(name, null);
        }

        public ComponentDeployOverrides(Set<SharedLibraryIdentifier> sharedLibraries) {
            this(null, sharedLibraries);
        }

        public ComponentDeployOverrides(@JsonProperty("name") @Nullable String name,
                @JsonProperty("sharedLibraries") @Nullable Set<SharedLibraryIdentifier> sharedLibraries) {
            this.name = name;
            this.sharedLibraries = sharedLibraries == null ? null : ImmutableSet.copyOf(sharedLibraries);
        }
    }

    public static class SADeployOverrides {

        @Nullable
        @JsonProperty
        public final String name;

        public SADeployOverrides(@JsonProperty("name") @Nullable String name) {
            this.name = name;
        }
    }

    public static class SLDeployOverrides {

        @Nullable
        @Valid
        @JsonProperty
        public final SharedLibraryIdentifier sharedLibrary;

        public SLDeployOverrides(@JsonProperty("sharedLibrary") @Nullable SharedLibraryIdentifier sharedLibrary) {
            this.sharedLibrary = sharedLibrary;
        }
    }

}
