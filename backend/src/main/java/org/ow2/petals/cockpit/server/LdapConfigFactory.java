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
package org.ow2.petals.cockpit.server;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LdapConfigFactory {

    @Valid
    @NotNull
    @NotEmpty
    private String url;

    @Valid
    @NotNull
    @NotEmpty
    private String usersDn;

    @Valid
    @NotNull
    @NotEmpty
    private String usernameAttribute = "uid";

    @Valid
    @NotNull
    @NotEmpty
    private String nameAttribute = "cn";

    @Valid
    @NotNull
    @NotEmpty
    private String passwordAttribute = "userPassword";

    @Valid
    @NotNull
    @NotEmpty
    private String principalDn;

    @Valid
    @NotNull
    @NotEmpty
    private String principalPassword;

    @JsonProperty
    public String getUrl() {
        return url;
    }

    @JsonProperty
    public void setUrl(String url) {
        this.url = url;
    }

    @JsonProperty
    public String getUsersDn() {
        return usersDn;
    }

    @JsonProperty
    public void setUsersDn(String usersDn) {
        this.usersDn = usersDn;
    }

    @JsonProperty
    public String getUsernameAttribute() {
        return usernameAttribute;
    }

    @JsonProperty
    public void setUsernameAttribute(String usernameAttribute) {
        this.usernameAttribute = usernameAttribute;
    }

    @JsonProperty
    public String getNameAttribute() {
        return nameAttribute;
    }

    @JsonProperty
    public void setNameAttribute(String nameAttribute) {
        this.nameAttribute = nameAttribute;
    }

    @JsonProperty
    public String getPasswordAttribute() {
        return passwordAttribute;
    }

    @JsonProperty
    public void setPasswordAttribute(String passwordAttribute) {
        this.passwordAttribute = passwordAttribute;
    }

    @JsonProperty
    public String getPrincipalDn() {
        return principalDn;
    }

    @JsonProperty
    public void setPrincipalDn(String principalDn) {
        this.principalDn = principalDn;
    }

    @JsonProperty
    public String getPrincipalPassword() {
        return principalPassword;
    }

    @JsonProperty
    public void setPrincipalPassword(String principalPassword) {
        this.principalPassword = principalPassword;
    }
}
