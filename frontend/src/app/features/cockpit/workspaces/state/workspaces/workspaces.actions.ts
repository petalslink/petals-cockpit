/**
 * Copyright (C) 2017-2020 Linagora
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
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
} from '@shared/services/workspaces.service';

export namespace Workspaces {
  export const CleanType = '[Workspaces] Clean';
  export class Clean implements Action {
    readonly type = CleanType;
    constructor() {}
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

  export const CreateType = '[Workspaces] Create';
  export class Create implements Action {
    readonly type = CreateType;
    constructor(
      public readonly payload: { name: string; shortDescription: string }
    ) {}
  }

  export const CreateErrorType = '[Workspaces] Create error';
  export class CreateError implements Action {
    readonly type = CreateErrorType;
    constructor(public readonly payload: { createWksError: string }) {}
  }

  export const CreateSuccessType = '[Workspaces] Create success';
  export class CreateSuccess implements Action {
    readonly type = CreateSuccessType;
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

  export const SetDescriptionsType = '[Workspaces] Set descriptions';
  export class SetDescriptions implements Action {
    readonly type = SetDescriptionsType;
    constructor(
      public readonly payload: {
        id: string;
        shortDescription: string;
        description: string;
      }
    ) {}
  }

  export const SetDescriptionsErrorType = '[Workspaces] Set descriptions error';
  export class SetDescriptionsError implements Action {
    readonly type = SetDescriptionsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const SetDescriptionsSuccessType =
    '[Workspaces] Set descriptions success';
  export class SetDescriptionsSuccess implements Action {
    readonly type = SetDescriptionsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        shortDescription: string;
        description: string;
      }
    ) {}
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

  /**
   * Note: while Delete concerns the HTTP action of deleting a workspace,
   * Deleted concerns the event coming from the SSE that a workspace has been deleted.
   */
  export const DeletedType = '[Workspaces] Deleted';
  export class Deleted implements Action {
    readonly type = DeletedType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const SetPetalsSearchType = '[Workspaces] Set petals search';
  export class SetPetalsSearch implements Action {
    readonly type = SetPetalsSearchType;
    constructor(public readonly payload: { search: string }) {}
  }

  export const SetServicesSearchType = '[Workspaces] Set services search';
  export class SetServicesSearch implements Action {
    readonly type = SetServicesSearchType;
    constructor(public readonly payload: { search: string }) {}
  }

  export const AddUserType = '[Workspaces] Add user';
  export class AddUser implements Action {
    readonly type = AddUserType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const AddUserErrorType = '[Workspaces] Add user error';
  export class AddUserError implements Action {
    readonly type = AddUserErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const AddUserSuccessType = '[Workspaces] Add user success';
  export class AddUserSuccess implements Action {
    readonly type = AddUserSuccessType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteUserType = '[Workspaces] Delete user';
  export class DeleteUser implements Action {
    readonly type = DeleteUserType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteUserErrorType = '[Workspaces] Delete user error';
  export class DeleteUserError implements Action {
    readonly type = DeleteUserErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const DeleteUserSuccessType = '[Workspaces] Delete user success';
  export class DeleteUserSuccess implements Action {
    readonly type = DeleteUserSuccessType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const RefreshServicesType = '[Workspaces] Refresh services';
  export class RefreshServices implements Action {
    readonly type = RefreshServicesType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const RefreshServicesErrorType = '[Workspaces] Refresh services error';
  export class RefreshServicesError implements Action {
    readonly type = RefreshServicesErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const RefreshServicesSuccessType =
    '[Workspaces] Refresh services success';
  export class RefreshServicesSuccess implements Action {
    readonly type = RefreshServicesSuccessType;
    constructor(public readonly payload: { id: string }) {}
  }
}
