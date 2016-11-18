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
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.CreateSqlObject;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.Transaction;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import com.google.common.collect.ImmutableList;

public abstract class WorkspacesDAO {

    @SqlQuery("select * from workspaces where id = :id")
    @Mapper(DbMinimalWorkspace.Mapper.class)
    @Nullable
    protected abstract DbMinimalWorkspace _findById(@Bind("id") long id);

    @SqlQuery("select username from users_workspaces where workspace_id = :id")
    protected abstract List<String> _findWorkspaceUsers(@Bind("id") long id);

    @Nullable
    public DbWorkspace findById(long id) {
        DbMinimalWorkspace w = _findById(id);

        if (w != null) {
            return new DbWorkspace(w.id, w.name, _findWorkspaceUsers(id));
        } else {
            return null;
        }
    }

    @SqlQuery("select * from workspaces w"
            + " inner join users_workspaces uw on w.id = uw.workspace_id"
            + " where uw.username = :u.username")
    @Mapper(DbMinimalWorkspace.Mapper.class)
    protected abstract List<DbMinimalWorkspace> _findUserWorkspaces(@BindBean("u") DbUser user);

    public List<DbWorkspace> getUserWorkspaces(DbUser user) {
        return _findUserWorkspaces(user).stream().map(w -> new DbWorkspace(w.id, w.name, _findWorkspaceUsers(w.id)))
                .collect(Collectors.toList());
    }

    @SqlUpdate("insert into workspaces (name) values (:n)")
    @GetGeneratedKeys
    protected abstract long insert(@Bind("n") String name);

    @SqlUpdate("insert into users_workspaces (workspace_id,username) values (:id,:u)")
    protected abstract void map(@Bind("id") long workspaceId, @Bind("u") String username);

    @Transaction
    public DbWorkspace create(String name, DbUser by) {
        long id = insert(name);
        map(id, by.username);
        return new DbWorkspace(id, name, Arrays.asList(by.username));
    }

    @CreateSqlObject
    protected abstract BusesDAO buses();

    /**
     * TODO should I use transaction here?
     */
    @Transaction
    public WorkspaceTree getWorkspaceTree(DbWorkspace w) {
        return WorkspaceTree.buildFromDatabase(buses(), w);
    }

    public static class DbMinimalWorkspace {

        public final long id;

        public final String name;

        public DbMinimalWorkspace(long id, String name) {
            this.id = id;
            this.name = name;
        }

        public long getId() {
            return id;
        }

        public static class Mapper implements ResultSetMapper<DbMinimalWorkspace> {

            @Override
            public DbMinimalWorkspace map(int index, @Nullable ResultSet r, @Nullable StatementContext ctx)
                    throws SQLException {
                assert r != null;

                return new DbMinimalWorkspace(r.getLong("id"), r.getString("name"));
            }
        }
    }

    public static class DbWorkspace extends DbMinimalWorkspace {

        public final ImmutableList<String> users;

        public DbWorkspace(long id, String name, List<String> users) {
            super(id, name);
            this.users = ImmutableList.copyOf(users);
        }
    }
}
