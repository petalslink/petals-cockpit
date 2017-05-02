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
import org.ow2.petals.admin.topology.Container.PortType;
import org.ow2.petals.admin.topology.Container.State;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.testing.junit.ResourceTestRule;
import javaslang.Tuple;
import javaslang.Tuple2;

public class DeploySUTest extends AbstractCockpitResourceTest {

    private static final String SU_NAME = "the-su-name";

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "host1",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE);

    private final Component component1 = new Component("comp1", ComponentType.SE, ArtifactState.State.STARTED);

    @Rule
    public final ResourceTestRule resources = buildResourceTest(ServiceUnitsResource.class,
            ServiceAssembliesResource.class, WorkspaceResource.class);

    @Before
    public void setUp() {
        petals.registerDomain(domain);
        petals.registerContainer(container);
        petals.registerArtifact(component1, container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
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

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        Component fComponent = new Component("compf", ComponentType.SE, ArtifactState.State.STARTED);
        fContainer.addComponent(fComponent);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        MultiPart mpe = getSUMultiPart();

        Response post = resources.target("/workspaces/2/components/" + getId(fComponent) + "/serviceunits").request()
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

        Response post = resources.target("/workspaces/2/components/3198798/serviceunits").request()
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

        // the component exists but it's in another workspace
        Response post = resources.target("/workspaces/2/components/" + getId(component1) + "/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySUButComponentNotFound() throws Exception {
        final MultiPart mpe = getSUMultiPart();

        Response post = resources.target("/workspaces/1/components/3987981/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySU() throws Exception {
        try (EventInput eventInput = resources.target("/workspaces/1/content")
                .request(SseFeature.SERVER_SENT_EVENTS_TYPE).get(EventInput.class)) {

            expectWorkspaceContent(eventInput);

            MultiPart mpe = getSUMultiPart();
            WorkspaceContent post = resources.target("/workspaces/1/components/" + getId(component1) + "/serviceunits")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            Tuple2<ServiceAssemblyFull, ServiceUnitFull> postData = assertSUContent(post);

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SA_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertSUContent(a, data, post);

            });

            assertThat(httpServer.wasCalled()).isEqualTo(true);
            assertThat(httpServer.wasClosed()).isEqualTo(true);

            assertThat(container.getServiceAssemblies()).hasSize(1);
            ServiceAssembly sa = container.getServiceAssemblies().iterator().next();
            assertThat(sa.getName()).isEqualTo(postData._1.serviceAssembly.name);
            assertThat(sa.getState()).isEqualTo(ArtifactState.State.SHUTDOWN);
            assertThat(sa.getServiceUnits()).hasSize(1);
            ServiceUnit su = sa.getServiceUnits().iterator().next();
            assertThat(su.getName()).isEqualTo(postData._2.serviceUnit.name);
            assertThat(su.getTargetComponent()).isEqualTo(component1.getName());

            ServiceUnitOverview suOverview = resources.target("/serviceunits/" + postData._2.serviceUnit.id).request()
                    .get(ServiceUnitOverview.class);
            ServiceUnitOverview saOverview = resources.target("/serviceassemblies/" + postData._1.serviceAssembly.id)
                    .request().get(ServiceUnitOverview.class);
        }
    }

    private Tuple2<ServiceAssemblyFull, ServiceUnitFull> assertSUContent(WorkspaceContent content) {
        SoftAssertions a = new SoftAssertions();
        Tuple2<ServiceAssemblyFull, ServiceUnitFull> res = assertSUContent(a, content, null);
        a.assertAll();
        return res;
    }

    private Tuple2<ServiceAssemblyFull, ServiceUnitFull> assertSUContent(SoftAssertions a, WorkspaceContent content,
            @Nullable WorkspaceContent control) {
        assertThat(content.buses).isEmpty();
        assertThat(content.busesInProgress).isEmpty();
        assertThat(content.containers).isEmpty();
        assertThat(content.components).isEmpty();
        assertThat(content.serviceAssemblies).hasSize(1);
        assertThat(content.serviceUnits).hasSize(1);

        Entry<String, ServiceAssemblyFull> contentSAE = content.serviceAssemblies.entrySet().iterator().next();
        Entry<String, ServiceUnitFull> contentSUE = content.serviceUnits.entrySet().iterator().next();

        ServiceAssemblyFull contentSA = contentSAE.getValue();
        ServiceUnitFull contentSU = contentSUE.getValue();

        a.assertThat(contentSAE.getKey()).isEqualTo(Long.toString(contentSA.serviceAssembly.id));
        a.assertThat(contentSUE.getKey()).isEqualTo(Long.toString(contentSU.serviceUnit.id));

        if (control == null) {
            a.assertThat(contentSU.componentId).isEqualTo(getId(component1));
            a.assertThat(contentSU.serviceAssemblyId).isEqualTo(contentSA.serviceAssembly.id);
            a.assertThat(contentSU.serviceUnit.name).isEqualTo(SU_NAME);

            a.assertThat(contentSA.containerId).isEqualTo(getId(container));
            a.assertThat(contentSA.serviceAssembly.name).isEqualTo("sa-" + SU_NAME);
            a.assertThat(contentSA.serviceUnits).containsOnly(Long.toString(contentSU.serviceUnit.id));
            a.assertThat(contentSA.state).isEqualTo(ServiceAssemblyMin.State.Shutdown);
        } else {
            ServiceAssemblyFull controlSA = control.serviceAssemblies.values().iterator().next();
            ServiceUnitFull controlSU = control.serviceUnits.values().iterator().next();

            a.assertThat(contentSU).isEqualToComparingFieldByFieldRecursively(controlSU);
            a.assertThat(contentSA).isEqualToComparingFieldByFieldRecursively(controlSA);
        }

        return Tuple.of(contentSA, contentSU);
    }

}
