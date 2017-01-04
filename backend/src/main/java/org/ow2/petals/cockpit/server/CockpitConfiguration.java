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
package org.ow2.petals.cockpit.server;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.eclipse.jdt.annotation.Nullable;
import org.pac4j.dropwizard.Pac4jFactory;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;

/**
 * Read from the main configuration YAML.
 * 
 * @author vnoel
 *
 */
public class CockpitConfiguration extends Configuration {

    @Valid
    @Nullable
    @JsonProperty
    private Pac4jFactory pac4j = null;

    @Nullable
    @JsonProperty("pac4j")
    public Pac4jFactory getPac4jFactory() {
        return pac4j;
    }

    @Valid
    @NotNull
    @JsonProperty
    private DataSourceFactory database = new DataSourceFactory();

    @JsonProperty("database")
    public DataSourceFactory getDataSourceFactory() {
        return database;
    }
}
