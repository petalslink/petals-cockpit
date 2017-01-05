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
import java.util.List;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.Transaction;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

public abstract class WorkspacesDAO {

    @SqlQuery("select w.*, uw.username as acl from workspaces w"
            + " left join users_workspaces uw on uw.workspace_id = w.id and uw.username = :u"
            + " where w.id = :id")
    @Mapper(DbWorkspace.Mapper.class)
    @Nullable
    public abstract DbWorkspace getWorkspaceById(@Bind("id") long id, @Nullable @Bind("u") String username);

    @SqlQuery("select uw.username from users_workspaces uw where uw.workspace_id = :id")
    public abstract List<String> getWorkspaceUsers(@Bind("id") long id);

    @SqlQuery("select w.*, uw.username as acl from workspaces w" 
            + " inner join users_workspaces uw on w.id = uw.workspace_id"
            + " where uw.username = :u.username")
    @Mapper(DbWorkspace.Mapper.class)
    public abstract List<DbWorkspace> getUserWorkspaces(@BindBean("u") DbUser user);

    @SqlUpdate("insert into workspaces (name) values (:n)")
    @GetGeneratedKeys
    protected abstract long insert(@Bind("n") String name);

    @SqlUpdate("insert into users_workspaces (workspace_id,username) values (:id,:u)")
    protected abstract void addWorkspaceUser(@Bind("id") long workspaceId, @Bind("u") String username);

    @Transaction
    public DbWorkspace create(String name, DbUser by) {
        long id = insert(name);
        addWorkspaceUser(id, by.username);
        return new DbWorkspace(id, name, by.username);
    }

    public static class DbWorkspace {

        public final long id;

        public final String name;

        @Nullable
        public final String acl;

        public DbWorkspace(long id, String name, @Nullable String acl) {
            this.id = id;
            this.name = name;
            this.acl = acl;
        }

        public long getId() {
            return id;
        }

        public static class Mapper implements ResultSetMapper<DbWorkspace> {

            @Override
            public DbWorkspace map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbWorkspace(r.getLong("id"), r.getString("name"), r.getString("acl"));
            }
        }
    }
}
