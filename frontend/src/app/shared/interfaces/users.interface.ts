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

import { IUserRow, IUser } from './user.interface';
import { environment } from 'environments/environment';

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

export interface IUsersTable extends IUsersCommon, IUsersTableOnly { }

export interface IUsers extends IUsersCommon {
  list: IUser[];
}

export function usersTableFactory(): IUsersTable {
  return {
    connectedUserId: '',

    isConnecting: false,
    isConnected: environment.mock ? environment.mock.alreadyConnected : false,
    isDisconnecting: false,
    connectionFailed: false,

    byId: {},
    allIds: []
  };
}
