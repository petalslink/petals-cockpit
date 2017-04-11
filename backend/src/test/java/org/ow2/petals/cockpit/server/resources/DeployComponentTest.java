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

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.glassfish.jersey.media.multipart.MultiPart;
import org.glassfish.jersey.media.multipart.file.FileDataBodyPart;
import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.jooq.impl.DSL;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentDeployed;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.testing.junit.ResourceTestRule;
import javaslang.Tuple;

public class DeployComponentTest extends AbstractCockpitResourceTest {

    // this is the name declared in the zip's jbi file
    private static final String COMP_NAME = "petals-bc-soap-provide";

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE);

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ComponentsResource.class, WorkspaceResource.class);

    @Before
    public void setUp() {
        petals.registerDomain(domain);
        petals.registerContainer(container);

        setupWorkspace(1, "test",
                Arrays.asList(
                        Tuple.of(10L, domain, "phrase", Arrays.asList(Tuple.of(20L, container, Arrays.asList())))),
                ADMIN);
    }

    @SuppressWarnings({ "resource" })
    private static MultiPart getComponentMultiPart() throws URISyntaxException {
        // fake-jbi-component-soap only contains the jbi file
        // so it's ok for tests (until we test with a real petals container)
        return new FormDataMultiPart().field("name", COMP_NAME).field("type", "BC").bodyPart(new FileDataBodyPart(
                "file", new File(DeployComponentTest.class.getResource("/fake-jbi-component-soap.zip").toURI())));
    }

    @Test
    public void deployComponentExistingContainerForbidden() throws Exception {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2",
                Arrays.asList(
                        Tuple.of(11L, domain, "phrase", Arrays.asList(Tuple.of(21L, container, Arrays.asList())))),
                "anotheruser");

        MultiPart mpe = getComponentMultiPart();

        Response post = resources.target("/workspaces/2/containers/21/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getComponents()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deployComponentNonExistingContainerForbidden() throws Exception {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getComponentMultiPart();

        Response post = resources.target("/workspaces/2/containers/21/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getComponents()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deployCompnentWrongContainerForbidden() throws Exception {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getComponentMultiPart();

        // the container exists but it's in another workspace
        Response post = resources.target("/workspaces/2/containers/20/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getComponents()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deployComponentButContainerNotFound() throws Exception {
        final MultiPart mpe = getComponentMultiPart();

        Response post = resources.target("/workspaces/1/containers/21/components").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getComponents()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deployComponent() throws Exception {
        try (EventInput eventInput = resources.target("/workspaces/1").request(SseFeature.SERVER_SENT_EVENTS_TYPE)
                .get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            MultiPart mpe = getComponentMultiPart();
            ComponentDeployed post = resources.target("/workspaces/1/containers/20/components").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), ComponentDeployed.class);

            assertThat(post.containerId).isEqualTo(20);
            assertThat(post.component.name).isEqualTo(COMP_NAME);
            assertThat(post.component.type).isEqualTo(ComponentMin.Type.BC);
            assertThat(post.component.state).isEqualTo(ComponentMin.State.Loaded);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("COMPONENT_DEPLOYED");
                ComponentDeployed data = e.readData(ComponentDeployed.class);
                a.assertThat(data.containerId).isEqualTo(post.containerId);
                a.assertThat(data.component.id).isEqualTo(post.component.id);
                a.assertThat(data.component.name).isEqualTo(post.component.name);
                a.assertThat(data.component.type).isEqualTo(post.component.type);
                a.assertThat(data.component.state).isEqualTo(post.component.state);
            });

            assertThat(httpServer.wasCalled()).isEqualTo(true);
            assertThat(httpServer.wasClosed()).isEqualTo(true);

            assertThat(container.getComponents()).hasSize(1);
            Component comp = container.getComponents().iterator().next();
            assertThat(comp.getName()).isEqualTo(post.component.name);
            assertThat(comp.getState()).isEqualTo(ArtifactState.State.LOADED);
            assertThat(comp.getType()).isEqualTo("BC");

            ComponentOverview overview = resources.target("/components/" + post.component.id).request()
                    .get(ComponentOverview.class);

            assertThat(overview.id).isEqualTo(post.component.id);
            assertThat(overview.name).isEqualTo(post.component.name);
            assertThat(overview.type).isEqualTo(post.component.type);
            assertThat(overview.state).isEqualTo(post.component.state);
        }
    }

}
