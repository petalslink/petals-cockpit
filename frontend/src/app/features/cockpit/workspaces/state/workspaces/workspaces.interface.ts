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

import { emptyJsTable, JsTable } from '@shared/helpers/jstable.helper';
import {
  IWorkspaceBackendCommon,
  IWorkspaceBackendDetailsCommon,
  IWorkspaceUserBackend,
  IWorkspaceUserPermissionsBackend,
} from '@shared/services/workspaces.service';

export interface IWorkspaceUI {
  // from UI
  isRemoving: boolean;
  isFetchingDetails: boolean;
  isUpdatingDetails: boolean;
  isEditDetailsMode: boolean;
  isAddingUserToWorkspace: boolean;
  isRemovingUserFromWorkspace: boolean;
}

// used within table
export interface IWorkspaceRow extends IWorkspaceUI, IWorkspaceDetails {}

// used in generated views
export interface IWorkspace extends IWorkspaceBackendCommon {
  shortDescription: string;
  description: string;
  users: JsTable<IWorkspaceUserRow>;
}

export interface IWorkspaceDetails
  extends IWorkspaceBackendCommon,
    IWorkspaceBackendDetailsCommon {
  users: JsTable<IWorkspaceUserRow>;
}

// used within ws table
export interface IWorkspaceUserRow extends IWorkspaceUserBackend {
  name: string;
  isSavingUserPermissions: boolean;
}

export interface IWorkspaceUserPermissions
  extends IWorkspaceUserPermissionsBackend {}

export function workspaceUserPermissionsFactory(): IWorkspaceUserPermissions {
  return {
    adminWorkspace: false,
    deployArtifact: false,
    lifecycleArtifact: false,
  };
}

export function workspaceRowFactory(): IWorkspaceRow {
  return {
    id: null,
    name: null,
    shortDescription: undefined,
    description: undefined,
    isRemoving: false,
    isFetchingDetails: false,
    isUpdatingDetails: false,
    isEditDetailsMode: false,
    isAddingUserToWorkspace: false,
    isRemovingUserFromWorkspace: false,
    users: emptyJsTable<IWorkspaceUserRow>(),
  };
}

export interface IWorkspacesCommon {
  selectedWorkspaceId: string;

  // for all users of the workspace that was deleted
  isSelectedWorkspaceDeleted: boolean;

  // for workspaces
  isAddingWorkspace: boolean;
  isFetchingWorkspaces: boolean;
  isFetchingWorkspace: boolean;

  isFetchingServices: boolean;

  searchPetals: string;
  searchServices: string;
  createWksError: string;
}

export interface IWorkspacesTable
  extends IWorkspacesCommon,
    JsTable<IWorkspaceRow> {}

export interface IWorkspaces extends IWorkspacesCommon {
  list: IWorkspace[];
}

export function workspacesTableFactory(): IWorkspacesTable {
  return {
    ...emptyJsTable<IWorkspaceRow>(),
    selectedWorkspaceId: '',
    isSelectedWorkspaceDeleted: false,
    isAddingWorkspace: false,
    isFetchingWorkspaces: false,
    isFetchingWorkspace: false,
    isFetchingServices: false,
    searchPetals: '',
    searchServices: '',
    createWksError: '',
  };
}
