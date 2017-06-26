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
package org.ow2.petals.cockpit.server.bundles.security;

import org.pac4j.core.client.IndirectClient;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.redirect.RedirectAction;

public class CockpitAuthClient extends IndirectClient<UsernamePasswordCredentials, CommonProfile> {

    public CockpitAuthClient() {
        // let's always consider it as an ajax request: no redirect will happen then!
        setAjaxRequestResolver(ctx -> true);
        // we don't really care because we never use it to redirect (see above)
        setRedirectActionBuilder(wc -> RedirectAction.success(""));
    }

    @Override
    protected void clientInit(WebContext context) {
        defaultAuthenticator(new CockpitAuthenticator());
        defaultCredentialsExtractor(new CockpitExtractor(getName()));
    }
}