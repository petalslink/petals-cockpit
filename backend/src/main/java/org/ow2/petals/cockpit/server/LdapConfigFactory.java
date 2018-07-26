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

import org.eclipse.jdt.annotation.Nullable;
import org.hibernate.validator.constraints.NotBlank;
import org.ldaptive.ConnectionConfig;
import org.ldaptive.DefaultConnectionFactory;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LdapConfigFactory {

    @NotBlank
    @Nullable
    private String url;

    @NotBlank
    @Nullable
    private String usersDn;

    @NotBlank
    private String usernameAttribute = "uid";

    @NotBlank
    private String nameAttribute = "cn";

    @NotBlank
    private String passwordAttribute = "userPassword";

    @NotBlank
    @Nullable
    private String principalDn;

    @NotBlank
    @Nullable
    private String principalPassword;

    public String getUrl() {
        assert this.url != null;
        return this.url;
    }

    @JsonProperty
    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsersDn() {
        assert this.usersDn != null;
        return this.usersDn;
    }

    @JsonProperty
    public void setUsersDn(String usersDn) {
        this.usersDn = usersDn;
    }

    public String getUsernameAttribute() {
        assert this.usernameAttribute != null;
        return this.usernameAttribute;
    }

    @JsonProperty
    public void setUsernameAttribute(String usernameAttribute) {
        this.usernameAttribute = usernameAttribute;
    }

    public String getNameAttribute() {
        assert this.nameAttribute != null;
        return this.nameAttribute;
    }

    @JsonProperty
    public void setNameAttribute(String nameAttribute) {
        this.nameAttribute = nameAttribute;
    }

    public String getPasswordAttribute() {
        assert this.passwordAttribute != null;
        return this.passwordAttribute;
    }

    @JsonProperty
    public void setPasswordAttribute(String passwordAttribute) {
        this.passwordAttribute = passwordAttribute;
    }

    public String getPrincipalDn() {
        assert this.principalDn != null;
        return this.principalDn;
    }

    @JsonProperty
    public void setPrincipalDn(String principalDn) {
        this.principalDn = principalDn;
    }

    public String getPrincipalPassword() {
        assert this.principalPassword != null;
        return this.principalPassword;
    }

    @JsonProperty
    public void setPrincipalPassword(String principalPassword) {
        this.principalPassword = principalPassword;
    }

    public DefaultConnectionFactory buildConnectionFactory() {
        ConnectionConfig connConfig = new ConnectionConfig(this.getUrl());
        connConfig.setUseStartTLS(false);
        return new DefaultConnectionFactory(connConfig);
    }
}
