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
import { JsTable } from 'app/shared/helpers/jstable.helper';

import {
  IUserLogin,
  IUserBackend,
  ICurrentUserBackend,
} from 'app/shared/services/users.service';

export namespace Users {
  export const FetchedType = '[Users] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IUserBackend>) {}
  }

  export const ConnectType = '[Users] Connect';
  export class Connect implements Action {
    readonly type = ConnectType;
    constructor(
      public readonly payload: { user: IUserLogin; previousUrl: string }
    ) {}
  }

  export const ConnectErrorType = '[Users] Connect error';
  export class ConnectError implements Action {
    readonly type = ConnectErrorType;
    constructor() {}
  }

  export const ConnectSuccessType = '[Users] Connect success';
  export class ConnectSuccess implements Action {
    readonly type = ConnectSuccessType;
    constructor(
      public readonly payload: {
        user: ICurrentUserBackend;
        navigate: boolean;
        previousUrl?: string;
      }
    ) {}
  }

  export const DisconnectType = '[Users] Disconnect';
  export class Disconnect implements Action {
    readonly type = DisconnectType;
    constructor() {}
  }

  export const DisconnectErrorType = '[Users] Disconnect error';
  export class DisconnectError implements Action {
    readonly type = DisconnectErrorType;
    constructor() {}
  }

  export const DisconnectSuccessType = '[Users] Disconnect success';
  export class DisconnectSuccess implements Action {
    readonly type = DisconnectSuccessType;
    readonly payload: never;
    constructor() {}
  }
}
