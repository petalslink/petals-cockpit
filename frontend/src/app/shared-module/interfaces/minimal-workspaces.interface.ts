/**
 * Copyright (C) 2016 Linagora
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

// our interfaces
import { TypedRecord } from 'typed-immutable-record';

// a minimal workspace contains only the basic information of a workspace
// until the user select a workspace and we fetch the other information of this workspace
export interface IMinimalWorkspace {
  // from server
  id: string;
  name: string;
  usedBy: Array<string>;
}

export interface IMinimalWorkspaceRecord extends TypedRecord<IMinimalWorkspaceRecord>, IMinimalWorkspace { };

// the list of minimal workspaces
export interface IMinimalWorkspaces {
  // from server
  minimalWorkspaces: Array<IMinimalWorkspace>;

  // for UI
  addingWorkspace: boolean;
  fetchingWorkspaces: boolean;
  fetchingWorkspaceWithId: string;
}

export interface IMinimalWorkspacesRecord extends TypedRecord<IMinimalWorkspacesRecord>, IMinimalWorkspaces { };
