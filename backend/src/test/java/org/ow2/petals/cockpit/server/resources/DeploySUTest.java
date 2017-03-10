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
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.ServiceUnit;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.SUDeployed;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.testing.junit.ResourceTestRule;
import javaslang.Tuple;

public class DeploySUTest extends AbstractCockpitResourceTest {

    private static final String SU_NAME = "the-su-name";

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE);

    private final Component component1 = new Component("comp1", ComponentType.SE, ArtifactState.State.STARTED);

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ServiceUnitsResource.class, WorkspaceResource.class);

    @Before
    public void setUp() {
        petals.registerDomain(domain);
        petals.registerContainer(container);
        petals.registerArtifact(component1, container);

        setupWorkspace(1, "test",
                Arrays.asList(Tuple.of(10L, domain, "phrase",
                        Arrays.asList(
                                Tuple.of(20L, container, Arrays.asList(Tuple.of(30L, component1, Arrays.asList())))))),
                ADMIN);
    }

    @SuppressWarnings({ "resource" })
    private static MultiPart getSUMultiPart() throws URISyntaxException {
        // fakeSU is actually an empty file, but we never read it in cockpit,
        // so it's ok for tests (until we test with a real petals container)
        return new FormDataMultiPart().field("name", SU_NAME).bodyPart(
                new FileDataBodyPart("file", new File(DeploySUTest.class.getResource("/fakeSU.zip").toURI())));
    }

    @Test
    public void deploySUExistingComponentForbidden() throws Exception {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2",
                Arrays.asList(Tuple.of(11L, domain, "phrase",
                        Arrays.asList(
                                Tuple.of(21L, container, Arrays.asList(Tuple.of(31L, component1, Arrays.asList())))))),
                "anotheruser");

        MultiPart mpe = getSUMultiPart();

        Response post = resources.getJerseyTest().target("/workspaces/2/components/31/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySUNonExistingComponentForbidden() throws Exception {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSUMultiPart();

        Response post = resources.getJerseyTest().target("/workspaces/2/components/31/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySUWrongComponentForbidden() throws Exception {
        DSL.using(dbRule.getConnectionJdbcUrl()).executeInsert(new UsersRecord("anotheruser", "...", "...", null));

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSUMultiPart();

        Response post = resources.getJerseyTest().target("/workspaces/2/components/30/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySUButComponentNotFound() throws Exception {
        final MultiPart mpe = getSUMultiPart();

        Response post = resources.getJerseyTest().target("/workspaces/1/components/31/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySU() throws Exception {
        try (EventInput eventInput = resources.getJerseyTest().target("/workspaces/1")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            MultiPart mpe = getSUMultiPart();
            SUDeployed post = resources.getJerseyTest().target("/workspaces/1/components/30/serviceunits").request()
                    .post(Entity.entity(mpe, mpe.getMediaType()), SUDeployed.class);

            assertThat(post.compId).isEqualTo(30);
            assertThat(post.serviceUnit.name).isEqualTo(SU_NAME);
            assertThat(post.serviceUnit.saName).isEqualTo("sa-" + SU_NAME);
            assertThat(post.serviceUnit.state).isEqualTo(ServiceUnitMin.State.Shutdown);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SU_DEPLOYED");
                SUDeployed data = e.readData(SUDeployed.class);
                a.assertThat(data.compId).isEqualTo(post.compId);
                a.assertThat(data.serviceUnit.id).isEqualTo(post.serviceUnit.id);
                a.assertThat(data.serviceUnit.name).isEqualTo(post.serviceUnit.name);
                a.assertThat(data.serviceUnit.saName).isEqualTo(post.serviceUnit.saName);
                a.assertThat(data.serviceUnit.state).isEqualTo(post.serviceUnit.state);
            });

            assertThat(httpServer.wasCalled()).isEqualTo(true);
            assertThat(httpServer.wasClosed()).isEqualTo(true);

            assertThat(container.getServiceAssemblies()).hasSize(1);
            ServiceAssembly sa = container.getServiceAssemblies().iterator().next();
            assertThat(sa.getName()).isEqualTo(post.serviceUnit.saName);
            assertThat(sa.getState()).isEqualTo(ArtifactState.State.SHUTDOWN);
            assertThat(sa.getServiceUnits()).hasSize(1);
            ServiceUnit su = sa.getServiceUnits().iterator().next();
            assertThat(su.getName()).isEqualTo(post.serviceUnit.name);
            assertThat(su.getTargetComponent()).isEqualTo(component1.getName());

            ServiceUnitOverview overview = resources.getJerseyTest().target("/serviceunits/" + post.serviceUnit.id)
                    .request().get(ServiceUnitOverview.class);

            assertThat(overview.id).isEqualTo(post.serviceUnit.id);
            assertThat(overview.name).isEqualTo(post.serviceUnit.name);
            assertThat(overview.saName).isEqualTo(post.serviceUnit.saName);
            assertThat(overview.state).isEqualTo(post.serviceUnit.state);
        }
    }

}
