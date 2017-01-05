/**
 * Copyright (C) 2016-2017 Linagora
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
package org.ow2.petals.cockpit.server.db;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import org.eclipse.jdt.annotation.Nullable;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.Transaction;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

public abstract class UsersDAO {

    @SqlQuery("select * from users where username = :u")
    @Mapper(DbUser.Mapper.class)
    @Nullable
    public abstract DbUser findByUsername(@Bind("u") String username);

    @SqlUpdate("insert into users (username, password, name) values (:u, :p, :n)")
    protected abstract void insert(@Bind("u") String username, @Bind("p") String password, @Bind("n") String name);

    @SqlQuery("select last_workspace from users where username = :u.username")
    @Nullable
    public abstract Long getLastWorkspace(@BindBean("u") DbUser user);

    @SqlUpdate("update users set last_workspace = :wsId where username = :u.username")
    public abstract void saveLastWorkspace(@BindBean("u") DbUser user, @Bind("wsId") long wsId);

    @Transaction
    public Optional<DbUser> create(String username, String password, String name) {
        DbUser user = findByUsername(username);
        if (user != null) {
            return Optional.empty();
        } else {
            insert(username, password, name);
            return Optional.of(new DbUser(username, password, name));
        }
    }

    public static class DbUser {

        public final String username;

        public final String password;

        public final String name;

        public DbUser(String username, String password, String name) {
            this.username = username;
            this.password = password;
            this.name = name;
        }

        public String getUsername() {
            return username;
        }

        public static class Mapper implements ResultSetMapper<DbUser> {
            @Override
            public DbUser map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbUser(r.getString("username"), r.getString("password"), r.getString("name"));
            }
        }
    }
}
