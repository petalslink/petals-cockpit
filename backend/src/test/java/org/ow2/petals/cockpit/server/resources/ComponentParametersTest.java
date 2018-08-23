/**
 * Copyright (C) 2017-2018 Linagora
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

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeParameters;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class ComponentParametersTest extends AbstractBasicResourceTest {

    private final Domain domain = new Domain("dom");

    private final int containerPort = 7700;

    private final Container container = new Container("cont1", "localhost",
            ImmutableMap.of(Container.PortType.JMX, containerPort), "user", "pass", Container.State.REACHABLE);

    private final Component component1 = new Component("comp1", ComponentType.SE, ArtifactState.State.LOADED);

    private final Component component2 = new Component("comp2", ComponentType.SE, ArtifactState.State.SHUTDOWN);

    public ComponentParametersTest() {
        super(ComponentsResource.class, WorkspaceResource.class);
    }

    @Before
    public void setUp() throws Exception {
        resource.petals.registerDomain(domain);
        resource.petals.registerContainer(container);
        resource.petals.registerArtifact(component1, container);
        resource.petals.registerArtifact(component2, container);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);

        // since petals admin mock cannot properly represent runtime versus non-runtime parameters
        // we simulate it with two different components here, this makes the tests a bit weak for now
        // because we don't really test that the proper parameters are returned when desired in practice.
        component1.getParameters().setProperty("HttpPort", "8484");
        component1.getParameters().setProperty("EnableHttps", "false");
        component1.getParameters().setProperty("MaxPoolSize", "10");
        component2.getParameters().setProperty("MaxPoolSize", "10");
    }

    /**
     * Note: functionally, this test and {@link #shouldShowOnlyTheRuntimeParametersWhenInstalled()} test the same thing,
     * see {@link #setUp()} for explanations.
     */
    @Test
    public void shouldShowTheInstallAndRuntimeParametersWhenUninstalled() {
        ComponentOverview get = resource.target("/components/" + getId(component1)).request()
                .get(ComponentOverview.class);

        assertThat(get.parameters)
                .isEqualTo(ImmutableMap.of("HttpPort", "8484", "EnableHttps", "false", "MaxPoolSize", "10"));
    }

    /**
     * See {@link #shouldShowTheInstallAndRuntimeParametersWhenUninstalled()}.
     */
    @Test
    public void shouldShowOnlyTheRuntimeParametersWhenInstalled() {
        ComponentOverview get = resource.target("/components/" + getId(component2)).request()
                .get(ComponentOverview.class);

        assertThat(get.parameters).isEqualTo(ImmutableMap.of("MaxPoolSize", "10"));
    }

    @Test
    public void setWithoutParametersWhenUninstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component1) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of())));

        assertThat(put.getStatus()).isEqualTo(422);

        assertThatComponentState(component1, ArtifactState.State.LOADED);
    }

    @Test
    public void setWithoutParametersWhenInstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component2) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of())));

        assertThat(put.getStatus()).isEqualTo(422);

        assertThatComponentState(component2, ArtifactState.State.SHUTDOWN);
    }

    @Test
    public void setValidInstallParametersWhenUninstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component1) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of("HttpPort", "80"))));

        assertThat(put.getStatus()).isEqualTo(Status.NO_CONTENT.getStatusCode());

        assertThat(component1.getParameters())
                .isEqualTo(ImmutableMap.of("HttpPort", "80", "EnableHttps", "false", "MaxPoolSize", "10"));
    }

    @Test
    public void setValidRuntimeParametersWhenInstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component2) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of("MaxPoolSize", "20"))));

        assertThat(put.getStatus()).isEqualTo(Status.NO_CONTENT.getStatusCode());

        assertThat(component2.getParameters()).isEqualTo(ImmutableMap.of("MaxPoolSize", "20"));
    }

    @Test
    @Ignore("Since petals-admin-mock does not validate parameters, this doesn't fail as it should")
    public void setInvalidInstallParametersWhenUninstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component1) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of("HttpPort", "lol"))));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage())
                .isEqualTo("The value 'lol' of the parameter 'HttpPort' is incorrect for type 'int'");

        assertThat(component1.getParameters()).isEqualTo(ImmutableMap.of("HttpPort", "10"));
    }

    @Test
    @Ignore("Since petals-admin-mock does not validate parameters, this doesn't fail as it should")
    public void setInvalidRuntimeParametersWhenInstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component2) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of("MaxPoolSize", "lol"))));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage())
                .isEqualTo("The value 'lol' of the parameter 'MaxPoolSize' is incorrect for type 'int'");

        assertThat(component2.getParameters()).isEqualTo(ImmutableMap.of("MaxPoolSize", "10"));
    }

    @Test
    public void setValidRuntimeParametersWhenUninstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component1) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of("MaxPoolSize", "20"))));

        assertThat(put.getStatus()).isEqualTo(Status.NO_CONTENT.getStatusCode());

        assertThat(component1.getParameters())
                .isEqualTo(ImmutableMap.of("HttpPort", "8484", "EnableHttps", "false", "MaxPoolSize", "20"));
    }

    @Test
    public void setValidRuntimeAndInstallParametersWhenUninstalled() {
        Response put = resource.target("/workspaces/1/components/" + getId(component1) + "/parameters").request().put(
                Entity.json(new ComponentChangeParameters(ImmutableMap.of("HttpPort", "80", "MaxPoolSize", "20"))));

        assertThat(put.getStatus()).isEqualTo(Status.NO_CONTENT.getStatusCode());

        assertThat(component1.getParameters())
                .isEqualTo(ImmutableMap.of("EnableHttps", "false", "HttpPort", "80", "MaxPoolSize", "20"));
    }

    @Test
    public void setUnknownParametersWhenUninstalled() {
        setUnknownParametersWhenInstalled(component1);
    }

    @Test
    public void setUnknownParametersWhenInstalled() {
        setUnknownParametersWhenInstalled(component2);
    }

    public void setUnknownParametersWhenInstalled(Component component) {
        Response put = resource.target("/workspaces/1/components/" + getId(component) + "/parameters").request()
                .put(Entity.json(new ComponentChangeParameters(ImmutableMap.of("Parameter", "lol"))));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage()).isEqualTo("Unknown or unsettable parameter in configuration MBean: Parameter");
    }
}
