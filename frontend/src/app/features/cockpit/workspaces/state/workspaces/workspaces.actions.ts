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

import { IUserBackend } from '@shared/services/users.service';
import {
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
  IWorkspaceUserPermissionsBackend,
} from '@shared/services/workspaces.service';

import { IWorkspaceUserPermissions } from '@feat/cockpit/workspaces/state/workspaces/workspaces.interface';

export namespace Workspaces {
  export const CleanWorkspaceType = '[Workspaces] Clean workspace';
  export class CleanWorkspace implements Action {
    readonly type = CleanWorkspaceType;
    constructor() {}
  }

  export const CleanWorkspacesType = '[Workspaces] Clean workspaces';
  export class CleanWorkspaces implements Action {
    readonly type = CleanWorkspacesType;
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
    constructor(
      public readonly payload: {
        workspaces: { [id: string]: IWorkspaceBackend };
        users: { [id: string]: IUserBackend };
      }
    ) {}
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
    constructor(public readonly payload: IWorkspaceBackendDetails) {}
  }

  export const EditWorkspaceDetailsType = '[Workspaces] Edit workspace details';
  export class EditWorkspaceDetails implements Action {
    readonly type = EditWorkspaceDetailsType;
    constructor(
      public readonly payload: { id: string; isEditDetailsMode: boolean }
    ) {}
  }

  export const UpdateWorkspaceDetailsType =
    '[Workspaces] Update workspace details';
  export class UpdateWorkspaceDetails implements Action {
    readonly type = UpdateWorkspaceDetailsType;
    constructor(
      public readonly payload: {
        id: string;
        name: string;
        shortDescription: string;
        description: string;
      }
    ) {}
  }

  export const UpdateWorkspaceDetailsErrorType =
    '[Workspaces] Update workspace details error';
  export class UpdateWorkspaceDetailsError implements Action {
    readonly type = UpdateWorkspaceDetailsErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const UpdateWorkspaceDetailsSuccessType =
    '[Workspaces] Update workspace details success';
  export class UpdateWorkspaceDetailsSuccess implements Action {
    readonly type = UpdateWorkspaceDetailsSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        name: string;
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

  export const AddWorkspaceUserType = '[Workspaces] Add user';
  export class AddWorkspaceUser implements Action {
    readonly type = AddWorkspaceUserType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const AddWorkspaceUserErrorType = '[Workspaces] Add user error';
  export class AddWorkspaceUserError implements Action {
    readonly type = AddWorkspaceUserErrorType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const AddWorkspaceUserSuccessType = '[Workspaces] Add user success';
  export class AddWorkspaceUserSuccess implements Action {
    readonly type = AddWorkspaceUserSuccessType;
    constructor(
      public readonly payload: {
        id: string;
        permissions: IWorkspaceUserPermissions;
      }
    ) {}
  }

  export const UpdateWorkspaceUserPermissionsType =
    '[Workspaces] Update user permissions';
  export class UpdateWorkspaceUserPermissions implements Action {
    readonly type = UpdateWorkspaceUserPermissionsType;
    constructor(
      public readonly payload: {
        userId: string;
        permissions: IWorkspaceUserPermissions;
      }
    ) {}
  }

  export const UpdateWorkspaceUserPermissionsErrorType =
    '[Workspaces] Update user permissions error';
  export class UpdateWorkspaceUserPermissionsError implements Action {
    readonly type = UpdateWorkspaceUserPermissionsErrorType;
    constructor(
      public readonly payload: {
        userId: string;
      }
    ) {}
  }

  export const UpdateWorkspaceUserPermissionsSuccessType =
    '[Workspaces] Update user permissions success';
  export class UpdateWorkspaceUserPermissionsSuccess implements Action {
    readonly type = UpdateWorkspaceUserPermissionsSuccessType;
    constructor(
      public readonly payload: {
        userId: string;
        permissions: IWorkspaceUserPermissions;
      }
    ) {}
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

  export const FetchWorkspaceUserPermissionsType =
    '[Workspaces] Fetch current user permissions';
  export class FetchWorkspaceUserPermissions implements Action {
    readonly type = FetchWorkspaceUserPermissionsType;
    constructor(public readonly payload: { currentUserId: string }) {}
  }

  export const FetchWorkspaceUserPermissionsSuccessType =
    '[Workspaces] Fetch current user permissions success';
  export class FetchWorkspaceUserPermissionsSuccess implements Action {
    readonly type = FetchWorkspaceUserPermissionsSuccessType;
    constructor(public readonly payload: IWorkspaceUserPermissionsBackend) {}
  }

  export const FetchWorkspaceUserPermissionsErrorType =
    '[Workspaces] Fetch current user permissions error';
  export class FetchWorkspaceUserPermissionsError implements Action {
    readonly type = FetchWorkspaceUserPermissionsErrorType;
    constructor() {}
  }
}
