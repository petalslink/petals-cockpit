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

import { IBusRow } from 'app/features/cockpit/workspaces/state/buses/buses.interface';
import { JsTable } from 'app/shared/helpers/jstable.helper';
import {
  IBusBackendDetails,
  IBusBackendSSE,
} from 'app/shared/services/buses.service';

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

  export const DeleteType = '[Buses] Delete';
  export class Delete implements Action {
    readonly type = DeleteType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteErrorType = '[Buses] Delete error';
  export class DeleteError implements Action {
    readonly type = DeleteErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  /**
   * Note: while DELETE_BUS concerns the HTTP action of deleting a bus,
   * REMOVE_BUS concerns the event coming from the SSE that a bus has been deleted.
   */
  export const RemovedType = '[Buses] Removed';
  export class Removed implements Action {
    readonly type = RemovedType;
    constructor(public readonly payload: IBusRow) {}
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
}
