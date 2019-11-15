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
package org.ow2.petals.cockpit.server.resources;

import org.junit.Before;
import org.ow2.petals.cockpit.server.bundles.security.CockpitProfile;

public class AbstractBasicResourceTest extends AbstractCockpitResourceTest {

    public static final String ADMIN = "admin";

    public AbstractBasicResourceTest(Class<?>... ressources) {
        super(ressources);
    }

    @Before
    public void setUpUser() {
        addUser(ADMIN, true);
        resource.setCurrentProfile(new CockpitProfile(ADMIN, resource.db().configuration()));
    }
}
