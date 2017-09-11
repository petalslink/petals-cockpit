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
package org.ow2.petals.cockpit.server.services;

import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.inject.Inject;

import org.ow2.petals.admin.api.ArtifactAdministration;
import org.ow2.petals.admin.api.ContainerAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.admin.api.artifact.Artifact;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.admin.api.artifact.Component.ComponentType;
import org.ow2.petals.admin.api.artifact.ServiceAssembly;
import org.ow2.petals.admin.api.artifact.SharedLibrary;
import org.ow2.petals.admin.api.artifact.lifecycle.ComponentLifecycle;
import org.ow2.petals.admin.api.artifact.lifecycle.ServiceAssemblyLifecycle;
import org.ow2.petals.admin.api.exception.ArtifactAdministrationException;
import org.ow2.petals.admin.api.exception.ContainerAdministrationException;
import org.ow2.petals.admin.topology.Container;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyMin;
import org.ow2.petals.jmx.api.api.InstallerComponentClient;
import org.ow2.petals.jmx.api.api.JMXClient;
import org.ow2.petals.jmx.api.api.PetalsJmxApiFactory;
import org.ow2.petals.jmx.api.api.configuration.component.InstallationConfigurationComponentClient;
import org.ow2.petals.jmx.api.api.configuration.component.exception.ConfigurationComponentDoesNotExistException;
import org.ow2.petals.jmx.api.api.configuration.component.exception.ConfigurationComponentErrorException;
import org.ow2.petals.jmx.api.api.exception.ConnectionErrorException;
import org.ow2.petals.jmx.api.api.exception.DuplicatedServiceException;
import org.ow2.petals.jmx.api.api.exception.InstallationServiceDoesNotExistException;
import org.ow2.petals.jmx.api.api.exception.InstallationServiceErrorException;
import org.ow2.petals.jmx.api.api.exception.InstallerComponentDoesNotExistException;
import org.ow2.petals.jmx.api.api.exception.InstallerComponentErrorException;
import org.ow2.petals.jmx.api.api.exception.MissingServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javaslang.Tuple;
import javaslang.Tuple2;

public class PetalsAdmin {

    private static final Logger LOG = LoggerFactory.getLogger(PetalsAdmin.class);

    private final PetalsAdministrationFactory adminFactory;

    private final PetalsJmxApiFactory jmxFactory;

    @Inject
    public PetalsAdmin() {
        this.adminFactory = PetalsAdministrationFactory.getInstance();
        try {
            this.jmxFactory = PetalsJmxApiFactory.getInstance();
        } catch (DuplicatedServiceException | MissingServiceException e) {
            throw new AssertionError(e);
        }
    }

    public Domain getTopology(String ip, int port, String username, String password, String passphrase) {
        try (PAC p = new PAC(ip, port, username, password)) {
            return p.petals.newContainerAdministration().getTopology(passphrase, true);
        } catch (ContainerAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    @SuppressWarnings("null")
    public Tuple2<List<Container>, String> getContainerInfos(String ip, int port, String username, String password) {
        try (PAC p = new PAC(ip, port, username, password)) {
            ContainerAdministration admin = p.petals.newContainerAdministration();
            Domain domain = admin.getTopology(null, false);

            String sysInfo = admin.getSystemInfo();

            return Tuple.of(domain.getContainers(), sysInfo);
        } catch (ContainerAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    public ComponentMin.State changeComponentState(String ip, int port, String username, String password, String type,
            String name, ComponentMin.State current, ComponentMin.State next, Map<String, String> parameters) {
        try (PAC p = new PAC(ip, port, username, password)) {
            ArtifactAdministration aa = p.petals.newArtifactAdministration();
            Artifact a = aa.getArtifact(type, name, null);
            assert a instanceof Component;
            Component compo = (Component) a;

            if (current == ComponentMin.State.Loaded && next != ComponentMin.State.Unloaded) {
                compo.getParameters().putAll(parameters);
            }

            return changeComponentState(p.petals, compo, current, next);
        } catch (ArtifactAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    public ServiceAssemblyMin.State changeSAState(String ip, int port, String username, String password, String saName,
            ServiceAssemblyMin.State next) {
        try (PAC p = new PAC(ip, port, username, password)) {
            ArtifactAdministration aa = p.petals.newArtifactAdministration();
            Artifact a = aa.getArtifact(ServiceAssembly.TYPE, saName, null);
            assert a instanceof ServiceAssembly;
            ServiceAssembly sa = (ServiceAssembly) a;
            return changeSAState(p.petals, sa, next);
        } catch (ArtifactAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    public void undeploySL(String ip, int port, String username, String password, String slName) {
        try (PAC p = new PAC(ip, port, username, password)) {
            ArtifactAdministration aa = p.petals.newArtifactAdministration();
            Artifact a = aa.getArtifact(SharedLibrary.TYPE, slName, null);
            assert a instanceof SharedLibrary;
            SharedLibrary sl = (SharedLibrary) a;
            p.petals.newArtifactLifecycleFactory().createSharedLibraryLifecycle(sl).undeploy();
        } catch (ArtifactAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    public ServiceAssembly deploySA(String ip, int port, String username, String password, String saName, URL saUrl) {
        try (PAC p = new PAC(ip, port, username, password)) {
            // TODO handle partially deployed SAs??!!
            p.petals.newArtifactLifecycleFactory().createServiceAssemblyLifecycle(new ServiceAssembly(saName))
                    .deploy(saUrl);
            return (ServiceAssembly) p.petals.newArtifactAdministration().getArtifactInfo(ServiceAssembly.TYPE, saName,
                    null);
        } catch (ArtifactAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    public Component deployComponent(String ip, int port, String username, String password, ComponentType type,
            String name, URL compUrl) {
        try (PAC p = new PAC(ip, port, username, password)) {
            p.petals.newArtifactLifecycleFactory().createComponentLifecycle(new Component(name, type)).deploy(compUrl,
                    true);
            return (Component) p.petals.newArtifactAdministration().getArtifactInfo(type.toString(), name, null);
        } catch (ArtifactAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    public SharedLibrary deploySL(String ip, int port, String username, String password, String name, String version,
            URL slUrl) {
        try (PAC p = new PAC(ip, port, username, password)) {
            p.petals.newArtifactLifecycleFactory().createSharedLibraryLifecycle(new SharedLibrary(name, version))
                    .deploy(slUrl);
            return (SharedLibrary) p.petals.newArtifactAdministration().getArtifactInfo(SharedLibrary.TYPE, name,
                    version);
        } catch (ArtifactAdministrationException e) {
            throw new PetalsAdminException(e);
        }
    }

    public Map<String, String> getInstallParameters(String ip, int port, String username, String password,
            String name) {
        try (JMXC c = new JMXC(ip, port, username, password)) {
            InstallerComponentClient installer = c.client.getInstallationServiceClient().loadInstaller(name);

            assert !installer.isInstalled();

            InstallationConfigurationComponentClient configuration = installer.getInstallationConfigurationClient();

            assert configuration != null;

            return configuration.getConfigurationMBeanAttributes().entrySet().stream()
                    .collect(Collectors.toMap(e -> e.getKey().getName(), e -> Objects.toString(e.getValue())));
        } catch (InstallerComponentDoesNotExistException | ConnectionErrorException | InstallerComponentErrorException
                | ConfigurationComponentDoesNotExistException | ConfigurationComponentErrorException
                | InstallationServiceErrorException | InstallationServiceDoesNotExistException e) {
            throw new PetalsAdminException(e);
        }
    }

    private ComponentMin.State changeComponentState(PetalsAdministration petals, Component comp,
            ComponentMin.State currentState, ComponentMin.State desiredState) throws ArtifactAdministrationException {
        ComponentLifecycle cl = petals.newArtifactLifecycleFactory().createComponentLifecycle(comp);
        switch (desiredState) {
            case Loaded:
                cl.uninstall();
                break;
            case Shutdown:
                cl.install();
                break;
            case Unloaded:
                cl.undeploy();
                break;
            case Started:
                cl.start();
                break;
            case Stopped:
                cl.stop();
                break;
            default:
                LOG.warn("Impossible case for state transition from {} to {} for Component {} ({})", comp.getState(),
                        desiredState, comp.getName());
        }
        if (desiredState != ComponentMin.State.Unloaded) {
            cl.updateState();
            return ComponentMin.State.from(comp.getState());
        } else {
            // we can't call updateState for this one, it will fail since it has been unloaded
            return ComponentMin.State.Unloaded;
        }
    }

    private ServiceAssemblyMin.State changeSAState(PetalsAdministration petals, ServiceAssembly sa,
            ServiceAssemblyMin.State desiredState) throws ArtifactAdministrationException {
        ServiceAssemblyLifecycle sal = petals.newArtifactLifecycleFactory().createServiceAssemblyLifecycle(sa);
        switch (desiredState) {
            case Unloaded:
                sal.undeploy();
                break;
            case Started:
                sal.start();
                break;
            case Stopped:
                sal.stop();
                break;
            default:
                LOG.warn("Impossible case for state transition from {} to {} for SA {} ({})", sa.getState(),
                        desiredState, sa.getName());
        }
        if (desiredState != ServiceAssemblyMin.State.Unloaded) {
            sal.updateState();
            return ServiceAssemblyMin.State.from(sa.getState());
        } else {
            // we can't call updateState for this one, it will fail since it has been unloaded
            return ServiceAssemblyMin.State.Unloaded;
        }
    }

    private class JMXC implements AutoCloseable {

        public final JMXClient client;

        private final String name;

        public JMXC(String ip, int port, String username, String password) {
            this.name = ip + ":" + port;
            try {
                JMXClient c = jmxFactory.createJMXClient(ip, port, username, password);
                assert c != null;
                client = c;
            } catch (ConnectionErrorException e) {
                throw new PetalsAdminException(e);
            }
        }

        @Override
        public void close() {
            try {
                client.disconnect();
            } catch (Exception e) {
                LOG.warn("Error while disconnecting from container " + name, e);
            }
        }
    }

    private class PAC implements AutoCloseable {

        public final PetalsAdministration petals;

        private final String name;

        public PAC(String ip, int port, String username, String password) {
            this.name = ip + ":" + port;
            PetalsAdministration p = adminFactory.newPetalsAdministrationAPI();
            assert p != null;
            petals = p;
            try {
                petals.connect(ip, port, username, password);
            } catch (ContainerAdministrationException e) {
                throw new PetalsAdminException(e);
            }
        }

        @Override
        public void close() {
            try {
                if (petals.isConnected()) {
                    petals.disconnect();
                }
            } catch (Exception e) {
                LOG.warn("Error while disconnecting from container " + name, e);
            }
        }
    }

    public static class PetalsAdminException extends RuntimeException {

        private static final long serialVersionUID = -4950327215265414202L;

        public PetalsAdminException(Exception e) {
            super("wrapped", e);
        }
    }
}
