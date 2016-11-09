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
package org.ow2.petals.cockpit.server.db;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUserMapper;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.Transaction;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

@RegisterMapper(DbUserMapper.class)
public abstract class UsersDAO {

    @SqlQuery("select * from users where username = :u")
    @Nullable
    public abstract DbUser findByUsername(@Bind("u") String username);

    @SqlUpdate("insert into users (username, password, name) values (:u, :p, :n)")
    protected abstract void insert(@Bind("u") String username, @Bind("p") String password, @Bind("n") String name);

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

    public static class DbUserMapper implements ResultSetMapper<DbUser> {
        @Override
        public DbUser map(int index, @Nullable ResultSet r, @Nullable StatementContext ctx) throws SQLException {
            assert r != null;
            return new DbUser(r.getString("username"), r.getString("password"), r.getString("name"));
        }
    }

    public static class DbUser {

        private String username;

        private String password;

        private String name;

        public DbUser(String username, String password, String name) {
            this.username = username;
            this.password = password;
            this.name = name;
        }

        public String getUsername() {
            return username;
        }

        public String getPassword() {
            return password;
        }

        public String getName() {
            return name;
        }
    }
}
