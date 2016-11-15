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
package org.ow2.petals.cockpit.server.commands;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.assertj.core.api.SoftAssertions;
import org.eclipse.jdt.annotation.Nullable;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.SystemErrRule;
import org.junit.contrib.java.lang.system.SystemOutRule;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;
import org.zapodot.junit.db.EmbeddedDatabaseRule;

import com.codahale.metrics.MetricFilter;

import io.dropwizard.cli.Cli;
import io.dropwizard.configuration.ResourceConfigurationSourceProvider;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.testing.ConfigOverride;
import io.dropwizard.util.JarLocation;

public class AddUserTest {

    /**
     * The name is used in the config file
     */
    @Rule
    public EmbeddedDatabaseRule dbRule = EmbeddedDatabaseRule.builder().build();

    public ConfigOverride dbConfig = ConfigOverride.config("database.url", () -> dbRule.getConnectionJdbcUrl());

    @Rule
    public final SystemErrRule systemErrRule = new SystemErrRule().enableLog();

    @Rule
    public final SystemOutRule systemOutRule = new SystemOutRule().enableLog();

    @Nullable
    private Cli cli;

    @Nullable
    private Bootstrap<CockpitConfiguration> bootstrap;

    private Cli cli() {
        assert cli != null;
        return cli;
    }

    private Bootstrap<CockpitConfiguration> bootstrap() {
        assert bootstrap != null;
        return bootstrap;
    }

    @Before
    public void setUp() throws Exception {
        final JarLocation location = mock(JarLocation.class);
        when(location.getVersion()).thenReturn(Optional.of("1.0.0"));

        // it's initialize method won't be run (but its run method will!)
        CockpitApplication<CockpitConfiguration> app = new CockpitApplication<>();
        bootstrap = new Bootstrap<>(app);

        // let's load configuration from resources
        bootstrap().setConfigurationSourceProvider(new ResourceConfigurationSourceProvider());

        // let's simulate the initialize method only for what we need here
        bootstrap().addBundle(app.migrations);
        bootstrap().addCommand(new AddUserCommand<>(app));

        cli = new Cli(location, bootstrap, System.out, System.err);

        dbConfig.addToSystemProperties();

        // let's setup the db
        cli().run("db", "migrate", "add-user-test.yml");

        systemOutRule.clearLog();
    }

    @After
    public void tearDown() {
        dbConfig.removeFromSystemProperties();
    }

    @Test
    public void addUserToDb() throws Exception {
        boolean success = cli().run("add-user", "-n", "Admin", "-u", "admin", "-p", "password", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout")
                .contains("Added user admin");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        // TODO can't test that until https://github.com/zapodot/embedded-db-junit/issues/4 is fixed
        // final DBI dbi = new DBI(dbRule.getDataSource());
        // try (Handle handle = dbi.open()) {
        // String found = handle.createQuery("select name from users where username = :username")
        // .bind("username", "admin").map(StringColumnMapper.INSTANCE).first();
        // assertThat(found).as("admin's name").isEqualTo("Admin");
        // }
    }

    @Test
    public void addUserToDbTwice() throws Exception {
        
        addUserToDb();
        systemErrRule.clearLog();
        systemOutRule.clearLog();
        // needed because running cli will register them again...
        bootstrap().getMetricRegistry().removeMatching(MetricFilter.ALL);
        
        boolean success = cli().run("add-user", "-n", "Admin", "-u", "admin", "-p", "password", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout")
                .doesNotContain("Added user");
        softly.assertThat(systemErrRule.getLog()).as("stderr").contains("User admin already exists");
        softly.assertAll();
    }
}
