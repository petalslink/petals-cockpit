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

import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO.DbWorkspace;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinComponent;
import org.ow2.petals.cockpit.server.resources.ContainerResource.MinServiceUnit;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.BusTree;
import org.ow2.petals.cockpit.server.resources.WorkspaceTree.InvalidPetalsBus;
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

    @SqlQuery("select * from buses where id = :bId")
    @Mapper(DbBus.Mapper.class)
    public abstract DbBus getBusById(@Bind("bId") long bId);

    @SqlUpdate("update buses set name = :n, imported = true where id = :id")
    public abstract void updateBus(@Bind("id") long bId, @Bind("n") String name);

    @SqlUpdate("update buses set import_error = :e where id = :id")
    public abstract int saveError(@Bind("id") long bId, @Bind("e") String message);

    @SqlUpdate("insert into containers (bus_id,name,ip,port,username,password)" + " values (:bId,:n,:i,:p,:u,:pw)")
    @GetGeneratedKeys
    public abstract long createContainer(@Bind("n") String name, @Bind("i") String ip, @Bind("p") int port,
            @Bind("u") String username, @Bind("pw") String password, @Bind("bId") long bId);

    @SqlQuery("select * from containers where bus_id = :b.id")
    @Mapper(DbContainer.Mapper.class)
    public abstract List<DbContainer> getContainersByBus(@BindBean("b") DbBus b);

    @SqlQuery("select * from containers where id = :cId")
    @Mapper(DbContainer.Mapper.class)
    public abstract DbContainer getContainerById(@Bind("cId") long cId);

    @SqlUpdate("insert into components (container_id,name,state,type)" + " values (:cId,:n,:s,:t)")
    @GetGeneratedKeys
    public abstract long createComponent(@Bind("n") String name, @Bind("s") MinComponent.State state,
            @Bind("t") MinComponent.Type type, @Bind("cId") long cId);

    @SqlQuery("select * from components where container_id = :c.id")
    @Mapper(DbComponent.Mapper.class)
    public abstract List<DbComponent> getComponentsByContainer(@BindBean("c") DbContainer c);

    @SqlUpdate("insert into serviceunits (component_id,name,state,sa_name)" + " values (:cId,:n,:s,:sa)")
    @GetGeneratedKeys
    public abstract long createServiceUnit(@Bind("n") String name, @Bind("s") MinServiceUnit.State state,
            @Bind("cId") long cId, @Bind("sa") String saName);

    @SqlQuery("select * from serviceunits where component_id = :c.id")
    @Mapper(DbServiceUnit.Mapper.class)
    public abstract List<DbServiceUnit> getServiceUnitByComponent(@BindBean("c") DbComponent c);

    @SqlUpdate("update serviceunits set state = :s where id = :suId")
    public abstract int updateServiceUnitState(@Bind("suId") long su, @Bind("s") MinServiceUnit.State state);

    @Transaction
    public BusTree saveImport(long bId, Domain topology) {
        try {
            return WorkspaceTree.buildAndSaveToDatabase(this, bId, topology);
        } catch (InvalidPetalsBus e) {
            // TODO handle that better
            throw new RuntimeException(e);
        }
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

        public long getId() {
            return id;
        }

        public static class Mapper implements ResultSetMapper<DbBus> {

            @Override
            public DbBus map(int index, ResultSet r, StatementContext ctx) throws SQLException {
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

        public long getId() {
            return id;
        }

        public static class Mapper implements ResultSetMapper<DbContainer> {

            @Override
            public DbContainer map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbContainer(r.getLong("id"), r.getString("name"), r.getString("ip"), r.getInt("port"),
                        r.getString("username"), r.getString("password"));

            }
        }
    }

    public static class DbComponent {

        public final long id;

        public final String name;

        public final MinComponent.State state;

        public final MinComponent.Type type;

        public DbComponent(long id, String name, MinComponent.State state, MinComponent.Type type) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.type = type;
        }

        public long getId() {
            return id;
        }

        public static class Mapper implements ResultSetMapper<DbComponent> {

            @Override
            public DbComponent map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbComponent(r.getLong("id"), r.getString("name"),
                        MinComponent.State.valueOf(r.getString("state")),
                        MinComponent.Type.valueOf(r.getString("type")));

            }
        }
    }

    public static class DbServiceUnit {

        public final long id;

        public final String name;

        public final MinServiceUnit.State state;

        public final String saName;

        public DbServiceUnit(long id, String name, MinServiceUnit.State state, String saName) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.saName = saName;
        }

        public static class Mapper implements ResultSetMapper<DbServiceUnit> {

            @Override
            public DbServiceUnit map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbServiceUnit(r.getLong("id"), r.getString("name"),
                        MinServiceUnit.State.valueOf(r.getString("state")), r.getString("sa_name"));

            }
        }
    }
}
