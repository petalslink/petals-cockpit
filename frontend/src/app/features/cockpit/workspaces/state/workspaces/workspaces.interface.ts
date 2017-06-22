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

import { IUsers } from '../../../../../shared/state/users.interface';
import { IBuses } from '../buses/buses.interface';
import {
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
  IWorkspaceBackendCommon,
  IWorkspaceBackendDetailsCommon,
} from 'app/shared/services/workspaces.service';
import { JsTable, emptyJsTable } from 'app/shared/helpers/jstable.helper';

export interface IWorkspaceUI {
  // from UI
  isRemoving: boolean;
  isFetchingDetails: boolean;
  isSettingDescription: boolean;
}

// used within table
export interface IWorkspaceRow extends IWorkspaceUI, IWorkspaceBackend, IWorkspaceBackendDetails {}

// used in generated views
export interface IWorkspace extends IWorkspaceUI, IWorkspaceBackendCommon, IWorkspaceBackendDetailsCommon {
  buses: IBuses;
  users: IUsers;
}

export function workspaceRowFactory(): IWorkspaceRow {
  return {
    id: null,
    name: null,

    description: undefined,

    isRemoving: false,
    isFetchingDetails: false,
    isSettingDescription: false,

    users: [],
  };
}

export interface IWorkspacesCommon {
  selectedWorkspaceId: string;
  isSelectedWorkspaceFetched: boolean;
  isSelectedWorkspaceFetchError: boolean;

  // for all users of the workspace that was deleted
  isSelectedWorkspaceDeleted: boolean;

  // for workspaces dialog
  isAddingWorkspace: boolean;
  isFetchingWorkspaces: boolean;

  searchPetals: string;
}

export interface IWorkspacesTable extends IWorkspacesCommon, JsTable<
  IWorkspaceRow
> {}

export interface IWorkspaces extends IWorkspacesCommon {
  list: IWorkspace[];
}

export function workspacesTableFactory(): IWorkspacesTable {
  return {
    ...emptyJsTable<IWorkspaceRow>(),
    selectedWorkspaceId: '',
    isSelectedWorkspaceFetched: false,
    isSelectedWorkspaceFetchError: false,
    isSelectedWorkspaceDeleted: false,

    isAddingWorkspace: false,
    isFetchingWorkspaces: false,
    searchPetals: '',
  };
}
