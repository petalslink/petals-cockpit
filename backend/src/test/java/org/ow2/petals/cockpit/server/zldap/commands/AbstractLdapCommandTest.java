/**
 * Copyright (C) 2016-2020 Linagora
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
package org.ow2.petals.cockpit.server.zldap.commands;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.eclipse.jdt.annotation.Nullable;
import org.junit.Before;
import org.junit.Rule;
import org.junit.contrib.java.lang.system.SystemErrRule;
import org.junit.contrib.java.lang.system.SystemOutRule;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.ow2.petals.cockpit.server.zldap.AbstractLdapTest;

import io.dropwizard.cli.Cli;
import io.dropwizard.cli.Command;
import io.dropwizard.configuration.ResourceConfigurationSourceProvider;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.util.JarLocation;

public class AbstractLdapCommandTest extends AbstractLdapTest {
    @Rule
    public final SystemErrRule systemErrRule = new SystemErrRule().enableLog();

    @Rule
    public final SystemOutRule systemOutRule = new SystemOutRule().enableLog();

    @Nullable
    private Cli cli;

    @Nullable
    private Bootstrap<CockpitConfiguration> bootstrap;

    private Command[] commands;

    public AbstractLdapCommandTest(Command... commands) {
        this.commands = commands;
    }

    public Cli cli() {
        assert cli != null;
        return cli;
    }

    public Bootstrap<CockpitConfiguration> bootstrap() {
        assert bootstrap != null;
        return bootstrap;
    }

    @Before
    public void setUp() throws Exception {
        final JarLocation location = mock(JarLocation.class);
        when(location.getVersion()).thenReturn(Optional.of("1.0.0"));

        // its initialize method won't be run (but its run method will!)
        bootstrap = new Bootstrap<>(new CockpitApplication<>());

        // let's load configuration from resources
        bootstrap().setConfigurationSourceProvider(new ResourceConfigurationSourceProvider());

        // let's simulate the initialize method only for what we need here
        for (Command command : commands) {
            bootstrap().addCommand(command);
        }

        cli = new Cli(location, bootstrap, System.out, System.err);
    }
}
