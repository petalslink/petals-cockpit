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

import javax.management.NotCompliantMBeanException;
import javax.management.StandardMBean;
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
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentChangeState;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.ComponentStateChanged;
import org.ow2.petals.jmx.api.mock.junit.configuration.component.InstallationConfigurationServiceClientMock;
import org.ow2.petals.jmx.api.mock.junit.configuration.component.RuntimeConfigurationServiceClientMock;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.jersey.errors.ErrorMessage;
import javaslang.Tuple;

public class ComponentParametersTest extends AbstractCockpitResourceTest {

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

        resource.jmx.addComponentInstallerClient(component1.getName(),
                org.ow2.petals.jmx.api.mock.junit.PetalsJmxApiJunitRule.ComponentType.ENGINE,
                new InstallationConfigurationServiceClientMock(new Config(InstallerConfig.class)), null);

        resource.jmx.addComponentClient(component2.getName(),
                org.ow2.petals.jmx.api.mock.junit.PetalsJmxApiJunitRule.ComponentType.ENGINE, null,
                new RuntimeConfigurationServiceClientMock(new Config(RuntimeConfig.class)), null, null);

        setupWorkspace(1, "test", Arrays.asList(Tuple.of(domain, "phrase")), ADMIN);
    }

    @Test
    public void whenLoadedShouldShowTheInstallAndRuntimeParameters() {
        ComponentOverview get = resource.target("/components/" + getId(component1)).request()
                .get(ComponentOverview.class);

        assertThat(get.parameters)
                .isEqualTo(ImmutableMap.of("HttpPort", "8080", "EnableHttps", "false", "MaxPoolSize", "10"));
    }

    @Test
    public void onceStartedShouldShowNoParameters() {
        ComponentOverview get = resource.target("/components/" + getId(component2)).request()
                .get(ComponentOverview.class);

        assertThat(get.parameters).isEqualTo(ImmutableMap.of());
    }

    @Test
    public void installWithoutParameters() {
        ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Shutdown)), ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(ComponentMin.State.Shutdown);

        assertThatComponentState(component1, ArtifactState.State.SHUTDOWN);
    }

    @Test
    public void installWithValidInstallParameters() {
        component1.getParameters().put("HttpPort", "20");

        ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(component1)).request().put(
                Entity.json(new ComponentChangeState(ComponentMin.State.Shutdown, ImmutableMap.of("HttpPort", "80"))),
                ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(ComponentMin.State.Shutdown);

        assertThatComponentState(component1, ArtifactState.State.SHUTDOWN);

        assertThat(component1.getParameters()).isEqualTo(ImmutableMap.of("HttpPort", "80"));
    }

    @Test
    @Ignore("Setting invalid parameters is not a problem with the petals-admin-mocks for now...")
    public void installWithInvalidInstallParameters() {
        component1.getParameters().put("HttpPort", "20");

        Response put = resource.target("/workspaces/1/components/" + getId(component1)).request().put(
                Entity.json(new ComponentChangeState(ComponentMin.State.Shutdown, ImmutableMap.of("HttpPort", "lol"))));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        // TODO
        assertThat(err.getMessage()).isEqualTo("???");

        assertThatComponentState(component1, ArtifactState.State.LOADED);

        assertThat(component1.getParameters()).isEqualTo(ImmutableMap.of("HttpPort", "20"));
    }

    @Test
    public void installWithValidRuntimeParameters() {
        component1.getParameters().put("MaxPoolSize", "10");

        ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(component1)).request()
                .put(Entity.json(
                        new ComponentChangeState(ComponentMin.State.Shutdown, ImmutableMap.of("MaxPoolSize", "20"))),
                        ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(ComponentMin.State.Shutdown);

        assertThatComponentState(component1, ArtifactState.State.SHUTDOWN);

        assertThat(component1.getParameters()).isEqualTo(ImmutableMap.of("MaxPoolSize", "20"));
    }

    @Test
    public void installWithValidRuntimeAndInstallParameters() {
        component1.getParameters().put("HttpPort", "8080");
        component1.getParameters().put("MaxPoolSize", "10");
        ComponentStateChanged put = resource.target("/workspaces/1/components/" + getId(component1)).request()
                .put(Entity.json(new ComponentChangeState(ComponentMin.State.Shutdown,
                        ImmutableMap.of("HttpPort", "80", "MaxPoolSize", "20"))), ComponentStateChanged.class);

        assertThat(put.state).isEqualTo(ComponentMin.State.Shutdown);

        assertThatComponentState(component1, ArtifactState.State.SHUTDOWN);

        assertThat(component1.getParameters()).isEqualTo(ImmutableMap.of("HttpPort", "80", "MaxPoolSize", "20"));
    }

    @Test
    public void installWithUnknownParameters() {
        component1.getParameters().put("HttpPort", "8080");
        Response put = resource.target("/workspaces/1/components/" + getId(component1)).request().put(Entity
                .json(new ComponentChangeState(ComponentMin.State.Shutdown, ImmutableMap.of("Parameter", "lol"))));

        assertThat(put.getStatus()).isEqualTo(Status.CONFLICT.getStatusCode());
        ErrorMessage err = put.readEntity(ErrorMessage.class);
        assertThat(err.getCode()).isEqualTo(Status.CONFLICT.getStatusCode());
        assertThat(err.getMessage())
                .isEqualTo("Unknown or unsettable parameter in installer configuration MBeanParameter");

        assertThatComponentState(component1, ArtifactState.State.LOADED);
    }

    public static class Config extends StandardMBean implements InstallerConfig {

        public Config(Class<?> implementing) throws NotCompliantMBeanException {
            super(implementing);
        }

        @Override
        public boolean isEnableHttps() {
            return false;
        }

        @Override
        public int getHttpPort() {
            return 8080;
        }

        @Override
        public int getMaxPoolSize() {
            return 10;
        }
    }

    public interface InstallerConfig extends RuntimeConfig {
        public int getHttpPort();

        public boolean isEnableHttps();
    }

    public interface RuntimeConfig {
        public int getMaxPoolSize();
    }
}
