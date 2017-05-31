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

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.cockpit.server.db.generated.tables.records.SharedlibrariesRecord;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;

public class SharedLibrariesResource {

    public static class SharedLibraryMin {

        @NotNull
        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotEmpty
        @JsonProperty
        public final String version;

        public SharedLibraryMin(SharedlibrariesRecord slDb) {
            this(slDb.getId(), slDb.getName(), slDb.getVersion());
        }

        private SharedLibraryMin(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("version") String version) {
            this.id = id;
            this.name = name;
            this.version = version;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class SharedLibraryFull {

        @Valid
        @JsonUnwrapped
        public final SharedLibraryMin sharedLibrary;

        @NotNull
        @Min(1)
        public final long containerId;

        public SharedLibraryFull(SharedlibrariesRecord slDb) {
            this(new SharedLibraryMin(slDb), slDb.getContainerId());
        }

        private SharedLibraryFull(SharedLibraryMin SharedLibrary, long containerId) {
            this.sharedLibrary = SharedLibrary;
            this.containerId = containerId;
        }

        @JsonCreator
        private SharedLibraryFull() {
            // jackson will inject values itself (because of @JsonUnwrapped)
            this(new SharedLibraryMin(0, "", ""), 0);
        }

        @JsonProperty
        public String getContainerId() {
            return Long.toString(containerId);
        }
    }
}
