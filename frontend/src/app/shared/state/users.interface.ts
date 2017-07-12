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
  ICurrentUserBackend,
} from 'app/shared/services/users.service';
import { JsTable, emptyJsTable } from 'app/shared/helpers/jstable.helper';

export interface IUserUI {
  isAdding: boolean;
  isDeleting: boolean;
  isModifying: boolean;
  isDeletingFromWorkspace: boolean;
}

// used within table
export interface IUserRow extends IUserUI, IUserBackend {}

// used in generated views
export interface IUser extends IUserBackend {}

export interface ICurrentUser extends ICurrentUserBackend {}

interface IUsersCommon {
  connectedUser: ICurrentUser;

  isConnecting: boolean;
  isDisconnecting: boolean;
  connectionFailed: boolean;

  isFetchingUsers: boolean;
}

export interface IUsersTable extends IUsersCommon, JsTable<IUserRow> {}

export function userRowFactory(): IUserRow {
  return {
    id: null,
    name: null,
    isAdding: false,
    isDeleting: false,
    isModifying: false,
    isDeletingFromWorkspace: false,
  };
}

export function usersTableFactory(): IUsersTable {
  return {
    ...emptyJsTable<IUserRow>(),
    connectedUser: null,

    isConnecting: false,
    isDisconnecting: false,
    connectionFailed: false,

    isFetchingUsers: false,
  };
}
