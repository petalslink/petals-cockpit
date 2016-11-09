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
import { userFactory } from './user.state';

// actions
export const USR_IS_CONNECTING = 'USR_IS_CONNECTING';
export const USR_IS_CONNECTED = 'USR_IS_CONNECTED';
export const USR_IS_DISCONNECTING = 'USR_IS_DISCONNECTING';
export const USR_IS_DISCONNECTED = 'USR_IS_DISCONNECTED';
export const USR_CONNECTION_FAILED = 'USR_CONNECTION_FAILED';
export const USR_DISCONNECTION_FAILED = 'USR_DISCONNECTION_FAILED';

function createUserReducer (userR: IUserRecord = userFactory(), action: Action) {
  switch (action.type) {
    case USR_IS_CONNECTING:
      return userR
              .setIn(['isConnecting'], true)
              .setIn(['isConnected'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['connectionFailed'], false);

    case USR_IS_CONNECTED:
      return userR
              .setIn(['name'], action.payload.name)
              .setIn(['username'], action.payload.username)
              .setIn(['isConnected'], true)
              .setIn(['isConnecting'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['connectionFailed'], false);

    case USR_IS_DISCONNECTING:
      return userR
              .setIn(['isDisconnecting'], true)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], true)
              .setIn(['connectionFailed'], false);

    case USR_IS_DISCONNECTED:
      return userFactory();

    case USR_CONNECTION_FAILED:
      return userR
              .setIn(['connectionFailed'], true)
              .setIn(['isDisconnecting'], false)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], false);

    case USR_DISCONNECTION_FAILED:
      return userR
              .setIn(['connectionFailed'], false)
              .setIn(['isDisconnecting'], false)
              .setIn(['isConnecting'], false)
              .setIn(['isConnected'], true);

    default:
      return userR;
  }
};

export const UserReducer: ActionReducer<IUserRecord> = createUserReducer;
