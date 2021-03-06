/**
 * Copyright (C) 2017-2020 Linagora
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.db.api.Assertions.assertThat;
import static org.junit.Assert.assertNotNull;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEASSEMBLIES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SERVICEUNITS;

import java.util.Arrays;
import java.util.Iterator;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.assertj.db.type.Changes;
import org.assertj.db.type.Table;
import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.MultiPart;
import org.glassfish.jersey.media.sse.EventInput;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SADeployOverrides;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SAStateChanged;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class DeploySATest extends AbstractBasicResourceTest {

    private static final String SA_NAME = "fake-sa";

    private static final String SU1_NAME = "su-provide-1";

    private static final String SU2_NAME = "su-provide-2";

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private boolean failDeployment = false;

    private final Container container = new Container("cont1", "host1",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE) {
        @Override
        public void addServiceAssembly(@Nullable ServiceAssembly serviceAssembly) {
            if (failDeployment) {
                throw new PetalsAdminException(new ArtifactAdministrationException("error"));
            }

            super.addServiceAssembly(serviceAssembly);
        }
    };

    private final Component component1 = new Component("comp1", ComponentType.SE, ArtifactState.State.STARTED);

    public DeploySATest() {
        super(ServiceUnitsResource.class, ServiceAssembliesResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerArtifact(component1, container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);

        failDeployment = false;
    }

    private FormDataMultiPart getSAMultiPart() throws Exception {
        return getMultiPart("sa-jbi.xml", "fakeSA");
    }

    @Test
    public void existingContainerForbidden() throws Exception {
        addUser("anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        MultiPart mpe = getSAMultiPart();

        Response post = resource.target("/workspaces/2/containers/" + getId(fContainer) + "/serviceassemblies")
                .request().post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void nonExistingContainerForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSAMultiPart();

        Response post = resource.target("/workspaces/2/containers/3198798/serviceassemblies").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void wrongContainerForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSAMultiPart();

        // the container exists but it's in another workspace
        Response post = resource.target("/workspaces/2/containers/" + getId(container) + "/serviceassemblies").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySAButContainerNotFound() throws Exception {
        final MultiPart mpe = getSAMultiPart();

        Response post = resource.target("/workspaces/1/containers/3987981/serviceassemblies").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void nominal() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            MultiPart mpe = getSAMultiPart();
            WorkspaceContent post = resource
                    .target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ServiceAssemblyFull postDataSA = assertSAContent(post, container, SA_NAME,
                    ImmutableList.of(component1, component1));
            Iterator<ServiceUnitFull> iterator = post.serviceUnits.values().iterator();
            ServiceUnitFull postSU1 = iterator.next();
            ServiceUnitFull postSU2 = iterator.next();
            assertThat(iterator.hasNext()).isFalse();

            assertThat(postSU1.serviceUnit.name).isEqualTo(SU1_NAME);
            assertThat(postSU2.serviceUnit.name).isEqualTo(SU2_NAME);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SA_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertSAContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(container.getServiceAssemblies()).hasSize(1);

            resource.target("/serviceassemblies/" + postDataSA.serviceAssembly.id).request()
                    .get(ServiceUnitOverview.class);
            resource.target("/serviceunits/" + postSU1.serviceUnit.id).request().get(ServiceUnitOverview.class);
            resource.target("/serviceunits/" + postSU2.serviceUnit.id).request().get(ServiceUnitOverview.class);
        }
    }

    @Test
    public void deploySameSaTwice() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            MultiPart mpe = getSAMultiPart();
            WorkspaceContent post = resource
                    .target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            assertThat(container.getServiceAssemblies()).hasSize(1);
            ServiceAssembly serviceAssembly = container.getServiceAssemblies().get(0);
            assertNotNull(serviceAssembly);
            assertThat(serviceAssembly.getServiceUnits()).hasSize(2);


            Changes changes = new Changes(resource.db.getDataSource());
            changes.setStartPointNow();

            WorkspaceContent post2 = resource
                    .target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            changes.setEndPointNow();

            assertThat(container.getServiceAssemblies()).hasSize(1);
            serviceAssembly = container.getServiceAssemblies().get(0);
            assertNotNull(serviceAssembly);
            assertThat(serviceAssembly.getServiceUnits()).hasSize(2);
            assertThat(changes.getChangesOfTable(SERVICEASSEMBLIES.getName()).getChangesList().size()).isEqualTo(0);
            assertThat(changes.getChangesOfTable(SERVICEUNITS.getName()).getChangesList().size()).isEqualTo(0);
        }
    }

    @Test
    public void deploySameSaTwiceStateChanged() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            MultiPart mpe = getSAMultiPart();
            WorkspaceContent post = resource
                    .target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            assertThat(container.getServiceAssemblies()).hasSize(1);
            ServiceAssembly serviceAssembly = container.getServiceAssemblies().get(0);
            assertNotNull(serviceAssembly);
            assertThat(serviceAssembly.getServiceUnits()).hasSize(2);

            assertThat(serviceAssembly.getState()).isEqualTo(ArtifactState.State.SHUTDOWN);
            SAStateChanged put = resource.target("/workspaces/1/serviceassemblies/" + getId(serviceAssembly)).request()
                    .put(Entity.json(new SAChangeState(ServiceAssemblyMin.State.Started)), SAStateChanged.class);
            assertThat(put.state).isEqualTo(ServiceAssemblyMin.State.Started);
            serviceAssembly.setState(ArtifactState.State.SHUTDOWN);

            Changes changes = new Changes(resource.db.getDataSource());
            changes.setStartPointNow();

            WorkspaceContent post2 = resource
                    .target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            changes.setEndPointNow();

            assertThat(container.getServiceAssemblies()).hasSize(1);
            serviceAssembly = container.getServiceAssemblies().get(0);
            assertNotNull(serviceAssembly);
            assertThat(serviceAssembly.getServiceUnits()).hasSize(2);
            assertThat(serviceAssembly.getState()).isEqualTo(ArtifactState.State.SHUTDOWN);
            assertThat(changes.getChangesOfTable(SERVICEUNITS.getName()).getChangesList().size()).isEqualTo(0);
            assertThat(changes.getChangesOfTable(SERVICEASSEMBLIES.getName()).getChangesList().size()).isEqualTo(1);
            assertThat(new Table(resource.db.getDataSource(), SERVICEASSEMBLIES.getName())).hasNumberOfRows(1).row()
                    .column(SERVICEASSEMBLIES.STATE.getName()).value().isEqualTo("Shutdown");
        }
    }

    @Test
    public void conflictContainerError() throws Exception {
        failDeployment = true;

        MultiPart mpe = getSAMultiPart();
        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = post.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("error");
        assertThat(err.getDetails()).contains(DeploySATest.class.getName() + "$1.addServiceAssembly");

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
    }

    @Test
    public void emptyZip() throws Exception {
        FormDataMultiPart mpe = getMultiPartEmptyZip("fakeSA");

        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
        assertThat(post.getStatus()).isEqualTo(422);
    }

    @Test
    public void notAZip() throws Exception {
        FormDataMultiPart mpe = getMultiPartFakeZip("fakeSA");

        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
        assertThat(post.getStatus()).isEqualTo(422);
    }

    @Test
    public void overrideValidName() throws Exception {
        overrideName("test-SA-name", "test-SA-name");
    }

    @Test
    public void overrideEmptyName() throws Exception {
        overrideName("", SA_NAME);
    }

    @Test
    public void overrideNullName() throws Exception {
        overrideName(null, SA_NAME);
    }

    private void overrideName(@Nullable String newName, String expectedName) throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            SADeployOverrides overrides = new SADeployOverrides(newName);
            FormDataMultiPart mpe = getSAMultiPart().field("overrides", overrides, MediaType.APPLICATION_JSON_TYPE);

            WorkspaceContent post = resource
                    .target("/workspaces/1/containers/" + getId(container) + "/serviceassemblies").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ServiceAssemblyFull postDataSA = assertSAContent(post, container, expectedName,
                    ImmutableList.of(component1, component1));

            Iterator<ServiceUnitFull> iterator = post.serviceUnits.values().iterator();
            ServiceUnitFull postSU1 = iterator.next();
            ServiceUnitFull postSU2 = iterator.next();
            assertThat(iterator.hasNext()).isFalse();

            assertThat(postSU1.serviceUnit.name).isEqualTo(SU1_NAME);
            assertThat(postSU2.serviceUnit.name).isEqualTo(SU2_NAME);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SA_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertSAContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(container.getServiceAssemblies()).hasSize(1);

            resource.target("/serviceassemblies/" + postDataSA.serviceAssembly.id).request()
                    .get(ServiceUnitOverview.class);
            resource.target("/serviceunits/" + postSU1.serviceUnit.id).request().get(ServiceUnitOverview.class);
            resource.target("/serviceunits/" + postSU2.serviceUnit.id).request().get(ServiceUnitOverview.class);
        }
    }
}
