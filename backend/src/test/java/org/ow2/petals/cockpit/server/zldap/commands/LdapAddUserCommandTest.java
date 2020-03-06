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

import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS_WORKSPACES;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import org.assertj.core.api.SoftAssertions;
import org.assertj.db.type.Table;
import org.junit.Test;
import org.ow2.petals.cockpit.server.commands.AddUserCommand;
import org.ow2.petals.cockpit.server.zldap.AbstractLdapTest;

public class LdapAddUserCommandTest extends AbstractLdapCommandTest {

    public LdapAddUserCommandTest() {
        super(new AddUserCommand());
    }

    @Test
    public void addLdapUser() throws Exception {
        boolean success = cli().run("add-user", "-u", AbstractLdapTest.USER1.username, "-l", "add-ldap-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout").contains("Added user user");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        assertThat(new Table(appLdap.db.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo(AbstractLdapTest.USER1.username)
                .column(USERS.NAME.getName()).value().isEqualTo(AbstractLdapTest.USER1.name)
                .column(USERS.ADMIN.getName()).value().isEqualTo(false)
                .column(USERS.IS_FROM_LDAP.getName()).value().isEqualTo(true);

        assertThat(new Table(appLdap.db.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(0);
        assertThat(new Table(appLdap.db.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(0);
    }

    @Test
    public void addLdapUserWithPassword() throws Exception {
        boolean success = cli().run("add-user", "-u", AbstractLdapTest.USER1.username, "-l", "-p", "password",
                "add-ldap-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();
        softly.assertThat(systemErrRule.getLog()).as("stderr").contains("Cannot use -p/--password with -l/--ldapUser");
        softly.assertAll();
    }

    @Test
    public void addLdapUserWithName() throws Exception {
        boolean success = cli().run("add-user", "-u", AbstractLdapTest.USER1.username, "-l", "-n",
                AbstractLdapTest.USER1.name, "add-ldap-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isFalse();
        softly.assertThat(systemErrRule.getLog()).as("stderr").contains("Cannot use -n/--name with -l/--ldapUser");
        softly.assertAll();
    }

    @Test
    public void addLdapUserWithWorkspacePermissions() throws Exception {
        boolean success = cli().run("add-user", "-l", "-u", AbstractLdapTest.USER1.username, "-w", "myWorkspace",
                "--adminWorkspace", "--deployArtifact", "add-ldap-user-test.yml");

        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(success).as("Exit success").isTrue();

        softly.assertThat(systemOutRule.getLogWithNormalizedLineSeparator()).as("stdout")
                .contains("Added user " + AbstractLdapTest.USER1.username,
                "Added workspace myWorkspace");
        softly.assertThat(systemErrRule.getLog()).as("stderr").isEmpty();
        softly.assertAll();

        assertThat(new Table(appLdap.db.getDataSource(), USERS.getName())).hasNumberOfRows(1).row()
                .column(USERS.USERNAME.getName()).value().isEqualTo(AbstractLdapTest.USER1.username)
                .column(USERS.NAME.getName()).value().isEqualTo(AbstractLdapTest.USER1.name)
                .column(USERS.ADMIN.getName()).value().isFalse()
                .column(USERS.IS_FROM_LDAP.getName()).value().isTrue()
                .column(USERS.LAST_WORKSPACE.getName()).value().isNotNull();

        assertThat(new Table(appLdap.db.getDataSource(), WORKSPACES.getName())).hasNumberOfRows(1).row()
                .column(WORKSPACES.NAME.getName()).value().isEqualTo("myWorkspace")
                .column(WORKSPACES.DESCRIPTION.getName()).value()
                .isEqualTo("Workspace automatically generated for **" + AbstractLdapTest.USER1.username + "**.");

        assertThat(new Table(appLdap.db.getDataSource(), USERS_WORKSPACES.getName())).hasNumberOfRows(1).row()
                .column(USERS_WORKSPACES.USERNAME.getName()).value().isEqualTo(AbstractLdapTest.USER1.username)
                .column(USERS_WORKSPACES.ADMIN_WORKSPACE_PERMISSION.getName()).value().isTrue()
                .column(USERS_WORKSPACES.DEPLOY_ARTIFACT_PERMISSION.getName()).value().isTrue()
                .column(USERS_WORKSPACES.LIFECYCLE_ARTIFACT_PERMISSION.getName()).value().isFalse();
    }
}
