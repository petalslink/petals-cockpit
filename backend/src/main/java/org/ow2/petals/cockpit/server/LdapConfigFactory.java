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

import com.fasterxml.jackson.annotation.JsonProperty;

public class LDAPConfigFactory {

    @Nullable
    private String url = null;

    @Nullable
    private String usersDn = null;

    @Nullable
    private String usernameAttribute = null;

    @Nullable
    private String nameAttribute = null;

    @Nullable
    private String passwordAttribute = null;

    @JsonProperty
    @Nullable
    public String getUrl() {
        return url;
    }

    @JsonProperty
    public void setUrl(String url) {
        this.url = url;
    }

    @JsonProperty
    @Nullable
    public String getUsersDn() {
        return usersDn;
    }

    @JsonProperty
    public void setUsersDn(String formatDn) {
        this.usersDn = formatDn;
    }

    @JsonProperty
    @Nullable
    public String getUsernameAttribute() {
        return usernameAttribute;
    }

    @JsonProperty
    public void setUsernameAttribute(String userNameAttribute) {
        this.usernameAttribute = userNameAttribute;
    }

    @JsonProperty
    @Nullable
    public String getNameAttribute() {
        return nameAttribute;
    }

    @JsonProperty
    public void setNameAttribute(String nameAttribute) {
        this.nameAttribute = nameAttribute;
    }

    @JsonProperty
    @Nullable
    public String getPasswordAttribute() {
        return passwordAttribute;
    }

    @JsonProperty
    public void setPasswordAttribute(String passwordAttribute) {
        this.passwordAttribute = passwordAttribute;
    }

    public boolean isConfigurationValid() {
        return url != null && !url.isEmpty() && usersDn != null && !usersDn.isEmpty() && usernameAttribute != null
                && !usernameAttribute.isEmpty();
    }
}
