/**
 * Copyright (C) 2017-2018 Linagora
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

import { JsTable } from '@shared/helpers/jstable.helper';
import {
  ISharedLibraryBackendDetails,
  ISharedLibraryBackendSSE,
  SharedLibraryState,
} from '@shared/services/shared-libraries.service';
import { ISharedLibraryRow } from '@wks/state/shared-libraries/shared-libraries.interface';

export namespace SharedLibraries {
  export const FetchedType = '[Shared libraries] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<ISharedLibraryBackendSSE>) {}
  }

  export const AddedType = '[Shared libraries] Added';
  export class Added implements Action {
    readonly type = AddedType;
    constructor(public readonly payload: JsTable<ISharedLibraryBackendSSE>) {}
  }

  export const SetCurrentType = '[Shared libraries] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsType = '[Shared libraries] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType = '[Shared libraries] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType =
    '[Shared libraries] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        data: ISharedLibraryBackendDetails;
      }
    ) {}
  }

  export const ChangeStateType = '[Shared libraries] Change state';
  export class ChangeState implements Action {
    readonly type = ChangeStateType;
    constructor(
      public readonly payload: { id: string; state: SharedLibraryState }
    ) {}
  }

  export const ChangeStateErrorType = '[Shared libraries] Change state error';
  export class ChangeStateError implements Action {
    readonly type = ChangeStateErrorType;
    constructor(
      public readonly payload: { id: string; errorChangeState: string }
    ) {}
  }

  export const RemovedType = '[Shared libraries] Removed';
  export class Removed implements Action {
    readonly type = RemovedType;
    constructor(public readonly payload: ISharedLibraryRow) {}
  }
}
