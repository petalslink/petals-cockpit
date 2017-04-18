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

import { IWorkspaceRow, IWorkspace } from './workspace.interface';

export interface IWorkspacesCommon {
  selectedWorkspaceId: string;
  isSelectedWorkspaceFetched: boolean;
  // for all users of the workspace that was deleted
  isSelectedWorkspaceDeleted: boolean;

  // for workspaces dialog
  isAddingWorkspace: boolean;
  isFetchingWorkspaces: boolean;

  searchPetals: string;
}

export interface IWorkspacesTableOnly {
  byId: { [key: string]: IWorkspaceRow };
  allIds: string[];
}

export interface IWorkspacesTable extends IWorkspacesCommon, IWorkspacesTableOnly { }

export interface IWorkspaces extends IWorkspacesCommon {
  list: IWorkspace[];
}

export function workspacesTableFactory(): IWorkspacesTable {
  return {
    selectedWorkspaceId: '',
    isSelectedWorkspaceFetched: false,
    isSelectedWorkspaceDeleted: false,

    isAddingWorkspace: false,
    isFetchingWorkspaces: false,
    searchPetals: '',

    byId: {},
    allIds: []
  };
}
