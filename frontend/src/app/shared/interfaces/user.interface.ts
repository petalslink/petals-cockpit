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

export interface IUserBackendCommon {
  // from server
  id: string;
  name: string;
}

export interface IUserBackend extends IUserBackendCommon {
  // from server (actually only present for current user)
  lastWorkspace: string;
}

// tslint:disable-next-line:no-empty-interface
export interface IUserUI { }

// used within table
// tslint:disable-next-line:no-empty-interface
export interface IUserRow extends IUserUI, IUserBackend { }

// used in generated views
// tslint:disable-next-line:no-empty-interface
export interface IUser extends IUserBackendCommon { }

export interface ICurrentUser extends IUserRow, IUser { }

// used for login
export interface IUserLogin {
  // for UI
  username: string;
  password: string;
}

export interface IUserSetup extends IUserLogin {
  token: string;
  name: string;
}

export function userRowFactory(): IUserRow {
  return {
    id: null,
    name: null,
    lastWorkspace: undefined
  };
}
