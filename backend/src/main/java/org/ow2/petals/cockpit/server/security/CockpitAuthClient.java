/**
 * Copyright (C) 2016 Linagora
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
package org.ow2.petals.cockpit.server.security;

import org.eclipse.jdt.annotation.Nullable;
import org.pac4j.core.client.IndirectClientV2;
import org.pac4j.core.client.RedirectAction;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.profile.CommonProfile;

public class CockpitAuthClient extends IndirectClientV2<@Nullable UsernamePasswordCredentials, CommonProfile> {

    @Override
    protected void internalInit(final @Nullable WebContext context) {
        setCredentialsExtractor(new CockpitExtractor(getName()));
        // let's always consider it as an ajax request: no redirect will happen then!
        setAjaxRequestResolver(ctx -> true);
        // we don't really care because we never use it to redirect (see above)
        setRedirectActionBuilder(wc -> RedirectAction.success(""));
        super.internalInit(context);
    }

}