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
package org.ow2.petals.cockpit.server.mocks;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URL;

import org.junit.rules.ExternalResource;
import org.ow2.petals.cockpit.server.services.ArtifactServer;

public class MockArtifactServer extends ExternalResource implements ArtifactServer {

    // TODO can we reuse TemporaryFolder?!
    private File folder = new File("");

    // TODO for now we can test only one serve per test...
    private boolean wasCalled = false;

    private boolean wasClosed = false;

    @Override
    protected void before() throws Throwable {
        wasCalled = false;
        wasClosed = false;
        folder = File.createTempFile("artifact-server", "");
        folder.delete();
        folder.mkdir();
    }

    @Override
    protected void after() {
        recursiveDelete(folder);
    }

    private void recursiveDelete(File file) {
        File[] files = file.listFiles();
        if (files != null) {
            for (File each : files) {
                recursiveDelete(each);
            }
        }
        file.delete();
    }

    @Override
    public <E extends Throwable> ServedArtifact serve(String fileName, ArtifactProducer<E> producer)
            throws IOException, E {

        File file = File.createTempFile("artifact-", null, folder);
        try (OutputStream out = new FileOutputStream(file)) {
            producer.produce(out);
        }

        URL url = file.toURI().toURL();

        wasCalled = true;

        return new ServedArtifact() {

            @Override
            public URL getArtifactExternalUrl() {
                return url;
            }

            @Override
            public File getFile() {
                return file;
            }

            @Override
            public void close() {
                wasClosed = true;
                file.delete();
            }
        };
    }

    public boolean wasCalled() {
        return wasCalled;
    }

    public boolean wasClosed() {
        assertThat(wasCalled).isEqualTo(true);
        return wasClosed;
    }
}
