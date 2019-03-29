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
package org.ow2.petals.cockpit.server.bundles.security;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.constraints.NotNull;

import org.eclipse.jdt.annotation.Nullable;
import org.hibernate.validator.constraints.NotEmpty;
import org.pac4j.core.authorization.authorizer.RequireAllRolesAuthorizer;
import org.pac4j.core.client.Client;
import org.pac4j.core.context.DefaultAuthorizers;
import org.pac4j.core.matching.PathMatcher;
import org.pac4j.dropwizard.Pac4jBundle;
import org.pac4j.dropwizard.Pac4jFactory;
import org.pac4j.dropwizard.Pac4jFactory.JaxRsSecurityFilterConfiguration;
import org.pac4j.jax.rs.filters.JaxRsHttpActionAdapter;
import org.pac4j.jax.rs.pac4j.JaxRsContext;
import org.pac4j.jax.rs.servlet.pac4j.ServletJaxRsContext;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import io.dropwizard.Configuration;

public abstract class CockpitSecurityBundle<C extends Configuration> extends Pac4jBundle<C> {

    public static final String PAC4J_EXCLUDE_MATCHER = "globalMatcherExcludes";

    public static final String IS_ADMIN_AUTHORIZER = "isAdminAuthorizer";

    protected abstract CockpitSecurityConfiguration getConfiguration(C configuration);

    @Override
    public Pac4jFactory getPac4jFactory(C configuration) {
        CockpitSecurityConfiguration securityConfiguration = getConfiguration(configuration);
        List<Client> clients = securityConfiguration.getPac4jClients();

        // TODO would it make sense to do injection on the clients? e.g. for UsersDAO
        List<String> clientsNames = clients.stream().map(Client::getName).collect(Collectors.toList());

        String defaultClients = String.join(",", clientsNames);

        Pac4jFactory pac4jConf = new Pac4jFactory();

        // /user/session url is handled by callbacks, logout, etc filters
        // /setup and /ldap/status are not concerned by this
        pac4jConf.setMatchers(ImmutableMap.of(PAC4J_EXCLUDE_MATCHER,
                new PathMatcher().excludePath("/user/session").excludePath("/setup").excludePath("/ldap/status")));

        // this protects the whole application with all the declared clients
        JaxRsSecurityFilterConfiguration f = new JaxRsSecurityFilterConfiguration();
        f.setMatchers(PAC4J_EXCLUDE_MATCHER);
        f.setAuthorizers(DefaultAuthorizers.IS_AUTHENTICATED);
        f.setClients(defaultClients);
        pac4jConf.setGlobalFilters(ImmutableList.of(f));

        // this will be used by SSO-type authenticators (appended with client name as parameter)
        // for now, we still need to give a value in order for pac4j to be happy
        pac4jConf.setCallbackUrl("/user/session");
        pac4jConf.setClients(clients);

        // this ensure Pac4JSecurity annotations use all the clients
        // (for example on /user)
        pac4jConf.setDefaultSecurityClients(defaultClients);

        pac4jConf.setHttpActionAdapter(new HttpActionAdapter303());

        pac4jConf.getAuthorizers().put(IS_ADMIN_AUTHORIZER, new RequireAllRolesAuthorizer<>(CockpitProfile.ROLE_ADMIN));

        return pac4jConf;
    }

    /**
     * According to the HTTP/1.1 specification, we should use 303 and not 302 when redirecting from a POST to a GET (see
     * https://github.com/pac4j/pac4j/issues/866).
     */
    public static class HttpActionAdapter303 extends JaxRsHttpActionAdapter {
        @Override
        @Nullable
        public Object adapt(int code, @Nullable JaxRsContext context) {
            assert context != null;
            if (code == 302 && "POST".equalsIgnoreCase(context.getRequestMethod())
                    && "HTTP/1.1".equalsIgnoreCase(((ServletJaxRsContext) context).getRequest().getProtocol())) {
                context.setResponseStatus(303);
                return super.adapt(303, context);
            } else {
                return super.adapt(code, context);
            }
        }
    }

    public static class CockpitSecurityConfiguration {

        @NotNull
        @NotEmpty
        private List<Client> pac4jClients = new ArrayList<>();

        public CockpitSecurityConfiguration() {
            pac4jClients.add(new CockpitAuthClient());
        }

        @JsonProperty
        public List<Client> getPac4jClients() {
            return pac4jClients;
        }

        @JsonProperty
        public void setPac4jClients(List<Client> pac4jClients) {
            this.pac4jClients = pac4jClients;
        }
    }
}
