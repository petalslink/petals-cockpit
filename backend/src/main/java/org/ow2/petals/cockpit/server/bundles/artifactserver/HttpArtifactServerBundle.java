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
package org.ow2.petals.cockpit.server.bundles.artifactserver;

import java.io.File;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.stream.Stream;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.NetworkConnector;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.services.ArtifactServer;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.cache.CacheBuilderSpec;
import com.google.common.collect.ImmutableMap;
import com.google.common.net.InetAddresses;

import io.dropwizard.Configuration;
import io.dropwizard.ConfiguredBundle;
import io.dropwizard.bundles.assets.AssetsBundleConfiguration;
import io.dropwizard.bundles.assets.AssetsConfiguration;
import io.dropwizard.bundles.assets.ConfiguredAssetsBundle;
import io.dropwizard.jetty.MutableServletContextHandler;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

public abstract class HttpArtifactServerBundle<C extends Configuration> implements ConfiguredBundle<C> {

    public static final String ARTIFACTS_HTTP_SUBPATH = "jbi-artifacts";

    private final ConfiguredAssetsBundle assetsBundle = new ConfiguredAssetsBundle(ImmutableMap.of(), "index.html",
            "petals-cockpit-artifacts", CacheBuilderSpec.disableCaching());

    protected abstract HttpArtifactServerConfiguration getConfiguration(C configuration);

    @Override
    public void initialize(Bootstrap<?> bootstrap) {
        assetsBundle.initialize(bootstrap);
    }

    @Override
    public void run(C configuration, Environment environment) throws Exception {
        HttpArtifactServerConfiguration conf = getConfiguration(configuration);
        String temporaryPath = conf.getTemporaryPath();

        File artifactsTemporaryDir = new File(temporaryPath);

        if (!artifactsTemporaryDir.exists()) {
            artifactsTemporaryDir.mkdirs();
            artifactsTemporaryDir.deleteOnExit();
        }

        if (!(artifactsTemporaryDir.canWrite() && artifactsTemporaryDir.canRead())) {
            throw new SecurityException(
                    "Can't read or write in the artifact temporary folder " + artifactsTemporaryDir);
        }

        assetsBundle.run(new AssetsBundleConfiguration() {
            @Override
            public AssetsConfiguration getAssetsConfiguration() {
                String uriPath = "/" + ARTIFACTS_HTTP_SUBPATH;
                return AssetsConfiguration.builder()
                        // we need a fake resource mapping so that the filesystem override below works
                        .mappings(ImmutableMap.of("not-used-because-overriden-below", uriPath))
                        .overrides(ImmutableMap.of(uriPath, temporaryPath)).build();
            }
        }, environment);

        environment.jersey().register(new AbstractBinder() {
            @Override
            protected void configure() {
                bind(new HttpArtifactServer(getArtifactsBaseUrl(environment, conf), artifactsTemporaryDir))
                        .to(ArtifactServer.class);
            }
        });
    }

    @SuppressWarnings("resource")
    private static URL getArtifactsBaseUrl(Environment environment, HttpArtifactServerConfiguration conf) {
        MutableServletContextHandler appContext = environment.getApplicationContext();
        String context = appContext.getContextPath();
        Connector[] connectors = appContext.getServer().getConnectors();

        // TODO it would be better to have a specific connector just for serving the artifacts
        NetworkConnector connector = (NetworkConnector) Stream.of(connectors)
                .filter(c -> "application".equals(c.getName())).findFirst().orElse(connectors[0]);

        try {

            String host = null;
            // If set in the configuration, we override the host send to petals
            if (conf.isExternalHostValid()) {
                host = conf.getExternalHost();
            } else {
                final String connectorHost = connector.getHost();
                host = connectorHost != null ? connectorHost : InetAddress.getLocalHost().getHostAddress();
            }

            return new URL("http", host, connector.getLocalPort(),
                    (context.endsWith("/") ? context : (context + "/")) + ARTIFACTS_HTTP_SUBPATH + "/");
        } catch (MalformedURLException | UnknownHostException e) {
            throw new AssertionError("impossible", e);
        }
    }

    public static class HttpArtifactServerConfiguration {

        @JsonProperty
        public String externalHost = "";

        @NotEmpty
        @JsonProperty
        private String temporaryPath = System.getProperty("java.io.tmpdir") + "/petals-cockpit-artifacts";

        @JsonProperty
        public String getTemporaryPath() {
            return temporaryPath;
        }

        @JsonProperty
        public String getExternalHost() {
            return externalHost;
        }

        public boolean isExternalHostValid() {
            return InetAddresses.isInetAddress(externalHost);
        }
    }
}
