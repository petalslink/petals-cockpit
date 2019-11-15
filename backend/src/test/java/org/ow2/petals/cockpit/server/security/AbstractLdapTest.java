/**
 * Copyright (C) 2018-2019 Linagora
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.assertj.db.api.RequestRowAssert;
import org.assertj.db.type.Request;
import org.eclipse.jdt.annotation.Nullable;
import org.jooq.Record;
import org.jooq.TableField;
import org.jooq.conf.ParamType;
import org.junit.Rule;
import org.ow2.petals.cockpit.server.AbstractTest;
import org.ow2.petals.cockpit.server.bundles.security.CockpitAuthenticator;
import org.ow2.petals.cockpit.server.bundles.security.CockpitExtractor.Authentication;
import org.ow2.petals.cockpit.server.db.generated.tables.records.UsersRecord;
import org.ow2.petals.cockpit.server.mocks.MockLdapServer;
import org.ow2.petals.cockpit.server.resources.LdapResource.LdapUser;
import org.ow2.petals.cockpit.server.resources.UserSession.CurrentUser;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;
import org.ow2.petals.cockpit.server.rules.CockpitLdapApplicationRule;

public class AbstractLdapTest extends AbstractTest {

    @SuppressWarnings("null")
    public static final NewUser ADMIN_LDAP_DB = MockLdapServer.LDAP_USER1;

    @SuppressWarnings("null")
    public static final NewUser USER_LDAP_NODB = MockLdapServer.LDAP_USER2;

    public static final NewUser USER_NOLDAP_DB = new NewUser("user", "userpass", "Normal user", false);
    public static final NewUser USER_NOLDAP_NODB = new NewUser("unknownUser", "userpass123", "Unknown user", false);

    public static final LdapUser USER1 = convertToLdapUser(MockLdapServer.LDAP_USER1);
    public static final LdapUser USER2 = convertToLdapUser(MockLdapServer.LDAP_USER2);
    public static final LdapUser USER3 = convertToLdapUser(MockLdapServer.LDAP_USER3);

    @Rule
    public CockpitLdapApplicationRule appLdap = new CockpitLdapApplicationRule();

    protected Response login(@Nullable String username, @Nullable String password) {
        assert username != null && password != null;
        return this.login(new Authentication(username, password));
    }

    protected Response login(NewUser user) {
        assert user.password != null;
        return this.login(new Authentication(user.username, user.password));
    }

    protected Response login(Authentication auth) {
        return appLdap.target("/user/session").request().post(Entity.json(auth));
    }

    protected void assertMatches(CurrentUser user, NewUser expected, boolean isAdmin) {
        assertThat(user.id).isEqualTo(expected.username);
        assertThat(user.name).isEqualTo(expected.name);
        assertThat(user.isAdmin).isEqualTo(isAdmin);
        assertThat(user.isFromLdap).isEqualTo(true);
    }

    protected void addUser(String username) {
        addUser(new NewUser(username, username, "...", false));
    }

    protected void addUser(NewUser user) {
        final String password = user.password;
        assert password != null && user.name != null;
        appLdap.db().executeInsert(new UsersRecord(user.username, "ldap", user.name, null, user.isAdmin, true));
    }

    protected boolean userIsInDb(String username) {
        return appLdap.db().fetchExists(
                appLdap.db().select().from(USERS).where(USERS.USERNAME.eq(username)));
    }

    protected static LdapUser convertToLdapUser(NewUser usr) {
        assert usr.name != null;
        return new LdapUser(usr.username, usr.name);
    }

    protected <R extends Record, T> Request requestBy(TableField<R, T> field, T id) {
        return new Request(appLdap.db.getDataSource(),
                appLdap.db().selectFrom(field.getTable()).where(field.eq(id)).getSQL(ParamType.INLINED));
    }

    protected Request requestUser(String username) {
        return requestBy(USERS.USERNAME, username);
    }

    protected RequestRowAssert assertThatDbUser(String username) {
        return assertThat(requestUser(username)).hasNumberOfRows(1).row();
    }

    protected boolean isUserPasswordWhenEncoded(String username, @Nullable String plainPw) {
        assertThat(plainPw).isNotNull();
        // TODO see https://github.com/joel-costigliola/assertj-db/issues/24
        String dbPw = appLdap.db().selectFrom(USERS).where(USERS.USERNAME.eq(username)).fetchOne(USERS.PASSWORD);
        return CockpitAuthenticator.passwordEncoder.matches(plainPw, dbPw);
    }
}
