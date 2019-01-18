/**
 * Copyright (C) 2017-2019 Linagora
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
  IServiceUnitBackendDetails,
  IServiceUnitBackendSSE,
} from '@shared/services/service-units.service';
import { IServiceUnitRow } from '@wks/state/service-units/service-units.interface';

export namespace ServiceUnits {
  export const FetchedType = '[Service Units] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IServiceUnitBackendSSE>) {}
  }

  export const AddedType = '[Service Units] Added';
  export class Added implements Action {
    readonly type = AddedType;
    constructor(public readonly payload: JsTable<IServiceUnitBackendSSE>) {}
  }

  export const SetCurrentType = '[Service Units] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsType = '[Service Units] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType = '[Service Units] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType =
    '[Service Units] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        data: IServiceUnitBackendDetails;
      }
    ) {}
  }

  export const RemovedType = '[Service Units] Remove';
  export class Removed implements Action {
    readonly type = RemovedType;
    constructor(public readonly payload: IServiceUnitRow) {}
  }
}
