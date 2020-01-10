/**
 * Copyright (C) 2018-2020 Linagora
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

    /**
     * This password is the default password for the ldap users in database, since their real password (from ldap) is
     * not stored locally.
     */
    public final static String LDAP_PASSWORD = "";

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
        assert url != null;
        return url;
    }

    @JsonProperty
    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsersDn() {
        assert usersDn != null;
        return usersDn;
    }

    @JsonProperty
    public void setUsersDn(String usersDn) {
        this.usersDn = usersDn;
    }

    public String getUsernameAttribute() {
        assert usernameAttribute != null;
        return usernameAttribute;
    }

    @JsonProperty
    public void setUsernameAttribute(String usernameAttribute) {
        this.usernameAttribute = usernameAttribute;
    }

    public String getNameAttribute() {
        assert nameAttribute != null;
        return nameAttribute;
    }

    @JsonProperty
    public void setNameAttribute(String nameAttribute) {
        this.nameAttribute = nameAttribute;
    }

    public String getPasswordAttribute() {
        assert passwordAttribute != null;
        return passwordAttribute;
    }

    @JsonProperty
    public void setPasswordAttribute(String passwordAttribute) {
        this.passwordAttribute = passwordAttribute;
    }

    public String getPrincipalDn() {
        assert principalDn != null;
        return principalDn;
    }

    @JsonProperty
    public void setPrincipalDn(String principalDn) {
        this.principalDn = principalDn;
    }

    public String getPrincipalPassword() {
        assert principalPassword != null;
        return principalPassword;
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
