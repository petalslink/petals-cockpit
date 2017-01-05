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
package org.ow2.petals.cockpit.server.mocks;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.ow2.petals.cockpit.server.db.UsersDAO;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.ow2.petals.cockpit.server.resources.UserSession.User;
import org.ow2.petals.cockpit.server.security.CockpitAuthenticator;
import org.pac4j.core.context.WebContext;

public class MockAuthenticator extends CockpitAuthenticator {

    public MockAuthenticator() {
        super(mock(UsersDAO.class));
    }

    public static final User ADMIN = new User("admin", "Administrator", null);

    @Override
    protected void internalInit(WebContext context) {
        super.internalInit(context);

        String pw = getPasswordEncoder().encode(ADMIN.username);

        when(users.findByUsername(ADMIN.username)).thenReturn(new DbUser(ADMIN.username, pw, ADMIN.name));
    }
}
