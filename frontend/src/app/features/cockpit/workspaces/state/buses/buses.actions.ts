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
  IBusBackendDetails,
  IBusBackendSSE,
} from '@shared/services/buses.service';

export namespace Buses {
  export const FetchedType = '[Buses] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IBusBackendSSE>) {}
  }

  export const AddedType = '[Buses] Added';
  export class Added implements Action {
    readonly type = AddedType;
    constructor(public readonly payload: JsTable<IBusBackendSSE>) {}
  }

  export const SetCurrentType = '[Buses] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsType = '[Buses] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType = '[Buses] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType = '[Buses] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        data: IBusBackendDetails;
      }
    ) {}
  }

  export const FoldType = '[Buses] Fold';
  export class Fold implements Action {
    readonly type = FoldType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const UnfoldType = '[Buses] Unfold';
  export class Unfold implements Action {
    readonly type = UnfoldType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const ToggleFoldType = '[Buses] Toggle fold';
  export class ToggleFold implements Action {
    readonly type = ToggleFoldType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const CancelSelectType = '[Buses] Cancel select';
  export class CancelSelect implements Action {
    readonly type = CancelSelectType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const ToggleSelectType = '[Buses] Toggle select';
  export class ToggleSelect implements Action {
    readonly type = ToggleSelectType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DetachType = '[Buses] Detach';
  export class Detach implements Action {
    readonly type = DetachType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DetachErrorType = '[Buses] Detach error';
  export class DetachError implements Action {
    readonly type = DetachErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DetachSuccessType = '[Buses] Detach success';
  export class DetachSuccess implements Action {
    readonly type = DetachSuccessType;
    constructor(public readonly payload: { id: string }) {}
  }

  /**
   * Note: while Detach concerns the HTTP action of detaching a bus,
   * Detached concerns the event coming from the SSE that a bus has been detached.
   */
  export const DetachedType = '[Buses] Detached';
  export class Detached implements Action {
    readonly type = DetachedType;
    constructor(public readonly payload: { id: string }) {}
  }
}
