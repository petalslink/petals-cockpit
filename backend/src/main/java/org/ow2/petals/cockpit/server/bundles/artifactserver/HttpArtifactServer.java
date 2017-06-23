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
package org.ow2.petals.cockpit.server.bundles.artifactserver;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.UUID;

import javax.inject.Inject;

import org.ow2.petals.cockpit.server.services.ArtifactServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HttpArtifactServer implements ArtifactServer {

    private static final Logger LOG = LoggerFactory.getLogger(HttpArtifactServer.class);

    private final URL artifactsBaseUrl;

    private final File temporaryDirectory;

    @Inject
    public HttpArtifactServer(URL baseUrl, File temporaryDirectory) {
        this.temporaryDirectory = temporaryDirectory;
        this.artifactsBaseUrl = baseUrl;
    }

    @Override
    public <E extends Throwable> ServicedArtifact serve(String fileName, ArtifactProducer<E> producer)
            throws IOException, E {
        String randomDirectoryName = UUID.randomUUID().toString();
        File tmpDir = new File(temporaryDirectory, randomDirectoryName);
        tmpDir.mkdirs();
        tmpDir.deleteOnExit();

        File file = new File(tmpDir, fileName);
        file.deleteOnExit();

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
        public URL getArtifactExternalUrl() {
            return url;
        }

        @Override
        public File getFile() {
            return artifact;
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
