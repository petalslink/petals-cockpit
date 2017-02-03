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

  isAddingWorkspace: boolean;
  isFetchingWorkspaces: boolean;
  fetchingWorkspaceWithId: string;
  searchPetals: string;
}

export interface IWorkspacesTableOnly {
  byId: { [key: string]: IWorkspaceRow };
  allIds: Array<string>;
}

export interface IWorkspacesTable extends IWorkspacesCommon, IWorkspacesTableOnly { }

export interface IWorkspaces extends IWorkspacesCommon {
  list: Array<IWorkspace>;
}