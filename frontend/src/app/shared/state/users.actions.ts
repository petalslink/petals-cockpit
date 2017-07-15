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
  IUserNew,
} from 'app/shared/services/users.service';

export namespace Users {
  // User Management

  export const FetchAllType = '[Users] Fetch all';
  export class FetchAll implements Action {
    readonly type = FetchAllType;
    constructor() {}
  }

  export const FetchAllErrorType = '[Users] Fetch all error';
  export class FetchAllError implements Action {
    readonly type = FetchAllErrorType;
    constructor() {}
  }

  export const FetchedType = '[Users] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IUserBackend>) {}
  }

  export const AddType = '[Users] Add';
  export class Add implements Action {
    readonly type = AddType;
    constructor(public readonly payload: IUserNew) {}
  }

  export const AddErrorType = '[Users] Add error';
  export class AddError implements Action {
    readonly type = AddErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const AddSuccessType = '[Users] Add success';
  export class AddSuccess implements Action {
    readonly type = AddSuccessType;
    constructor(public readonly payload: IUserBackend) {}
  }

  export const DeleteType = '[Users] Delete';
  export class Delete implements Action {
    readonly type = DeleteType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteErrorType = '[Users] Delete error';
  export class DeleteError implements Action {
    readonly type = DeleteErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteSuccessType = '[Users] Delete success';
  export class DeleteSuccess implements Action {
    readonly type = DeleteSuccessType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const ModifyType = '[Users] Modify';
  export class Modify implements Action {
    readonly type = ModifyType;
    constructor(
      public readonly payload: {
        id: string;
        changes: { name?: string; password?: string };
      }
    ) {}
  }

  export const ModifyErrorType = '[Users] Modify error';
  export class ModifyError implements Action {
    readonly type = ModifyErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const ModifySuccessType = '[Users] Modify success';
  export class ModifySuccess implements Action {
    readonly type = ModifySuccessType;
    constructor(
      public readonly payload: {
        id: string;
        changes: { name?: string; password?: string };
      }
    ) {}
  }

  // User Session

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
    constructor() {}
  }

  export const DisconnectedType = '[Users] Disconnected';
  export class Disconnected implements Action {
    readonly type = DisconnectedType;
    constructor() {}
  }
}
