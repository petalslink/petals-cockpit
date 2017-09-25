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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.COMPONENTS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.SHAREDLIBRARIES_COMPONENTS;

import java.util.Arrays;
import java.util.Set;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.MultiPart;
import org.glassfish.jersey.media.sse.EventInput;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentDeployOverrides;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SharedLibraryIdentifier;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class DeployComponentTest extends AbstractBasicResourceTest {

    private static final String NOMINAL_JBI_XML = "component-jbi.xml";

    // this is the name declared in the zip's jbi file
    private static final String COMP_NAME = "petals-component";

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private boolean failDeployment = false;

    private final Container container = new Container("cont1", "localhost",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE) {
        @Override
        public void addComponent(@Nullable Component component) {
            if (failDeployment) {
                throw new PetalsAdminException(new ArtifactAdministrationException("error"));
            }

            super.addComponent(component);
        }
    };

    private final SharedLibrary sl = new SharedLibrary("sl", "1.0.0");

    private final SharedLibrary sl2 = new SharedLibrary("sl2", "1.0.0");

    public DeployComponentTest() {
        super(ComponentsResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() throws Exception {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerArtifact(sl, container);
        resource.petals.registerArtifact(sl2, container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);

        failDeployment = false;
    }

    private FormDataMultiPart getComponentMultiPart() throws Exception {
        return getMultiPart(NOMINAL_JBI_XML, "fakeComponent");
    }

    @Test
    public void existingContainerForbidden() throws Exception {
        addUser("anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        MultiPart mpe = getComponentMultiPart();

        Response post = resource.target("/workspaces/2/containers/" + getId(fContainer) + "/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getComponents()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void nonExistingContainerForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        MultiPart mpe = getComponentMultiPart();

        Response post = resource.target("/workspaces/2/containers/234242/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getComponents()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void wrongContainerForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getComponentMultiPart();

        // the container exists but it's in another workspace
        Response post = resource.target("/workspaces/2/containers/" + getId(container) + "/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getComponents()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void containerNotFound() throws Exception {
        final MultiPart mpe = getComponentMultiPart();

        Response post = resource.target("/workspaces/1/containers/29871/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getComponents()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void nominal() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            MultiPart mpe = getComponentMultiPart();
            WorkspaceContent post = resource.target("/workspaces/1/containers/" + getId(container) + "/components")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ComponentFull postC = assertComponentContent(post, container, COMP_NAME);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertComponentContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(requestBy(COMPONENTS.NAME, COMP_NAME)).hasNumberOfRows(1);
            assertThat(container.getComponents()).hasSize(1);
            Component comp = container.getComponents().iterator().next();
            assertThat(comp.getName()).isEqualTo(postC.component.name);
            assertThat(comp.getState()).isEqualTo(ArtifactState.State.LOADED);
            assertThat(comp.getType()).isEqualTo("BC");

            resource.target("/components/" + postC.component.id).request().get(ComponentOverview.class);
        }
    }

    @Test
    public void overrideNoSLWithExistingSL() throws Exception {
        overrideWithExistingSL(NOMINAL_JBI_XML);
    }

    @Test
    public void overrideWrongSLWithExistingSL() throws Exception {
        overrideWithExistingSL("component-with-sl1-jbi.xml");
    }

    @Test
    public void overrideNoSLWithTwoExistingSL() throws Exception {
        overrideWithSL(NOMINAL_JBI_XML,
                ImmutableSet.of(SharedLibraryIdentifier.from(sl), SharedLibraryIdentifier.from(sl2)));
    }

    private void overrideWithExistingSL(String jbiXml) throws Exception {
        overrideWithSL(jbiXml, ImmutableSet.of(SharedLibraryIdentifier.from(sl)));
    }

    private void overrideWithSL(String jbiXml, Set<SharedLibraryIdentifier> sls) throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            ComponentDeployOverrides overrides = new ComponentDeployOverrides(sls);

            FormDataMultiPart mpe = getMultiPart(jbiXml, "fakeComponent").field("overrides", overrides,
                    MediaType.APPLICATION_JSON_TYPE);
            WorkspaceContent post = resource.target("/workspaces/1/containers/" + getId(container) + "/components")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ComponentFull postC = assertComponentContent(post, container, COMP_NAME);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertComponentContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(requestBy(COMPONENTS.NAME, COMP_NAME)).hasNumberOfRows(1);
            assertThat(requestBy(SHAREDLIBRARIES_COMPONENTS.COMPONENT_ID, postC.component.id))
                    .hasNumberOfRows(sls.size()).column(SHAREDLIBRARIES_COMPONENTS.SHAREDLIBRARY_ID.getName())
                    .containsValues(sls.stream().map(sl -> sl.toAdmin()).map(sl -> getId(sl)).toArray());
            assertThat(container.getComponents()).hasSize(1);
            Component comp = container.getComponents().iterator().next();
            assertThat(comp.getName()).isEqualTo(postC.component.name);
            assertThat(comp.getState()).isEqualTo(ArtifactState.State.LOADED);
            assertThat(comp.getType()).isEqualTo("BC");
            assertThat(comp.getSharedLibraries())
                    .containsOnly(sls.stream().map(sl -> sl.toAdmin()).toArray(SharedLibrary[]::new));

            resource.target("/components/" + postC.component.id).request().get(ComponentOverview.class);
        }
    }

    @Test
    public void overrideWithNonExistingSL() throws Exception {
        ComponentDeployOverrides overrides = new ComponentDeployOverrides(
                ImmutableSet.of(new SharedLibraryIdentifier("sl1", "1.0.0")));
        MultiPart mpe = getComponentMultiPart().field("overrides", overrides, MediaType.APPLICATION_JSON_TYPE);
        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertMissingSL(post);
    }

    @Test
    public void overrideName() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            String componentName = "test-compo-name";

            ComponentDeployOverrides overrides = new ComponentDeployOverrides(componentName);
            MultiPart mpe = getComponentMultiPart().field("overrides", overrides, MediaType.APPLICATION_JSON_TYPE);

            WorkspaceContent post = resource.target("/workspaces/1/containers/" + getId(container) + "/components")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ComponentFull postC = assertComponentContent(post, container, componentName);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertComponentContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(requestBy(COMPONENTS.NAME, componentName)).hasNumberOfRows(1);
            assertThat(container.getComponents()).hasSize(1);
            Component comp = container.getComponents().iterator().next();
            assertThat(comp.getName()).isEqualTo(postC.component.name);
            assertThat(comp.getState()).isEqualTo(ArtifactState.State.LOADED);
            assertThat(comp.getType()).isEqualTo("BC");

            resource.target("/components/" + postC.component.id).request().get(ComponentOverview.class);
        }
    }

    @Test
    public void twice() throws Exception {
        nominal();

        MultiPart mpe = getComponentMultiPart();
        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = post.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("The artifact 'petals-component' is deployed, in state 'Loaded'.");

        assertThat(requestBy(COMPONENTS.NAME, "petals-component")).hasNumberOfRows(1);
    }

    @Test
    public void conflictContainerError() throws Exception {
        failDeployment = true;

        MultiPart mpe = getComponentMultiPart();
        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = post.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("error");
        assertThat(err.getDetails()).contains(DeployComponentTest.class.getName() + "$1.addComponent");

        assertThat(container.getComponents()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
    }

    @Test
    public void missingSL() throws Exception {
        MultiPart mpe = getMultiPart("component-with-sl1-jbi.xml", "fakeComponentWithSL");
        Response post = resource.target("/workspaces/1/containers/" + getId(container) + "/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertMissingSL(post);
    }

    private void assertMissingSL(Response post) {
        assertThat(post.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = post.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).contains("Missing SL");

        assertThat(container.getComponents()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
    }

    @Test
    public void nominalWithSL() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput);

            MultiPart mpe = getMultiPart("component-with-sl-jbi.xml", "fakeComponentWithSL");
            WorkspaceContent post = resource.target("/workspaces/1/containers/" + getId(container) + "/components")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ComponentFull postC = assertComponentContent(post, container, COMP_NAME);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertComponentContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(requestBy(SHAREDLIBRARIES_COMPONENTS.COMPONENT_ID, postC.component.id)).hasNumberOfRows(1)
                    .column(SHAREDLIBRARIES_COMPONENTS.SHAREDLIBRARY_ID.getName()).value().isEqualTo(getId(sl));

            assertThat(container.getComponents()).hasSize(1);
            Component comp = container.getComponents().iterator().next();
            assertThat(comp.getName()).isEqualTo(postC.component.name);
            assertThat(comp.getState()).isEqualTo(ArtifactState.State.LOADED);
            assertThat(comp.getType()).isEqualTo("BC");
            assertThat(comp.getSharedLibraries()).containsOnly(sl);

            resource.target("/components/" + postC.component.id).request().get(ComponentOverview.class);
        }
    }
}
