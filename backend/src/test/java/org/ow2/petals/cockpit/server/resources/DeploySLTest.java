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

import java.util.Arrays;

import javax.ws.rs.ClientErrorException;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.MultiPart;
import org.glassfish.jersey.media.sse.EventInput;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryFull;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SLDeployOverrides;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SharedLibraryIdentifier;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class DeploySLTest extends AbstractBasicResourceTest {

    private static final String SL_NAME = "sl";

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private boolean failDeployment = false;

    private final Container container = new Container("cont1", "host1",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE) {
        @Override
        public void addSharedLibrary(@Nullable SharedLibrary sharedLibrary) {
            if (failDeployment) {
                throw new PetalsAdminException(new ArtifactAdministrationException("error"));
            }

            super.addSharedLibrary(sharedLibrary);
        }
    };

    public DeploySLTest() {
        super(SharedLibrariesResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);

        failDeployment = false;
    }

    private FormDataMultiPart getSLMultiPart() throws Exception {
        return getMultiPart("sl-jbi.xml", "fakeSL");
    }

    @Test
    public void existingContainerForbidden() throws Exception {
        addUser("anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        MultiPart mpe = getSLMultiPart();

        Response post = resource.target("/workspaces/2/containers/" + getId(fContainer) + "/sharedlibraries").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getSharedLibraries()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void nonExistingContainerForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSLMultiPart();

        Response post = resource.target("/workspaces/2/containers/3198798/sharedlibraries").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getSharedLibraries()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void wrongContainerForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSLMultiPart();

        // the container exists but it's in another workspace
        Response post = resource.target("/workspaces/2/containers/" + getId(container) + "/sharedlibraries").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getSharedLibraries()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void containerNotFound() throws Exception {
        final MultiPart mpe = getSLMultiPart();

        Response post = resource.target("/workspaces/1/containers/3987981/sharedlibraries").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getSharedLibraries()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void nominal() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            MultiPart mpe = getSLMultiPart();
            WorkspaceContent post = resource.target("/workspaces/1/containers/" + getId(container) + "/sharedlibraries")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            SharedLibraryFull postDataSL = assertSLContent(post, container, SL_NAME, "1.0.0");
            assertThat(postDataSL.components).isEmpty();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SL_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertSLContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(container.getSharedLibraries()).hasSize(1);

            resource.target("/sharedlibraries/" + postDataSL.sharedLibrary.id).request()
                    .get(SharedLibraryOverview.class);
        }
    }

    @Test
    public void conflictContainerError() throws Exception {
        failDeployment = true;

        MultiPart mpe = getSLMultiPart();
        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/sharedlibraries").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = post.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("error");
        assertThat(err.getDetails()).contains(DeploySLTest.class.getName() + "$1.addSharedLibrary");

        assertThat(container.getSharedLibraries()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
    }

    @Test
    public void emptyZip() throws Exception {
        FormDataMultiPart mpe = getMultiPartEmptyZip("fakeSL");

        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/sharedlibraries").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
        assertThat(post.getStatus()).isEqualTo(422);
    }

    @Test
    public void notAZip() throws Exception {
        FormDataMultiPart mpe = getMultiPartFakeZip("fakeSL");

        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/sharedlibraries").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
        assertThat(post.getStatus()).isEqualTo(422);
    }

    @Test
    @SuppressWarnings("null")
    public void overrideWithNullVersion() throws Exception {
        thrown.expect(ClientErrorException.class);
        thrown.expectMessage("HTTP 422");
        // without the cast, eclipse would complain (and he would be right!)
        overrideWith(new SharedLibraryIdentifier(SL_NAME + "-test", (@NonNull String) null));
    }

    @Test
    @SuppressWarnings("null")
    public void overrideWithNullName() throws Exception {
        thrown.expect(ClientErrorException.class);
        thrown.expectMessage("HTTP 422");
        // without the cast, eclipse would complain (and he would be right!)
        overrideWith(new SharedLibraryIdentifier((@NonNull String) null, "3.2.1"));
    }

    @Test
    @SuppressWarnings("null")
    public void overrideWithNullNameAndName() throws Exception {
        thrown.expect(ClientErrorException.class);
        thrown.expectMessage("HTTP 422");
        // without the cast, eclipse would complain (and he would be right!)
        overrideWith(new SharedLibraryIdentifier((@NonNull String) null, (@NonNull String) null));
    }

    @Test
    public void overridewithEmptyVersion() throws Exception {
        thrown.expect(ClientErrorException.class);
        thrown.expectMessage("HTTP 422");
        overrideWith(new SharedLibraryIdentifier(SL_NAME + "-test", ""));
    }

    @Test
    public void overridewithEmptyName() throws Exception {
        thrown.expect(ClientErrorException.class);
        thrown.expectMessage("HTTP 422");
        overrideWith(new SharedLibraryIdentifier("", "6.6.6"));
    }

    @Test
    public void overrideNameAndVersion() throws Exception {
        // expected to succeed
        overrideWith(new SharedLibraryIdentifier(SL_NAME + "-test", "1.0.0"));
    }

    private void overrideWith(SharedLibraryIdentifier sl) throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            SLDeployOverrides overrides = new SLDeployOverrides(sl);

            FormDataMultiPart mpe = getSLMultiPart().field("overrides", overrides, MediaType.APPLICATION_JSON_TYPE);
            WorkspaceContent post = resource.target("/workspaces/1/containers/" + getId(container) + "/sharedlibraries")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            SharedLibraryFull postDataSL = assertSLContent(post, container, sl.name, sl.version);
            assertThat(postDataSL.components).isEmpty();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SL_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertSLContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(container.getSharedLibraries()).hasSize(1);

            resource.target("/sharedlibraries/" + postDataSL.sharedLibrary.id).request()
                    .get(SharedLibraryOverview.class);
        }
    }

}
