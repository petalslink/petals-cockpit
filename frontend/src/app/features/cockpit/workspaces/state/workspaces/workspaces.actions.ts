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
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
} from 'app/shared/services/workspaces.service';

export namespace Workspaces {
  export const CleanType = '[Workspaces] Clean';
  export class Clean implements Action {
    readonly type = CleanType;
    constructor() {}
  }

  export const CloseType = '[Workspaces] Close';
  export class Close implements Action {
    readonly type = CloseType;
    constructor(
      public readonly payload: {
        goToWorkspaces?: boolean;
        deleted?: boolean;
      } = { goToWorkspaces: false, deleted: false }
    ) {}
  }

  export const FetchAllType = '[Workspaces] Fetch all';
  export class FetchAll implements Action {
    readonly type = FetchAllType;
    constructor() {}
  }

  export const FetchAllErrorType = '[Workspaces] Fetch all error';
  export class FetchAllError implements Action {
    readonly type = FetchAllErrorType;
    constructor() {}
  }

  export const FetchAllSuccessType = '[Workspaces] Fetch all success';
  export class FetchAllSuccess implements Action {
    readonly type = FetchAllSuccessType;
    constructor(public readonly payload: JsTable<IWorkspaceBackend>) {}
  }

  export const PostType = '[Workspaces] Post';
  export class Post implements Action {
    readonly type = PostType;
    constructor(public readonly payload: { name: string }) {}
  }

  export const PostErrorType = '[Workspaces] Post error';
  export class PostError implements Action {
    readonly type = PostErrorType;
    constructor() {}
  }

  export const PostSuccessType = '[Workspaces] Post success';
  export class PostSuccess implements Action {
    readonly type = PostSuccessType;
    constructor(public readonly payload: IWorkspaceBackend) {}
  }

  export const FetchType = '[Workspaces] Fetch';
  export class Fetch implements Action {
    readonly type = FetchType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchErrorType = '[Workspaces] Fetch error';
  export class FetchError implements Action {
    readonly type = FetchErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchSuccessType = '[Workspaces] Fetch success';
  export class FetchSuccess implements Action {
    readonly type = FetchSuccessType;
    constructor(public readonly payload: IWorkspaceBackend) {}
  }

  export const FetchDetailsType = '[Workspaces] Fetch details';
  export class FetchDetails implements Action {
    readonly type = FetchDetailsType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsErrorType = '[Workspaces] Fetch details error';
  export class FetchDetailsError implements Action {
    readonly type = FetchDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const FetchDetailsSuccessType = '[Workspaces] Fetch details success';
  export class FetchDetailsSuccess implements Action {
    readonly type = FetchDetailsSuccessType;
    constructor(
      public readonly payload: { id: string; data: IWorkspaceBackendDetails }
    ) {}
  }

  export const SetDescriptionType = '[Workspaces] Set description';
  export class SetDescription implements Action {
    readonly type = SetDescriptionType;
    constructor(public readonly payload: { id: string; description: string }) {}
  }

  export const SetDescriptionErrorType = '[Workspaces] Set description error';
  export class SetDescriptionError implements Action {
    readonly type = SetDescriptionErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const SetDescriptionSuccessType =
    '[Workspaces] Set description success';
  export class SetDescriptionSuccess implements Action {
    readonly type = SetDescriptionSuccessType;
    constructor(public readonly payload: { id: string; description: string }) {}
  }

  export const DeleteType = '[Workspaces] Delete';
  export class Delete implements Action {
    readonly type = DeleteType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteErrorType = '[Workspaces] Delete error';
  export class DeleteError implements Action {
    readonly type = DeleteErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteSuccessType = '[Workspaces] Delete success';
  export class DeleteSuccess implements Action {
    readonly type = DeleteSuccessType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const RemovedType = '[Workspaces] Removed';
  export class Removed implements Action {
    readonly type = RemovedType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const SetSearchType = '[Workspaces] Set search';
  export class SetSearch implements Action {
    readonly type = SetSearchType;
    constructor(public readonly payload: { search: string }) {}
  }
}
