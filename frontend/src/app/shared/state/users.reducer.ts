/**
 * Copyright (C) 2017 Linagora
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

import {
  putById,
  updateById,
  mergeInto,
  JsTable,
  removeById,
} from 'app/shared/helpers/jstable.helper';
import {
  IUsersTable,
  usersTableFactory,
  userRowFactory,
  IUserRow,
} from 'app/shared/state/users.interface';
import {
  IUserBackend,
  ICurrentUserBackend,
  IUserNew,
} from 'app/shared/services/users.service';
import { Users } from 'app/shared/state/users.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';

export namespace UsersReducer {
  type All =
    | Users.FetchAll
    | Users.FetchAllError
    | Users.Fetched
    | Users.Add
    | Users.AddSuccess
    | Users.AddError
    | Users.Delete
    | Users.DeleteSuccess
    | Users.DeleteError
    | Users.Modify
    | Users.ModifySuccess
    | Users.ModifyError
    | Users.Connect
    | Users.ConnectError
    | Users.ConnectSuccess
    | Users.Disconnect
    | Users.DisconnectError
    | Users.Disconnected
    | Workspaces.DeleteUser
    | Workspaces.DeleteUserSuccess
    | Workspaces.DeleteUserError;

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
      case Workspaces.DeleteUserType: {
        return deleteFromWorkspace(table, action.payload);
      }
      case Workspaces.DeleteUserSuccessType:
      case Workspaces.DeleteUserErrorType: {
        return deleteFromWorkspaceFinished(table, action.payload);
      }
      default:
        return table;
    }
  }

  function fetchAll(table: IUsersTable): IUsersTable {
    return {
      ...table,
      isFetchingUsers: true,
    };
  }

  function fetchAllError(table: IUsersTable): IUsersTable {
    return {
      ...table,
      isFetchingUsers: false,
    };
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
  ) {
    return updateById(table, payload.id, {
      ...payload.changes,
      isModifying: false,
    });
  }

  function modifyError(table: IUsersTable, payload: { id: string }) {
    return updateById(table, payload.id, { isModifying: false });
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
      ...table.byId[id]
        ? updateById(table, id, user)
        : putById(table, id, user, userRowFactory),
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

  function deleteFromWorkspace(table: IUsersTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isDeletingFromWorkspace: true,
    });
  }

  function deleteFromWorkspaceFinished(
    table: IUsersTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isDeletingFromWorkspace: false,
    });
  }
}
