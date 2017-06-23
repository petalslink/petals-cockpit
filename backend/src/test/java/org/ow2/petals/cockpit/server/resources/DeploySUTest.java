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

import java.util.Arrays;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.Nullable;
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
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitOverview;
import org.ow2.petals.cockpit.server.services.PetalsAdmin.PetalsAdminException;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class DeploySUTest extends AbstractCockpitResourceTest {

    private static final String SU_NAME = "the-su-name";

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

    public DeploySUTest() {
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

    private MultiPart getSUMultiPart() throws Exception {
        // su-jbi.xml is actually an empty file, but we never read it in cockpit,
        // so it's ok for tests (until we test with a real petals container)
        return getMultiPart("su-jbi.xml", "fakeSU").field("name", SU_NAME);
    }

    @Test
    public void deploySUExistingComponentForbidden() throws Exception {
        addUser("anotheruser");

        Domain fDomain = new Domain("domf");
        Container fContainer = new Container("contf", "host1", ImmutableMap.of(PortType.JMX, containerPort), "user",
                "pass", State.REACHABLE);
        fDomain.addContainers(fContainer);
        Component fComponent = new Component("compf", ComponentType.SE, ArtifactState.State.STARTED);
        fContainer.addComponent(fComponent);
        setupWorkspace(2, "test2", Arrays.asList(Tuple.of(fDomain, "phrase")), "anotheruser");

        MultiPart mpe = getSUMultiPart();

        Response post = resource.target("/workspaces/2/components/" + getId(fComponent) + "/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySUNonExistingComponentForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSUMultiPart();

        Response post = resource.target("/workspaces/2/components/3198798/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySUWrongComponentForbidden() throws Exception {
        addUser("anotheruser");

        setupWorkspace(2, "test2", Arrays.asList(), "anotheruser");

        MultiPart mpe = getSUMultiPart();

        // the component exists but it's in another workspace
        Response post = resource.target("/workspaces/2/components/" + getId(component1) + "/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(403);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySUButComponentNotFound() throws Exception {
        final MultiPart mpe = getSUMultiPart();

        Response post = resource.target("/workspaces/1/components/3987981/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(404);

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isFalse();
    }

    @Test
    public void deploySU() throws Exception {
        try (EventInput eventInput = resource.sse(1)) {

            expectWorkspaceContent(eventInput);

            MultiPart mpe = getSUMultiPart();
            WorkspaceContent post = resource.target("/workspaces/1/components/" + getId(component1) + "/serviceunits")
                    .request().post(Entity.entity(mpe, mpe.getMediaType()), WorkspaceContent.class);

            ServiceAssemblyFull postDataSA = assertSAContent(post, container, "sa-" + SU_NAME,
                    ImmutableList.of(component1));
            ServiceUnitFull postDataSU = post.serviceUnits.values().iterator().next();

            expectEvent(eventInput, (e, a) -> {
                a.assertThat(e.getName()).isEqualTo("SA_DEPLOYED");
                WorkspaceContent data = e.readData(WorkspaceContent.class);

                assertSAContent(a, data, post);
            });

            assertThat(resource.httpServer.wasCalled()).isTrue();
            assertThat(resource.httpServer.wasClosed()).isTrue();

            assertThat(container.getServiceAssemblies()).hasSize(1);

            resource.target("/serviceunits/" + postDataSU.serviceUnit.id).request().get(ServiceUnitOverview.class);
            resource.target("/serviceassemblies/" + postDataSA.serviceAssembly.id).request()
                    .get(ServiceUnitOverview.class);
        }
    }

    @Test
    public void deploySUConflictContainerError() throws Exception {
        failDeployment = true;

        MultiPart mpe = getSUMultiPart();
        Response post = resource.target("/workspaces/1/components/" + getId(component1) + "/serviceunits").request()
                .post(Entity.entity(mpe, mpe.getMediaType()));

        assertThat(post.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = post.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("error");
        assertThat(err.getDetails()).contains(DeploySUTest.class.getName() + "$1.addServiceAssembly");

        assertThat(container.getServiceAssemblies()).isEmpty();
        assertThat(resource.httpServer.wasCalled()).isTrue();
        assertThat(resource.httpServer.wasClosed()).isTrue();
    }
}
