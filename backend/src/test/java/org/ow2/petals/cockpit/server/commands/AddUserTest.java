/**
 * Copyright (C) 2016-2018 Linagora
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

import static org.assertj.db.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.Optional;

import org.assertj.core.api.SoftAssertions;
import org.assertj.db.type.Table;
import org.eclipse.jdt.annotation.Nullable;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.SystemErrRule;
import org.junit.contrib.java.lang.system.SystemOutRule;
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.zapodot.junit.db.EmbeddedDatabaseRule;

import com.codahale.metrics.MetricFilter;

import io.dropwizard.cli.Cli;
import io.dropwizard.configuration.ResourceConfigurationSourceProvider;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.testing.ConfigOverride;
import io.dropwizard.util.JarLocation;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;

public class AddUserTest extends AbstractTest {

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
        // setup the database schema
        new Liquibase("migrations.xml", new ClassLoaderResourceAccessor(), new JdbcConnection(dbRule.getConnection()))
                .update("");

        final JarLocation location = mock(JarLocation.class);
        when(location.getVersion()).thenReturn(Optional.of("1.0.0"));

        // its initialize method won't be run (but its run method will!)
        bootstrap = new Bootstrap<>(new CockpitApplication<>());

        // let's load configuration from resources
        bootstrap().setConfigurationSourceProvider(new ResourceConfigurationSourceProvider());

        // let's simulate the initialize method only for what we need here
        bootstrap().addCommand(new AddUserCommand<>());

        cli = new Cli(location, bootstrap, System.out, System.err);

        // used by the cli when running command
        dbConfig.addToSystemProperties();
    }

    @After
    public void tearDown() {
        dbConfig.removeFromSystemProperties();
    }

    @Test
    public void addUserAdminToDb() throws Exception {
        boolean success = cli().run("add-user", "-n", "Admin", "-u", "admin", "-p", "password", "-a",
                "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout").contains("Added user admin");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        assertThat(new Table(dbRule.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo("admin")
                .column(USERS.NAME.getName()).value().isEqualTo("Admin")
                .column(USERS.ADMIN.getName()).value().isEqualTo(true)
                .column(USERS.IS_FROM_LDAP.getName()).value().isEqualTo(false);

        assertThat(new Table(dbRule.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(0);
        assertThat(new Table(dbRule.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(0);
    }

    @Test
    public void addUserToDb() throws Exception {
        boolean success = cli().run("add-user", "-n", "User", "-u", "user", "-p", "password", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout").contains("Added user user");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        assertThat(new Table(dbRule.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo("user")
                .column(USERS.NAME.getName()).value().isEqualTo("User")
                .column(USERS.ADMIN.getName()).value().isEqualTo(false)
                .column(USERS.IS_FROM_LDAP.getName()).value().isEqualTo(false);

        assertThat(new Table(dbRule.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(0);
        assertThat(new Table(dbRule.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(0);
    }

    @Test
    public void addLdapUserToDb() throws Exception {
        boolean success = cli().run("add-user", "-n", "User", "-u", "user", "-l",
                "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout").contains("Added user user");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        assertThat(new Table(dbRule.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo("user")
                .column(USERS.NAME.getName()).value().isEqualTo("User")
                .column(USERS.ADMIN.getName()).value().isEqualTo(false)
                .column(USERS.IS_FROM_LDAP.getName()).value().isEqualTo(true);

        assertThat(new Table(dbRule.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(0);
        assertThat(new Table(dbRule.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(0);
    }

    @Test
    public void addUserToDbTwice() throws Exception {
        addUserAdminToDb();
        systemErrRule.clearLog();
        systemOutRule.clearLog();
        // needed because running cli will register them again...
        bootstrap().getMetricRegistry().removeMatching(MetricFilter.ALL);

        boolean success = cli().run("add-user", "-n", "Admin", "-u", "admin", "-p", "password", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout").doesNotContain("Added user");
        softly.assertThat(systemErrRule.getLog()).as("stderr").contains("User admin already exists");
        softly.assertAll();

        assertThat(new Table(dbRule.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo("admin")
                .column(USERS.NAME.getName()).value().isEqualTo("Admin");

        assertThat(new Table(dbRule.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(0);
        assertThat(new Table(dbRule.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(0);
    }

    @Test
    public void addUserAdminToDbWithWorkspace() throws Exception {
        boolean success = cli().run("add-user", "-n", "Admin", "-u", "admin", "-p", "password", "-a", "-w",
                "myWorkspace", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout").contains("Added user admin",
                "Added workspace myWorkspace");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        assertThat(new Table(dbRule.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo("admin")
                .column(USERS.NAME.getName()).value().isEqualTo("Admin")
                .column(USERS.ADMIN.getName()).value().isEqualTo(true)
                .column(USERS.IS_FROM_LDAP.getName()).value().isEqualTo(false)
                .column(USERS.LAST_WORKSPACE.getName()).value().isNotNull();

        assertThat(new Table(dbRule.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(1).row()
                .column(WORKSPACES.NAME.getName()).value().isEqualTo("myWorkspace")
                .column(WORKSPACES.DESCRIPTION.getName()).value()
                .isEqualTo("Workspace automatically generated for **admin**.");

        assertThat(new Table(dbRule.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(1).row()
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("admin");
    }

    @Test
    public void addLdapUserWithPassword() throws Exception {
        boolean success = cli().run("add-user", "-n", "User", "-u", "user", "-l", "-p", "password",
                "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();
    }

    @Test
    public void addUserWithoutPassword() throws Exception {
        boolean success = cli().run("add-user", "-n", "User", "-u", "user",
                "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();
    }
}
