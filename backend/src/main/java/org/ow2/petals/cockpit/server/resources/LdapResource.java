/**
 * Copyright (C) 2018 Linagora
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

import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.eclipse.jdt.annotation.Nullable;
import org.hibernate.validator.constraints.NotEmpty;
import org.ldaptive.LdapException;
import org.ow2.petals.cockpit.server.services.LdapService;

import com.fasterxml.jackson.annotation.JsonProperty;

@Singleton
@Path("/ldap")
public class LdapResource {

    private LdapService ldapService;

    @Inject
    public LdapResource(LdapService ldapService) {
        this.ldapService = ldapService;
    }

    @GET
    @Path("/users")
    @Produces(MediaType.APPLICATION_JSON)
    public List<LdapResource.LdapUser> getUsersByNameOrUsername(@NotNull @NotEmpty @Pattern(regexp="^[^()=*]+$") @QueryParam("name") String name)
            throws LdapException {
        return ldapService.getUsersByNameOrUsername(name);
    }

    public static class LdapUser {
        @JsonProperty
        public String username;

        @JsonProperty
        public String name;

        public LdapUser(@JsonProperty("username") String username, @JsonProperty("name") String name) {
            this.username = username;
            this.name = name;
        }

        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            result = prime * result + ((name == null) ? 0 : name.hashCode());
            result = prime * result + ((username == null) ? 0 : username.hashCode());
            return result;
        }

        @Override
        public boolean equals(@Nullable Object obj) {
            if (this == obj)
                return true;
            if (!(obj instanceof LdapUser))
                return false;
            LdapUser other = (LdapUser) obj;
            if (!name.equals(other.name))
                return false;
            if (!username.equals(other.username))
                return false;
            return true;
        }
    }
}
