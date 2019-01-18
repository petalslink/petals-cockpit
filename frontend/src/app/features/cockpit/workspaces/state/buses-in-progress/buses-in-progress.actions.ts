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
  IBusImport,
  IBusInProgressBackend,
} from '@shared/services/buses.service';
import { IBusInProgressRow } from '@wks/state/buses-in-progress/buses-in-progress.interface';

export namespace BusesInProgress {
  export const FetchedType = '[Buses In Progress] Fetched';
  export class Fetched implements Action {
    readonly type = FetchedType;
    constructor(public readonly payload: JsTable<IBusInProgressBackend>) {}
  }

  export const AddedType = '[Buses In Progress] Added';
  export class Added implements Action {
    readonly type = AddedType;
    constructor(public readonly payload: IBusInProgressBackend) {}
  }

  export const SetCurrentType = '[Buses In Progress] Set Current';
  export class SetCurrent implements Action {
    readonly type = SetCurrentType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const ResetImportType = '[Buses In Progress] Reset Import';
  export class ResetImport implements Action {
    readonly type = ResetImportType;
    constructor() {}
  }

  export const PostType = '[Buses In Progress] Post';
  export class Post implements Action {
    readonly type = PostType;
    constructor(public readonly payload: IBusImport) {}
  }

  export const PostErrorType = '[Buses In Progress] Post error';
  export class PostError implements Action {
    readonly type = PostErrorType;
    constructor(public readonly payload: { importBusError: string }) {}
  }

  export const PostSuccessType = '[Buses In Progress] Post success';
  export class PostSuccess implements Action {
    readonly type = PostSuccessType;
    constructor(public readonly payload: IBusInProgressBackend) {}
  }

  export const DeleteType = '[Buses In Progress] Delete';
  export class Delete implements Action {
    readonly type = DeleteType;
    constructor(public readonly payload: IBusInProgressRow) {}
  }

  export const DeleteErrorType = '[Buses In Progress] Delete error';
  export class DeleteError implements Action {
    readonly type = DeleteErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  /**
   * Note: while DELETE_BUS concerns the HTTP action of deleting a bus,
   * REMOVE_BUS concerns the event coming from the SSE that a bus has been deleted.
   */
  export const RemovedType = '[Buses In Progress] Removed';
  export class Removed implements Action {
    readonly type = RemovedType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const UpdateErrorType = '[Buses In Progress] Update error';
  export class UpdateError implements Action {
    readonly type = UpdateErrorType;
    constructor(public readonly payload: { id: string; importError: string }) {}
  }
}
