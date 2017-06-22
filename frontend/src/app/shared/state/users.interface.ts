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
  IUserBackend,
  IUserBackendCommon,
} from 'app/shared/services/users.service';

export interface IUserUI {}

// used within table
export interface IUserRow extends IUserUI, IUserBackend {}

// used in generated views
export interface IUser extends IUserBackendCommon {}

export interface ICurrentUser extends IUserRow, IUser {}

interface IUsersCommon {
  connectedUserId: string;

  isConnecting: boolean;
  isConnected: boolean;
  isDisconnecting: boolean;
  connectionFailed: boolean;
}

export interface IUsersTableOnly {
  byId: { [key: string]: IUserRow };
  allIds: string[];
}

export interface IUsersTable extends IUsersCommon, IUsersTableOnly {}

export interface IUsers extends IUsersCommon {
  list: IUser[];
}

export function userRowFactory(): IUserRow {
  return {
    id: null,
    name: null,
    lastWorkspace: undefined,
  };
}

export function usersTableFactory(): IUsersTable {
  return {
    connectedUserId: '',

    isConnecting: false,
    isConnected: false,
    isDisconnecting: false,
    connectionFailed: false,

    byId: {},
    allIds: [],
  };
}
