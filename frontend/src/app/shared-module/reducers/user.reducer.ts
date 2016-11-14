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

// ngrx
import { ActionReducer, Action } from '@ngrx/store';

// our interfaces
import { IUserRecord } from '../interfaces/user.interface';

// our states
import { userRecordFactory } from './user.state';

// our actions
import { UserActions } from './user.actions';

function createUserReducer (userR: IUserRecord = userRecordFactory(), action: Action) {
  switch (action.type) {
    case UserActions.USR_IS_CONNECTING:
      return userR
        .merge({
          isConnecting: true,
          isConnected: false,
          isDisconnecting: false,
          connectionFailed: false
        });

    case UserActions.USR_IS_CONNECTED:
      return userR
        .merge({
          name: action.payload.name,
          username: action.payload.username,
          isConnected: true,
          isConnecting: false,
          isDisconnecting: false,
          connectionFailed: false
        });

    case UserActions.USR_IS_DISCONNECTING:
      return userR
        .merge({
          isDisconnecting: true,
          isConnecting: false,
          isConnected: true,
          connectionFailed: false
        });

    case UserActions.USR_IS_DISCONNECTED:
      return userRecordFactory();

    case UserActions.USR_CONNECTION_FAILED:
      return userR
        .merge({
          connectionFailed: true,
          isDisconnecting: false,
          isConnecting: false,
          isConnected: false
        });

    case UserActions.USR_DISCONNECTION_FAILED:
      return userR
        .merge({
          connectionFailed: false,
          isDisconnecting: false,
          isConnecting: false,
          isConnected: true
        });

    default:
      return userR;
  }
};

export const UserReducer: ActionReducer<IUserRecord> = createUserReducer;
