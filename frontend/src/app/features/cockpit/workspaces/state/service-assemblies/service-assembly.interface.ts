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

// http://stackoverflow.com/a/41631732/2398593
export const EServiceAssemblyState = {
  Started: 'Started' as 'Started',
  Stopped: 'Stopped' as 'Stopped',
  Unloaded: 'Unloaded' as 'Unloaded',
  Shutdown: 'Shutdown' as 'Shutdown',
  Unknown: 'Unknown' as 'Unknown'
};

export type ServiceAssemblyState = keyof typeof EServiceAssemblyState;

export interface IServiceAssemblyBackendSSECommon {
  id: string;
  name: string;
  containerId: string;
  state: ServiceAssemblyState;
}

// tslint:disable-next-line:no-empty-interface
export interface IServiceAssemblyBackendDetailsCommon { }

// tslint:disable-next-line:no-empty-interface
export interface IServiceAssemblyBackendSSE extends IServiceAssemblyBackendSSECommon {
  serviceUnits: string[];
}

// tslint:disable-next-line:no-empty-interface
export interface IServiceAssemblyBackendDetails extends IServiceAssemblyBackendDetailsCommon { }

export interface IServiceAssemblyUI {
  // for UI
  isFolded: boolean;
  isUpdatingState: boolean;
  errorChangeState: string;
}

export interface IServiceAssemblyRow extends IServiceAssemblyUI, IServiceAssemblyBackendSSE, IServiceAssemblyBackendDetails { }

export interface IServiceAssembly extends IServiceAssemblyUI, IServiceAssemblyBackendSSECommon, IServiceAssemblyBackendDetailsCommon { }

export function serviceAssemblyRowFactory(): IServiceAssemblyRow {
  return {
    id: null,
    name: null,
    serviceUnits: [],
    containerId: null,
    state: null,

    isFolded: false,
    isUpdatingState: false,
    errorChangeState: ''
  };
}
