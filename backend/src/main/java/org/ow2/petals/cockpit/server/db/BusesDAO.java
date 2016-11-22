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
import java.util.List;

import org.eclipse.jdt.annotation.Nullable;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.Transaction;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

public abstract class BusesDAO {

    @SqlUpdate("insert into buses (workspace_id,import_ip,import_port,import_username,import_password,import_passphrase)"
            + " values (:w,:i,:p,:u,:pw,:pp)")
    @GetGeneratedKeys
    public abstract long createBus(@Bind("i") String ip, @Bind("p") int port, @Bind("u") String username,
            @Bind("pw") String password, @Bind("pp") String passphrase, @Bind("w") long wId);

    @SqlQuery("select * from buses where workspace_id = :w.id")
    @Mapper(DbBus.Mapper.class)
    public abstract List<DbBus> getBusesByWorkspace(@BindBean("w") DbWorkspace w);

    @SqlUpdate("update buses set name = :n, imported = true where id = :id")
    public abstract void updateBus(@Bind("id") long bId, @Bind("n") String name);

    @SqlUpdate("update buses set import_error = :e where id = :id")
    public abstract void saveError(@Bind("id") long bId, @Bind("e") String message);

    @SqlUpdate("insert into containers (bus_id,name,ip,port,username,password)" + " values (:bId,:n,:i,:p,:u,:pw)")
    @GetGeneratedKeys
    public abstract long createContainer(@Bind("n") String name, @Bind("i") String ip, @Bind("p") int port,
            @Bind("u") String username, @Bind("pw") String password, @Bind("bId") long bId);

    @SqlQuery("select * from containers where bus_id = :bId")
    @Mapper(DbContainer.Mapper.class)
    public abstract List<DbContainer> getContainersByBus(@Bind("bId") long bId);

    @SqlUpdate("insert into components (container_id,name,state)" + " values (:cId,:n,:s)")
    @GetGeneratedKeys
    public abstract long createComponent(@Bind("n") String name, @Bind("s") String state, @Bind("cId") long cId);

    @SqlQuery("select * from components where container_id = :cId")
    @Mapper(DbComponent.Mapper.class)
    public abstract List<DbComponent> getComponentsByContainer(@Bind("cId") long cId);

    @SqlUpdate("insert into serviceunits (component_id,name,state)" + " values (:cId,:n,:s)")
    @GetGeneratedKeys
    public abstract long createServiceUnit(@Bind("n") String name, @Bind("s") String state, @Bind("cId") long cId);

    @SqlQuery("select * from serviceunits where component_id = :cId")
    @Mapper(DbServiceUnit.Mapper.class)
    public abstract List<DbServiceUnit> getServiceUnitByComponent(@Bind("cId") long cId);

    @Transaction
    public BusTree saveImport(long bId, Domain topology) {
        return WorkspaceTree.buildAndSaveToDatabase(this, bId, topology);
    }

    @SqlUpdate("delete from buses where id = :id")
    public abstract int delete(@Bind("id") long bId);

    public abstract static class DbBus {

        public final long id;

        public final String importIp;

        public final int importPort;

        public final String importUsername;

        public final String importPassword;

        public final String importPassphrase;

        public DbBus(long id, String importIp, int importPort, String importUsername, String importPassword,
                String importPassphrase) {
            this.id = id;
            this.importIp = importIp;
            this.importPort = importPort;
            this.importUsername = importUsername;
            this.importPassword = importPassword;
            this.importPassphrase = importPassphrase;
        }

        public static class Mapper implements ResultSetMapper<DbBus> {

            @Override
            public DbBus map(int index, @Nullable ResultSet r, @Nullable StatementContext ctx) throws SQLException {
                assert r != null;

                if (r.getBoolean("imported")) {
                    return new DbBusImported(r.getLong("id"), r.getString("import_ip"), r.getInt("import_port"),
                            r.getString("import_username"), r.getString("import_password"),
                            r.getString("import_passphrase"), r.getString("name"));
                } else {
                    String error = r.getString("import_error");
                    if (error != null) {
                        return new DbBusInError(r.getLong("id"), r.getString("import_ip"), r.getInt("import_port"),
                                r.getString("import_username"), r.getString("import_password"),
                                r.getString("import_passphrase"), error);
                    } else {
                        return new DbBusInImport(r.getLong("id"), r.getString("import_ip"), r.getInt("import_port"),
                                r.getString("import_username"), r.getString("import_password"),
                                r.getString("import_passphrase"));
                    }
                }

            }
        }
    }

    public static class DbBusInImport extends DbBus {
        public DbBusInImport(long id, String importIp, int importPort, String importUsername, String importPassword,
                String importPassphrase) {
            super(id, importIp, importPort, importUsername, importPassword, importPassphrase);
        }
    }

    public static class DbBusInError extends DbBus {

        public final String error;

        public DbBusInError(long id, String importIp, int importPort, String importUsername, String importPassword,
                String importPassphrase, String error) {
            super(id, importIp, importPort, importUsername, importPassword, importPassphrase);
            this.error = error;
        }
    }

    public static class DbBusImported extends DbBus {

        public final String name;

        public DbBusImported(long id, String importIp, int importPort, String importUsername, String importPassword,
                String importPassphrase, String name) {
            super(id, importIp, importPort, importUsername, importPassword, importPassphrase);
            this.name = name;
        }
    }

    public static class DbContainer {

        public final long id;

        public final String name;

        public final String ip;

        public final int port;

        public final String username;

        public final String password;

        public DbContainer(long id, String name, String ip, int port, String username, String password) {
            this.id = id;
            this.name = name;
            this.ip = ip;
            this.port = port;
            this.username = username;
            this.password = password;
        }

        public static class Mapper implements ResultSetMapper<DbContainer> {

            @Override
            public DbContainer map(int index, @Nullable ResultSet r, @Nullable StatementContext ctx)
                    throws SQLException {
                assert r != null;

                return new DbContainer(r.getLong("id"), r.getString("name"), r.getString("ip"), r.getInt("port"),
                        r.getString("username"), r.getString("password"));

            }
        }
    }

    public static class DbComponent {

        public final long id;

        public final String name;

        public final String state;

        public DbComponent(long id, String name, String state) {
            this.id = id;
            this.name = name;
            this.state = state;
        }

        public static class Mapper implements ResultSetMapper<DbComponent> {

            @Override
            public DbComponent map(int index, @Nullable ResultSet r, @Nullable StatementContext ctx)
                    throws SQLException {
                assert r != null;

                return new DbComponent(r.getLong("id"), r.getString("name"), r.getString("state"));

            }
        }
    }

    public static class DbServiceUnit {

        public final long id;

        public final String name;

        public final String state;

        public DbServiceUnit(long id, String name, String state) {
            this.id = id;
            this.name = name;
            this.state = state;
        }

        public static class Mapper implements ResultSetMapper<DbServiceUnit> {

            @Override
            public DbServiceUnit map(int index, @Nullable ResultSet r, @Nullable StatementContext ctx)
                    throws SQLException {
                assert r != null;

                return new DbServiceUnit(r.getLong("id"), r.getString("name"), r.getString("state"));

            }
        }
    }
}
