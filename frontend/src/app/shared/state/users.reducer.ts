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

import { Action } from '@ngrx/store';

import { usersState } from './users.initial-state';
import { IUsersTable } from '../interfaces/users.interface';

export class Users {
  private static reducerName = 'USERS_REDUCER';

  public static reducer(users = usersState(), {type, payload}: Action) {
    if (!Users.mapActionsToMethod[type]) {
      return users;
    }

    return Users.mapActionsToMethod[type](users, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_USERS_SUCCESS = `${Users.reducerName}_FETCH_USERS_SUCCESS`;
  private static fetchUsersSuccess(users: IUsersTable, payload) {
    return {
      ...users,
      byId: {
        ...users.byId,
        ...payload.byId
      },
      allIds: [...Array.from(new Set([...users.allIds, ...payload.allIds]))]
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CONNECT_USER = `${Users.reducerName}_CONNECT_USER`;
  private static connectUser(users: IUsersTable, _payload) {
    return {
      ...users,
      ...<IUsersTable>{ isConnecting: true }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CONNECT_USER_SUCCESS = `${Users.reducerName}_CONNECT_USER_SUCCESS`;
  private static connectUserSuccess(users: IUsersTable, payload) {
    const id = payload.user.id;

    return {
      ...users,
      ...{
        isConnecting: false,
        isConnected: true,
        connectionFailed: false,
        connectedUserId: id,
        isDisconnecting: false,

        byId: {
          ...users.byId,
          [id]: {
            ...users.byId[id],
            ...payload.user
          }
        },
        allIds: [...Array.from(new Set([...users.allIds, id]))]
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CONNECT_USER_FAILED = `${Users.reducerName}_CONNECT_USER_FAILED`;
  private static connectUserFailed(users: IUsersTable, _payload) {
    return {
      ...users,
      ...<IUsersTable>{
        isConnecting: false,
        connectionFailed: true,
        isConnected: false,
        connectedUserId: ''
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DISCONNECT_USER = `${Users.reducerName}_DISCONNECT_USER`;
  private static disconnectUser(users: IUsersTable, _payload) {
    return {
      ...users,
      ...<IUsersTable>{ isDisconnecting: true }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DISCONNECT_USER_SUCCESS = `${Users.reducerName}_DISCONNECT_USER_SUCCESS`;
  private static disconnectUserSuccess(users: IUsersTable, _payload) {
    return {
      ...users,
      ...usersState(),
      ...<IUsersTable>{
        isDisconnecting: false,
        isConnected: false,
        connectedUserId: ''
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DISCONNECT_USER_FAILED = `${Users.reducerName}_DISCONNECT_USER_FAILED`;
  private static disconnectUserFailed(users: IUsersTable, _payload) {
    return {
      ...users,
      ...<IUsersTable>{
        isDisconnecting: false
      }
    };
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Users.FETCH_USERS_SUCCESS]: Users.fetchUsersSuccess,
    [Users.CONNECT_USER]: Users.connectUser,
    [Users.CONNECT_USER_SUCCESS]: Users.connectUserSuccess,
    [Users.CONNECT_USER_FAILED]: Users.connectUserFailed,
    [Users.DISCONNECT_USER]: Users.disconnectUser,
    [Users.DISCONNECT_USER_SUCCESS]: Users.disconnectUserSuccess,
    [Users.DISCONNECT_USER_FAILED]: Users.disconnectUserFailed
  };
}
