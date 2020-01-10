/**
 * Copyright (C) 2016-2020 Linagora
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

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.core.Response;

import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.SharedLibrariesResource.SharedLibraryOverview;

public class SharedLibrariesResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public SharedLibrariesResourceTest() {
        super(SharedLibrariesResource.class);
    }

    @Test
    public void getExistingSLForbidden() {
        Response get = resource.target("/sharedlibraries/" + getId(fSharedLibrary)).request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingSL() {
        SharedLibraryOverview get = resource.target("/sharedlibraries/" + getId(sharedLibrary)).request()
                .get(SharedLibraryOverview.class);

        assertThat(get).isNotNull();
    }

    @Test
    public void getNonExistingSLNotFound() {
        Response get = resource.target("/sharedlibraries/419832492").request().get();

        assertThat(get.getStatus()).isEqualTo(404);
    }
}
