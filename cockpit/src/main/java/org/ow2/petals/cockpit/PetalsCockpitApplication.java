/**
 * Copyright (C) 2016-2017 Linagora
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
package org.ow2.petals.cockpit;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.palantir.indexpage.IndexPageBundle;
import com.palantir.indexpage.IndexPageConfigurable;

import io.dropwizard.bundles.assets.AssetsBundleConfiguration;
import io.dropwizard.bundles.assets.AssetsConfiguration;
import io.dropwizard.bundles.assets.ConfiguredAssetsBundle;
import io.dropwizard.setup.Bootstrap;

public class PetalsCockpitApplication extends CockpitApplication<PetalsCockpitConfiguration> {

    public static void main(String[] args) throws Exception {
        new PetalsCockpitApplication().run(args);
    }

    @Override
    public void initialize(@Nullable Bootstrap<PetalsCockpitConfiguration> bootstrap) {
        assert bootstrap != null;

        super.initialize(bootstrap);

        bootstrap.addBundle(new ConfiguredAssetsBundle(ImmutableMap.of("/frontend/", "/")));
        // TODO this is not the best because every new prefix must be added... if not, the static asset servlet will
        // take over instead of returning index.html
        // Improve when https://github.com/palantir/dropwizard-index-page/issues/38 is fixed
        bootstrap.addBundle(
                new IndexPageBundle("frontend/index.html", ImmutableSet.of("/login", "/cockpit", "/cockpit/*")));
    }
}

class PetalsCockpitConfiguration extends CockpitConfiguration
        implements AssetsBundleConfiguration, IndexPageConfigurable {

    @Valid
    @NotNull
    @JsonProperty
    private final AssetsConfiguration assets = AssetsConfiguration.builder().build();

    @Override
    public AssetsConfiguration getAssetsConfiguration() {
        return assets;
    }
    
    @JsonIgnore
    @Nullable
    @Override
    public String getIndexPagePath() {
        // TODO remove that when https://github.com/palantir/dropwizard-index-page/issues/37 is fixed
        return null;
    }

}
