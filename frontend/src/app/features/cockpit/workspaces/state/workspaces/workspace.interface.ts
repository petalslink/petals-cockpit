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

import { IUsers } from '../../../../../shared/interfaces/users.interface';
import { IBuses } from '../buses/buses.interface';
import { IWorkspacesCommon } from './workspaces.interface';

interface IWorkspaceCommon {
  // from server
  id: string;
  name: string;

  // when a bus is in import
  isImporting: boolean;
  importIp?: string;
  importPort?: number;
  importUsername?: string;
  importError?: string;
}

// used within table
export interface IWorkspaceRow extends IWorkspaceCommon {
  buses: Array<string>;
  // this workspace is also used by the following users
  users: Array<string>;
}

// used in generated views
// we import IWorkspacesCommon here because when creating a view from a selector
// we'll inject those properties for the current workspace
export interface IWorkspace extends IWorkspaceCommon, IWorkspacesCommon {
  buses: IBuses;
  users: IUsers;
}
