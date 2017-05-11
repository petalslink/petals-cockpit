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

import java.io.File;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Map.Entry;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.assertj.core.api.SoftAssertions;
import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.MultiPart;
import org.glassfish.jersey.media.multipart.file.FileDataBodyPart;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;
import org.ow2.petals.jmx.api.mock.junit.PetalsJmxApiJunitRule.ComponentType;
import org.ow2.petals.jmx.api.mock.junit.configuration.component.InstallationConfigurationServiceClientMock;

import com.google.common.collect.ImmutableMap;

import javaslang.Tuple;

public class DeployComponentTest extends AbstractCockpitResourceTest {

    // this is the name declared in the zip's jbi file
    private static final String COMP_NAME = "petals-bc-soap-provide";

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "localhost",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE);

    public DeployComponentTest() {
        super(ComponentsResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() throws Exception {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);

        resource.jmx.addComponentInstallerClient(COMP_NAME, ComponentType.BINDING,
                new InstallationConfigurationServiceClientMock(), null);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
    }

    @SuppressWarnings("resource")
    private static MultiPart getComponentMultiPart() throws URISyntaxException {
        // fake-jbi-component-soap only contains the jbi file
        // so it's ok for tests (until we test with a real petals container)
        return new FormDataMultiPart().bodyPart(new FileDataBodyPart("file",
                new File(DeployComponentTest.class.getResource("/fake-jbi-component-soap.zip").toURI())));
    }

    @Test
    public void deployComponentExistingContainerForbidden() throws Exception {
        resource.db().executeInsert(new UsersRecord("anotheruser", "...", "...", null));

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
    public void deployComponentNonExistingContainerForbidden() throws Exception {
        resource.db().executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        // TODO THIS CAN?T WORK
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
    public void deployCompnentWrongContainerForbidden() throws Exception {
        resource.db().executeInsert(new UsersRecord("anotheruser", "...", "...", null));

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
    public void deployComponentButContainerNotFound() throws Exception {
        final MultiPart mpe = getComponentMultiPart();

        Response post = resource.target("/workspaces/1/containers/29871/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getComponents()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deployComponent() throws Exception {
        try (EventInput eventInput = resource.target("/workspaces/1/content")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            MultiPart mpe = getComponentMultiPart();
            WorkspaceContent post = resource.target("/workspaces/1/containers/" + getId(container) + "/components")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ComponentFull postC = assertComponentContent(post);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertComponentContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isEqualTo(true);
            assertThat(resource.httpServer.wasClosed()).isEqualTo(true);

            assertThat(container.getComponents()).hasSize(1);
            Component comp = container.getComponents().iterator().next();
            assertThat(comp.getName()).isEqualTo(postC.component.name);
            assertThat(comp.getState()).isEqualTo(ArtifactState.State.LOADED);
            assertThat(comp.getType()).isEqualTo("BC");

            ComponentOverview overview = resource.target("/components/" + postC.component.id).request()
                    .get(ComponentOverview.class);
        }
    }

    private ComponentFull assertComponentContent(WorkspaceContent content) {
        SoftAssertions a = new SoftAssertions();
        ComponentFull res = assertComponentContent(a, content, null);
        a.assertAll();
        return res;
    }

    private ComponentFull assertComponentContent(SoftAssertions a, WorkspaceContent content,
            @Nullable WorkspaceContent control) {
        assertThat(content.buses).isEmpty();
        assertThat(content.busesInProgress).isEmpty();
        assertThat(content.containers).isEmpty();
        assertThat(content.serviceAssemblies).isEmpty();
        assertThat(content.serviceUnits).isEmpty();
        assertThat(content.components).hasSize(1);

        Entry<String, ComponentFull> contentCE = content.components.entrySet().iterator().next();
        ComponentFull contentC = contentCE.getValue();

        a.assertThat(contentCE.getKey()).isEqualTo(Long.toString(contentC.component.id));

        if (control == null) {
            a.assertThat(contentC.containerId).isEqualTo(getId(container));
            a.assertThat(contentC.component.name).isEqualTo(COMP_NAME);
            a.assertThat(contentC.component.type).isEqualTo(ComponentMin.Type.BC);
            a.assertThat(contentC.state).isEqualTo(ComponentMin.State.Loaded);
        } else {
            ComponentFull controlC = content.components.values().iterator().next();
            a.assertThat(contentC).isEqualToComparingFieldByFieldRecursively(controlC);
        }

        return contentC;
    }

}
