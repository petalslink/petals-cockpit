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
package org.ow2.petals.cockpit.server.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.File;

import javax.validation.Validator;

import org.junit.Test;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.LdapConfigFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.Resources;

import io.dropwizard.configuration.ConfigurationValidationException;
import io.dropwizard.configuration.YamlConfigurationFactory;
import io.dropwizard.jackson.Jackson;
import io.dropwizard.jersey.validation.Validators;

public class LdapConfigTest {
    private final ObjectMapper objectMapper = Jackson.newObjectMapper();

    private final Validator validator = Validators.newValidator();

    private final YamlConfigurationFactory<CockpitConfiguration> factory = new YamlConfigurationFactory<>(
            CockpitConfiguration.class, this.validator, this.objectMapper, "dw");

    /**
     * This test shows that if only the line ldapConfig is present, but with no content, the ldap configuration is
     * considered omitted.
     *
     * @throws Exception
     */
    @Test
    public void testBuildEmptyLdapConfig() throws Exception {
        final File yml = new File(Resources.getResource("ldap-no-config-empty-ldap.yml").toURI());
        CockpitConfiguration config = this.factory.build(yml);
        assertNull(config.getLdapConfigFactory());
    }

    @Test
    public void testBuildOmittedLdapConfig() throws Exception {
        final File yml = new File(Resources.getResource("ldap-no-config-omitted-ldap.yml").toURI());
        CockpitConfiguration config = this.factory.build(yml);
        assertNull(config.getLdapConfigFactory());
    }

    @Test(expected = ConfigurationValidationException.class)
    public void testBuildWrongLdapConfigEmptyField() throws Exception {
        final File yml = new File(Resources.getResource("ldap-wrong-config-empty-field.yml").toURI());
        this.factory.build(yml);
    }

    @Test(expected = ConfigurationValidationException.class)
    public void testBuildWrongLdapConfigOmittedField() throws Exception {
        final File yml = new File(Resources.getResource("ldap-wrong-config-omitted-field.yml").toURI());
        this.factory.build(yml);
    }

    @Test
    public void testBuildRightLdapConfig() throws Exception {
        final File yml = new File(Resources.getResource("ldap-right-config.yml").toURI());
        LdapConfigFactory ldapConf = this.factory.build(yml).getLdapConfigFactory();

        assertNotNull(ldapConf);
        assertEquals("ldap://localhost:33389", ldapConf.getUrl());
        assertEquals("ou=people,dc=example,dc=com", ldapConf.getUsersDn());
        assertEquals("cn", ldapConf.getUsernameAttribute());
        assertEquals("sn", ldapConf.getNameAttribute());
        assertEquals("userPassword", ldapConf.getPasswordAttribute());
        assertEquals("uid=admin,ou=people,dc=example,dc=com", ldapConf.getPrincipalDn());
        assertEquals("azerty123", ldapConf.getPrincipalPassword());
    }
}
