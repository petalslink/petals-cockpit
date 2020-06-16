/**
 * Copyright (C) 2017-2020 Linagora
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

import { Workspaces } from '@feat/cockpit/workspaces/state/workspaces/workspaces.actions';
import {
  JsTable,
  mergeInto,
  putById,
  removeById,
  updateById,
} from '@shared/helpers/jstable.helper';
import {
  ICurrentUserBackend,
  IUserBackend,
  IUserNew,
  IUserSetup,
} from '@shared/services/users.service';
import { IWorkspaceUserPermissionsBackend } from '@shared/services/workspaces.service';
import { Users } from './users.actions';
import {
  IUserLDAP,
  IUserRow,
  IUsersTable,
  userRowFactory,
  usersTableFactory,
} from './users.interface';

export namespace UsersReducer {
  type All =
    | Users.FetchAll
    | Users.FetchAllError
    | Users.Fetched
    | Users.FetchLdapUsers
    | Users.FetchLdapUsersError
    | Users.FetchedLdapUsers
    | Users.CleanLdapUsers
    | Users.Add
    | Users.AddSuccess
    | Users.AddError
    | Users.Delete
    | Users.DeleteSuccess
    | Users.DeleteError
    | Users.Modify
    | Users.ModifySuccess
    | Users.ModifyError
    | Users.Setup
    | Users.SetupError
    | Users.SetupSuccess
    | Users.Connect
    | Users.ConnectError
    | Users.ConnectSuccess
    | Users.Disconnect
    | Users.DisconnectError
    | Users.Disconnected
    | Workspaces.FetchWorkspaceUserPermissionsSuccess;

  export function reducer(
    table = usersTableFactory(),
    action: All
  ): IUsersTable {
    switch (action.type) {
      case Users.FetchAllType: {
        return fetchAll(table);
      }
      case Users.FetchAllErrorType: {
        return fetchAllError(table);
      }
      case Users.FetchedType: {
        return fetched(table, action.payload);
      }
      case Users.FetchLdapUsersType: {
        return fetchLdapUsers(table);
      }
      case Users.FetchLdapUsersErrorType: {
        return fetchLdapUsersError(table);
      }
      case Users.FetchedLdapUsersType: {
        return fetchedLdapUsers(table, action.payload);
      }
      case Users.CleanLdapUsersType: {
        return cleanLdapUsers(table);
      }
      case Users.AddType: {
        return add(table, action.payload);
      }
      case Users.AddSuccessType: {
        return addSuccess(table, action.payload);
      }
      case Users.AddErrorType: {
        return addError(table, action.payload);
      }
      case Users.DeleteType: {
        return deletee(table, action.payload);
      }
      case Users.DeleteSuccessType: {
        return deleteSuccess(table, action.payload);
      }
      case Users.DeleteErrorType: {
        return deleteError(table, action.payload);
      }
      case Users.ModifyType: {
        return modify(table, action.payload);
      }
      case Users.ModifySuccessType: {
        return modifySuccess(table, action.payload);
      }
      case Users.ModifyErrorType: {
        return modifyError(table, action.payload);
      }
      case Users.SetupType: {
        return setup(table);
      }
      case Users.SetupErrorType: {
        return setupError(table, action.payload);
      }
      case Users.SetupSuccessType: {
        return setupSuccess(table, action.payload);
      }
      case Users.ConnectType: {
        return connect(table);
      }
      case Users.ConnectErrorType: {
        return connectError(table);
      }
      case Users.ConnectSuccessType: {
        return connectSuccess(table, action.payload);
      }
      case Users.DisconnectType: {
        return disconnect(table);
      }
      case Users.DisconnectErrorType: {
        return disconnectError(table);
      }
      case Users.DisconnectedType: {
        return usersTableFactory();
      }
      case Workspaces.FetchWorkspaceUserPermissionsSuccessType: {
        return setWorkspacePermissions(table, action.payload);
      }
      default:
        return table;
    }
  }

  function add(table: IUsersTable, payload: IUserNew) {
    return putById(
      table,
      payload.username,
      { id: payload.username, name: payload.name, isAdding: true },
      userRowFactory
    );
  }

  function addSuccess(table: IUsersTable, payload: IUserBackend) {
    return updateById(table, payload.id, { ...payload, isAdding: false });
  }

  function addError(table: IUsersTable, payload: { id: string }) {
    return removeById(table, payload.id);
  }

  function fetchAll(table: IUsersTable): IUsersTable {
    return { ...table, isFetchingUsers: true };
  }

  function fetchAllError(table: IUsersTable): IUsersTable {
    return { ...table, isFetchingUsers: false };
  }

  function fetched(
    table: IUsersTable,
    payload: JsTable<IUserBackend>
  ): IUsersTable {
    return {
      ...mergeInto(table, payload, userRowFactory),
      isFetchingUsers: false,
    };
  }

  function fetchLdapUsers(table: IUsersTable): IUsersTable {
    return { ...table, isFetchingLdapUsers: true };
  }

  function fetchLdapUsersError(table: IUsersTable): IUsersTable {
    return { ...table, isFetchingLdapUsers: false };
  }

  function fetchedLdapUsers(
    table: IUsersTable,
    payload: IUserLDAP[]
  ): IUsersTable {
    return { ...table, ldapSearchList: payload, isFetchingLdapUsers: false };
  }

  function cleanLdapUsers(table: IUsersTable): IUsersTable {
    return { ...table, ldapSearchList: [] };
  }

  function deletee(table: IUsersTable, payload: { id: string }) {
    return updateById(table, payload.id, <IUserRow>{ isDeleting: true });
  }

  function deleteSuccess(table: IUsersTable, payload: { id: string }) {
    return removeById(table, payload.id);
  }

  function deleteError(table: IUsersTable, payload: { id: string }) {
    return updateById(table, payload.id, <IUserRow>{ isDeleting: false });
  }

  function modify(table: IUsersTable, payload: { id: string }) {
    return updateById(table, payload.id, <IUserRow>{ isModifying: true });
  }

  function modifySuccess(
    table: IUsersTable,
    payload: { id: string; changes: Partial<IUserBackend> }
  ): IUsersTable {
    return {
      ...updateById(table, payload.id, {
        ...payload.changes,
        isModifying: false,
      }),
      connectedUser:
        payload.id === table.connectedUser.id
          ? {
              ...table.connectedUser,
              isAdmin: payload.changes.isAdmin,
              name: payload.changes.name,
            }
          : table.connectedUser,
    };
  }

  function modifyError(table: IUsersTable, payload: { id: string }) {
    return updateById(table, payload.id, { isModifying: false });
  }

  function setup(table: IUsersTable) {
    return {
      ...table,
      isSettingUp: true,
    };
  }

  function setupSuccess(
    table: IUsersTable,
    payload: { value: IUserSetup; validSetupUser: string }
  ): IUsersTable {
    return Object.assign({}, table, {
      ...table,
      value: {
        token: payload.value.token,
        id: payload.value.username,
        password: payload.value.password,
        name: payload.value.name,
        isAdmin: payload.value.isAdmin,
      },
      isSettingUp: false,
      validSetupUser: payload.validSetupUser,
    });
  }

  function setupError(
    table: IUsersTable,
    payload: { errorSetupUser: string }
  ): IUsersTable {
    if (table.isSettingUp) {
      return {
        ...table,
        isSettingUp: false,
        errorSetupUser: payload.errorSetupUser,
      };
    } else {
      return table;
    }
  }

  function connect(table: IUsersTable): IUsersTable {
    return {
      ...table,
      isConnecting: true,
    };
  }

  function connectSuccess(
    table: IUsersTable,
    payload: { user: ICurrentUserBackend }
  ): IUsersTable {
    const id = payload.user.id;
    const user = { id, name: payload.user.name };

    return {
      ...(table.byId[id]
        ? updateById(table, id, user)
        : putById(table, id, user, userRowFactory)),
      isConnecting: false,
      connectionFailed: false,
      connectedUser: payload.user,
      isDisconnecting: false,
    };
  }

  function connectError(table: IUsersTable): IUsersTable {
    return {
      ...table,
      isConnecting: false,
      connectionFailed: true,
      connectedUser: null,
    };
  }

  function disconnect(table: IUsersTable): IUsersTable {
    return {
      ...table,
      isDisconnecting: true,
    };
  }

  function disconnectError(table: IUsersTable): IUsersTable {
    return {
      ...table,
      isDisconnecting: false,
    };
  }

  function setWorkspacePermissions(
    table: IUsersTable,
    payload: IWorkspaceUserPermissionsBackend
  ): IUsersTable {
    return {
      ...table,
      connectedUser: {
        ...table.connectedUser,
        workspacePermissions: payload,
      },
    };
  }
}
