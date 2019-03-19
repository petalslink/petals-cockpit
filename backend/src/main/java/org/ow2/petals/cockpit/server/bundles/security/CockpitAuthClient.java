/**
 * Copyright (C) 2016-2019 Linagora
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

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.LdapConfigFactory;
import org.pac4j.core.client.IndirectClient;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.redirect.RedirectAction;
import org.pac4j.jax.rs.pac4j.JaxRsAjaxRequestResolver;

public class CockpitAuthClient extends IndirectClient<UsernamePasswordCredentials, CommonProfile> {

    @Nullable
    private static LdapConfigFactory ldapConf;

    public CockpitAuthClient() {
        // let's always consider it as an ajax request: no redirect will happen then!
        setAjaxRequestResolver(new JaxRsAjaxRequestResolver());

        // we don't really care because we never use it to redirect (see above)
        setRedirectActionBuilder(wc -> RedirectAction.success(""));
    }

    /*
     * This method is a workaround to use LDAP configuration because @Inject doesn't work on CockpitAuthClient.
     */
    public static void setLdapConfiguration(LdapConfigFactory ldapConfParam) {
        ldapConf = ldapConfParam;
    }

    @Override
    protected void clientInit() {
        if (ldapConf != null) {
            defaultAuthenticator(new LdapAuthenticator(ldapConf));
        } else {
            defaultAuthenticator(new CockpitAuthenticator());
        }
        defaultCredentialsExtractor(new CockpitExtractor());
    }
}
