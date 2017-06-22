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

import { environment } from 'environments/environment';
import {
  putById,
  updateById,
  mergeInto,
  JsTable,
} from 'app/shared/helpers/jstable.helper';
import {
  IUsersTable,
  usersTableFactory,
  userRowFactory,
  ICurrentUser,
} from 'app/shared/state/users.interface';
import { IUserBackendCommon } from 'app/shared/services/users.service';
import { Users } from 'app/shared/state/users.actions';

export namespace UsersReducer {
  type All =
    | Users.Fetched
    | Users.Connect
    | Users.ConnectError
    | Users.ConnectSuccess
    | Users.Disconnect
    | Users.DisconnectError
    | Users.DisconnectSuccess;

  export function reducer(
    table = {
      ...usersTableFactory(),
      isConnected: environment.mock ? environment.mock.alreadyConnected : false,
    },
    action: All
  ): IUsersTable {
    switch (action.type) {
      case Users.FetchedType: {
        return fetched(table, action.payload);
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
      case Users.DisconnectSuccessType: {
        return usersTableFactory();
      }
      default:
        return table;
    }
  }

  function fetched(
    table: IUsersTable,
    payload: JsTable<IUserBackendCommon>
  ): IUsersTable {
    return mergeInto(table, payload, userRowFactory);
  }

  function connect(table: IUsersTable): IUsersTable {
    return {
      ...table,
      ...<IUsersTable>{ isConnecting: true },
    };
  }

  function connectSuccess(
    table: IUsersTable,
    payload: { user: ICurrentUser }
  ): IUsersTable {
    const id = payload.user.id;

    return {
      ...table.byId[id]
        ? updateById(table, id, payload.user)
        : putById(table, id, payload.user, userRowFactory),
      isConnecting: false,
      isConnected: true,
      connectionFailed: false,
      connectedUserId: id,
      isDisconnecting: false,
    };
  }

  function connectError(table: IUsersTable): IUsersTable {
    return {
      ...table,
      ...<IUsersTable>{
        isConnecting: false,
        connectionFailed: true,
        isConnected: false,
        connectedUserId: '',
      },
    };
  }

  function disconnect(table: IUsersTable): IUsersTable {
    return {
      ...table,
      ...<IUsersTable>{ isDisconnecting: true },
    };
  }

  function disconnectError(table: IUsersTable): IUsersTable {
    return {
      ...table,
      ...<IUsersTable>{
        isDisconnecting: false,
      },
    };
  }
}
