/**
 * Copyright (C) 2016-2018 Linagora
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
package org.ow2.petals.cockpit.server;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.ow2.petals.cockpit.server.bundles.artifactserver.HttpArtifactServerBundle.HttpArtifactServerConfiguration;
import org.ow2.petals.cockpit.server.bundles.security.CockpitSecurityBundle.CockpitSecurityConfiguration;

import com.bendb.dropwizard.jooq.JooqFactory;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;

/**
 * Read from the main configuration YAML.
 * 
 * @author vnoel, psouquet
 *
 */
public class CockpitConfiguration extends Configuration {

    @Valid
    @JsonProperty
    private CockpitSecurityConfiguration security = new CockpitSecurityConfiguration();

    @JsonProperty
    public CockpitSecurityConfiguration getSecurity() {
        return security;
    }

    @Valid
    @JsonProperty
    private HttpArtifactServerConfiguration artifactServer = new HttpArtifactServerConfiguration();

    @JsonProperty
    public HttpArtifactServerConfiguration getArtifactServer() {
        return artifactServer;
    }

    @JsonProperty
    private boolean showPetalsAdminStacktraces = false;

    @JsonProperty
    public boolean isShowPetalsAdminStacktraces() {
        return showPetalsAdminStacktraces;
    }

    @Valid
    @NotNull
    @JsonProperty
    private DataSourceFactory database = new DataSourceFactory();

    @JsonProperty("database")
    public DataSourceFactory getDataSourceFactory() {
        return database;
    }

    @Valid
    @NotNull
    @JsonProperty
    private JooqFactory jooq = new JooqFactory();

    @JsonProperty("jooq")
    public JooqFactory getJooqFactory() {
        return jooq;
    }

    @Valid
    @NotNull
    private LDAPConfigFactory ldapConfig = new LDAPConfigFactory();

    @JsonProperty("ldapConfig")
    public LDAPConfigFactory getLDAPConfigFactory() {
        return ldapConfig;
    }

    @JsonProperty("ldapConfig")
    public void setLDAPConfigFactory(LDAPConfigFactory factory) {
        this.ldapConfig = factory;
    }

}
