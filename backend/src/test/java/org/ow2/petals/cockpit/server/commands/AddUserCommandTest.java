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
package org.ow2.petals.cockpit.server.commands;

import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import org.assertj.core.api.SoftAssertions;
import org.assertj.db.type.Changes;
import org.assertj.db.type.Table;
import org.junit.Test;

import com.codahale.metrics.MetricFilter;

public class AddUserCommandTest extends AbstractCommandTest {

    public AddUserCommandTest() {
        super(new AddUserCommand());
    }

    @Test
    public void addUserAdmin() throws Exception {
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
    public void addUser() throws Exception {
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
    public void addUserWithSameUsername() throws Exception {
        addUserAdmin();
        systemErrRule.clearLog();
        systemOutRule.clearLog();
        // needed because running cli will register them again...
        bootstrap().getMetricRegistry().removeMatching(MetricFilter.ALL);

        boolean success = cli().run("add-user", "-n", "Admin", "-u", "admin", "-p", "password", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();

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
    public void addUserAdminWithWorkspace() throws Exception {
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
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("admin")
                .column(USERS_WORKSPACES.ADMIN_WORKSPACE_PERMISSION.getName()).value().isFalse()
                .column(USERS_WORKSPACES.DEPLOY_ARTIFACT_PERMISSION.getName()).value().isFalse()
                .column(USERS_WORKSPACES.LIFECYCLE_ARTIFACT_PERMISSION.getName()).value().isFalse();
    }

    @Test
    public void addUsersWithSameWorkspace() throws Exception {
        addUserAdminWithWorkspace();
        systemErrRule.clearLog();
        systemOutRule.clearLog();
        // needed because running cli will register them again...
        bootstrap().getMetricRegistry().removeMatching(MetricFilter.ALL);

        Changes changes = new Changes(dbRule.getDataSource());

        changes.setStartPointNow();
        boolean success = cli().run("add-user", "-n", "Christophe CHEVALIER", "-u", "cchevalier", "-p", "cchevalier",
                "-w", "MYWORKSPACE", "add-user-test.yml");
        changes.setEndPointNow();

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout")
                .contains("Added user cchevalier").doesNotContain("Added workspace MYWORKSPACE");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        Long myWorkspaceId = (Long) new Table(dbRule.getDataSource(), WORKSPACES.getName()).getRow(0)
                .getColumnValue(WORKSPACES.ID.getName()).getValue();

        assertThat(changes).ofCreationOnTable(USERS.getName()).hasNumberOfChanges(1).change()
                .column(USERS.USERNAME.getName()).valueAtEndPoint().isEqualTo("cchevalier")
                .column(USERS.NAME.getName()).valueAtEndPoint().isEqualTo("Christophe CHEVALIER")
                .column(USERS.ADMIN.getName()).valueAtEndPoint().isEqualTo(false)
                .column(USERS.IS_FROM_LDAP.getName()).valueAtEndPoint().isEqualTo(false)
                .column(USERS.LAST_WORKSPACE.getName()).valueAtEndPoint().isEqualTo(myWorkspaceId)
                .ofModificationOnTable(USERS.getName()).hasNumberOfChanges(0);

        assertThat(changes).onTable(WORKSPACES.getName()).hasNumberOfChanges(0);

        assertThat(changes).ofCreationOnTable(USERS_WORKSPACES.getName()).hasNumberOfChanges(1).change()
                .column(USERS_WORKSPACES.USERNAME.getName()).valueAtEndPoint().isEqualTo("cchevalier")
                .column(USERS_WORKSPACES.WORKSPACE_ID.getName()).valueAtEndPoint().isEqualTo(myWorkspaceId)
                .ofModificationOnTable(USERS_WORKSPACES.getName()).hasNumberOfChanges(0);
    }

    @Test
    public void addUserWithWorkspacePermissions() throws Exception {
        boolean success = cli().run("add-user", "-n", "User", "-u", "user", "-p", "password", "-w", "myWorkspace",
                "--adminWorkspace", "--deployArtifact", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout").contains("Added user user",
                "Added workspace myWorkspace");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        assertThat(new Table(dbRule.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo("user")
                .column(USERS.NAME.getName()).value().isEqualTo("User")
                .column(USERS.ADMIN.getName()).value().isFalse()
                .column(USERS.IS_FROM_LDAP.getName()).value().isFalse()
                .column(USERS.LAST_WORKSPACE.getName())
                .value().isNotNull();

        assertThat(new Table(dbRule.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(1).row()
                .column(WORKSPACES.NAME.getName()).value().isEqualTo("myWorkspace")
                .column(WORKSPACES.DESCRIPTION.getName()).value()
                .isEqualTo("Workspace automatically generated for **user**.");

        assertThat(new Table(dbRule.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(1).row()
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo("user")
                .column(USERS_WORKSPACES.ADMIN_WORKSPACE_PERMISSION.getName()).value().isTrue()
                .column(USERS_WORKSPACES.DEPLOY_ARTIFACT_PERMISSION.getName()).value().isTrue()
                .column(USERS_WORKSPACES.LIFECYCLE_ARTIFACT_PERMISSION.getName()).value().isFalse();
    }

    @Test
    public void addUserWithoutName() throws Exception {
        boolean success = cli().run("add-user", "-p", "password", "-u", "user", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();
        softly.assertThat(systemErrRule.getLog()).as("stderr").contains("-n/--name is required");
        softly.assertAll();
    }

    @Test
    public void addUserWithoutPassword() throws Exception {
        boolean success = cli().run("add-user", "-n", "User", "-u", "user", "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();
        softly.assertThat(systemErrRule.getLog()).as("stderr").contains("-p/--password is required");
        softly.assertAll();
    }

    @Test
    public void addUserWithPermissionsWithoutWorkspace() throws Exception {
        boolean success = cli().run("add-user", "-n", "User", "-u", "user", "-p", "password", "--adminWorkspace",
                "add-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();
        softly.assertThat(systemErrRule.getLog()).as("stderr")
                .contains("Cannot set workspace permissions without -w/--workspacename");
        softly.assertAll();
    }
}
