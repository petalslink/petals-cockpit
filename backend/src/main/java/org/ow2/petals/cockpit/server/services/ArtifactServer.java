/**
 * Copyright (C) 2017-2019 Linagora
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
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

import org.apache.commons.io.IOUtils;

public interface ArtifactServer {

    <E extends Throwable> ServedArtifact serve(String fileName, ArtifactProducer<E> producer) throws IOException, E;

    default ServedArtifact serve(String fileName, InputStream file) throws IOException {
        return serve(fileName, os -> IOUtils.copy(file, os));
    }

    @FunctionalInterface
    public interface ArtifactProducer<E extends Throwable> {
        void produce(OutputStream t) throws IOException, E;
    }

    public interface ServedArtifact extends AutoCloseable {
        URL getArtifactExternalUrl();

        File getFile();

        @Override
        void close();
    }
}
