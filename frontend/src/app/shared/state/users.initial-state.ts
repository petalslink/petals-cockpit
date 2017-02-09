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

import { IUsersTable } from '../interfaces/users.interface';

import { environment } from './../../../environments/environment';

export function usersState(): IUsersTable {
  return {
    connectedUserId: '',

    isConnecting: false,
    isConnected: environment.alreadyConnected,
    isDisconnecting: false,
    connectionFailed: false,

    byId: {},
    allIds: []
  };
}
