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

// our helpers
import { makeTypedFactory } from '../helpers/helper';

// our interfaces
import { IWorkspace, IWorkspaceRecord } from '../interfaces/workspace.interface';

export function workspaceFactory(): IWorkspace {
  return {
    // IMinimalWorkspace
    // -----------------
    // from server
    id: null,
    name: null,
    usedBy: null,

    // ------------------------

    // IWorkspace
    // ----------
    // from server
    buses: [],
    busesInProgress: [],

    // for UI
    searchPetals: '',
    fetchingWorkspace: false,
    importingBus: false,
    gettingBusConfig: false,

    selectedBusId: null,
    selectedContainerId: null,
    selectedComponentId: null,
    selectedServiceUnitId: null
  };
}

export const workspaceRecordFactory = makeTypedFactory<IWorkspace, IWorkspaceRecord>(workspaceFactory());
