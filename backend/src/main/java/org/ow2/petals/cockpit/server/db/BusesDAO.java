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
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentMin;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceContent.InvalidPetalsBus;
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

    @SqlQuery("select b.*, NULL as acl from buses b where b.workspace_id = :wId")
    @Mapper(DbBus.Mapper.class)
    public abstract List<DbBus> getBusesByWorkspace(@Bind("wId") long wId);

    @SqlQuery("select b.*, uw.username as acl from buses b"
            + " left join users_workspaces uw on uw.workspace_id = b.workspace_id and uw.username = :u"
            + " where b.id = :bId and b.imported = true")
    @Mapper(DbBus.MapperImported.class)
    @Nullable
    public abstract DbBusImported getBusById(@Bind("bId") long bId, @Nullable @Bind("u") String username);

    @SqlUpdate("update buses set name = :n, imported = true where id = :id")
    public abstract void updateBus(@Bind("id") long bId, @Bind("n") String name);

    @SqlUpdate("update buses set import_error = :e where id = :id")
    public abstract int saveError(@Bind("id") long bId, @Bind("e") String message);

    @SqlUpdate("insert into containers (bus_id,name,ip,port,username,password)" + " values (:bId,:n,:i,:p,:u,:pw)")
    @GetGeneratedKeys
    public abstract long createContainer(@Bind("n") String name, @Bind("i") String ip, @Bind("p") int port,
            @Bind("u") String username, @Bind("pw") String password, @Bind("bId") long bId);

    @SqlQuery("select c.*, NULL as acl from containers c where c.bus_id = :bId")
    @Mapper(DbContainer.Mapper.class)
    public abstract List<DbContainer> getContainersByBus(@Bind("bId") long bId);

    @SqlQuery("select c.*, uw.username as acl from containers c"
            + " left join buses b on b.id = c.bus_id"
            + " left join users_workspaces uw on uw.workspace_id = b.workspace_id and uw.username = :u"
            + " where c.id = :cId")
    @Mapper(DbContainer.Mapper.class)
    @Nullable
    public abstract DbContainer getContainerById(@Bind("cId") long cId, @Nullable @Bind("u") String username);

    @SqlUpdate("insert into components (container_id,name,state,type)" + " values (:cId,:n,:s,:t)")
    @GetGeneratedKeys
    public abstract long createComponent(@Bind("n") String name, @Bind("s") ComponentMin.State state,
            @Bind("t") ComponentMin.Type type, @Bind("cId") long cId);

    @SqlQuery("select cp.*, uw.username as acl from components cp"
            + " left join containers c on c.id = cp.container_id"
            + " left join buses b on b.id = c.bus_id"
            + " left join users_workspaces uw on uw.workspace_id = b.workspace_id and uw.username = :u"
            + " where cp.id = :compId")
    @Mapper(DbComponent.Mapper.class)
    @Nullable
    public abstract DbComponent getComponentsById(@Bind("compId") long compId, @Nullable @Bind("u") String username);

    @SqlQuery("select cp.*, NULL as acl from components cp where cp.container_id = :c.id")
    @Mapper(DbComponent.Mapper.class)
    public abstract List<DbComponent> getComponentsByContainer(@BindBean("c") DbContainer c);

    @SqlUpdate("insert into serviceunits (component_id,name,state,sa_name)" + " values (:cId,:n,:s,:sa)")
    @GetGeneratedKeys
    public abstract long createServiceUnit(@Bind("n") String name, @Bind("s") ServiceUnitMin.State state,
            @Bind("cId") long cId, @Bind("sa") String saName);

    @SqlQuery("select su.*, cp.container_id, uw.username as acl from serviceunits su"
            + " left join components cp on cp.id = su.component_id "
            + " left join containers c on c.id = cp.container_id"
            + " left join buses b on b.id = c.bus_id"
            + " left join users_workspaces uw on uw.workspace_id = b.workspace_id and uw.username = :u"
            + " where su.id = :suId")
    @Mapper(DbServiceUnit.Mapper.class)
    @Nullable
    public abstract DbServiceUnit getServiceUnitById(@Bind("suId") long suId, @Nullable @Bind("u") String username);

    @SqlQuery("select su.*, cp.container_id, NULL as acl from serviceunits su"
            + " left join components cp on cp.id = su.component_id"
            + " where su.component_id = :c.id")
    @Mapper(DbServiceUnit.Mapper.class)
    public abstract List<DbServiceUnit> getServiceUnitByComponent(@BindBean("c") DbComponent c);

    @SqlUpdate("update serviceunits set state = :s where id = :suId")
    public abstract int updateServiceUnitState(@Bind("suId") long su, @Bind("s") ServiceUnitMin.State state);

    @SqlUpdate("delete from serviceunits where id = :id")
    public abstract int removeServiceUnit(@Bind("id") long id);

    @Transaction
    public WorkspaceContent saveImport(long bId, Domain topology) {
        try {
            return WorkspaceContent.buildAndSaveToDatabase(this, bId, topology);
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

            private final MapperImported m = new MapperImported();

            @Override
            public DbBus map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                if (r.getBoolean("imported")) {
                    return m.map(index, r, ctx);
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

        public static class MapperImported implements ResultSetMapper<DbBusImported> {
            @Override
            public DbBusImported map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbBusImported(r.getLong("id"), r.getString("import_ip"), r.getInt("import_port"),
                        r.getString("import_username"), r.getString("import_password"),
                        r.getString("import_passphrase"), r.getString("name"), r.getString("acl"));
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

        @Nullable
        public final String acl;

        public DbBusImported(long id, String importIp, int importPort, String importUsername, String importPassword,
                String importPassphrase, String name, @Nullable String acl) {
            super(id, importIp, importPort, importUsername, importPassword, importPassphrase);
            this.name = name;
            this.acl = acl;
        }
    }

    public static class DbContainer {

        public final long id;

        public final long busId;

        public final String name;

        public final String ip;

        public final int port;

        public final String username;

        public final String password;

        @Nullable
        public final String acl;

        public DbContainer(long id, long busId, String name, String ip, int port, String username, String password,
                @Nullable String acl) {
            this.id = id;
            this.busId = busId;
            this.name = name;
            this.ip = ip;
            this.port = port;
            this.username = username;
            this.password = password;
            this.acl = acl;
        }

        public long getId() {
            return id;
        }

        public static class Mapper implements ResultSetMapper<DbContainer> {

            @Override
            public DbContainer map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbContainer(r.getLong("id"), r.getLong("bus_id"), r.getString("name"), r.getString("ip"),
                        r.getInt("port"), r.getString("username"), r.getString("password"), r.getString("acl"));

            }
        }
    }

    public static class DbComponent {

        public final long id;

        public final String name;

        public final ComponentMin.State state;

        public final ComponentMin.Type type;

        @Nullable
        public final String acl;

        public DbComponent(long id, String name, ComponentMin.State state, ComponentMin.Type type,
                @Nullable String acl) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.type = type;
            this.acl = acl;
        }

        public long getId() {
            return id;
        }

        public static class Mapper implements ResultSetMapper<DbComponent> {

            @Override
            public DbComponent map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbComponent(r.getLong("id"), r.getString("name"),
                        ComponentMin.State.valueOf(r.getString("state")),
                        ComponentMin.Type.valueOf(r.getString("type")), r.getString("acl"));

            }
        }
    }

    public static class DbServiceUnit {

        public final long id;

        public final String name;

        public final ServiceUnitMin.State state;

        public final String saName;

        public final long containerId;

        @Nullable
        public final String acl;

        public DbServiceUnit(long id, String name, ServiceUnitMin.State state, String saName, long containerId,
                @Nullable String acl) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.saName = saName;
            this.containerId = containerId;
            this.acl = acl;
        }

        public static class Mapper implements ResultSetMapper<DbServiceUnit> {

            @Override
            public DbServiceUnit map(int index, ResultSet r, StatementContext ctx) throws SQLException {
                return new DbServiceUnit(r.getLong("id"), r.getString("name"),
                        ServiceUnitMin.State.valueOf(r.getString("state")), r.getString("sa_name"),
                        r.getLong("container_id"), r.getString("acl"));

            }
        }
    }
}
