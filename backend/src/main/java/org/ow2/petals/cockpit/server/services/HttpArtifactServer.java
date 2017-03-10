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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.UUID;
import java.util.stream.Stream;

import javax.inject.Inject;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.NetworkConnector;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dropwizard.jetty.MutableServletContextHandler;
import io.dropwizard.setup.Environment;

public class HttpArtifactServer implements ArtifactServer {

    private static final Logger LOG = LoggerFactory.getLogger(ArtifactServer.class);

    private final URL artifactsBaseUrl;

    private final CockpitConfiguration configuration;

    @Inject
    public HttpArtifactServer(Environment environment, CockpitConfiguration configuration) {
        this.configuration = configuration;
        this.artifactsBaseUrl = getArtifactsBaseUrl(environment);
    }

    @SuppressWarnings("resource")
    private static URL getArtifactsBaseUrl(Environment environment) {
        MutableServletContextHandler adminContext = environment.getAdminContext();
        String context = adminContext.getContextPath();
        Connector[] connectors = adminContext.getServer().getConnectors();

        // TODO it would be better to have a specific connector just for serving the artifacts
        NetworkConnector adminConnector = (NetworkConnector) Stream.of(connectors)
                .filter(c -> "admin".equals(c.getName())).findFirst().orElse(connectors[0]);

        try {
            String host = adminConnector.getHost();
            return new URL("http", host != null ? host : InetAddress.getLocalHost().getHostAddress(),
                    adminConnector.getLocalPort(), (context.endsWith("/") ? context : (context + "/"))
                            + CockpitApplication.ARTIFACTS_HTTP_SUBPATH + "/");
        } catch (MalformedURLException | UnknownHostException e) {
            throw new AssertionError("impossible", e);
        }
    }

    @Override
    public <E extends Throwable> ServicedArtifact serve(String fileName, ArtifactProducer<E> producer)
            throws IOException, E {
        String randomDirectoryName = UUID.randomUUID().toString();
        File tmpDir = new File(configuration.getArtifactTemporaryPath() + "/" + randomDirectoryName);
        tmpDir.mkdirs();

        File file = new File(tmpDir, fileName);

        try (OutputStream fos = new FileOutputStream(file)) {
            producer.produce(fos);
        }

        URL url;
        try {
            url = new URL(HttpArtifactServer.this.artifactsBaseUrl, randomDirectoryName + "/" + fileName);
        } catch (MalformedURLException e) {
            throw new AssertionError("impossible", e);
        }

        LOG.info("Created " + file + ", serviced from " + url);

        return new ServicedArtifactImpl(file, url);
    }

    public class ServicedArtifactImpl implements ServicedArtifact {

        private final File artifact;

        private final URL url;

        public ServicedArtifactImpl(File artifact, URL url) {
            this.artifact = artifact;
            this.url = url;
        }

        @Override
        public URL getArtifactUrl() {
            return url;
        }

        @Override
        public void close() {
            if (artifact.delete()) {
                if (!artifact.getParentFile().delete()) {
                    LOG.warn("Can't delete " + artifact.getParentFile());
                }
            } else {
                LOG.warn("Can't delete " + artifact);
            }
        }
    }
}
