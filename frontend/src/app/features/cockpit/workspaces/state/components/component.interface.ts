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

import { IServiceUnits } from '../service-units/service-units.interface';

// http://stackoverflow.com/a/41631732/2398593
export const EComponentState = {
  Started: 'Started' as 'Started',
  Stopped: 'Stopped' as 'Stopped',
  Loaded: 'Loaded' as 'Loaded',
  Unloaded: 'Unloaded' as 'Unloaded',
  Shutdown: 'Shutdown' as 'Shutdown',
  Unknown: 'Unknown' as 'Unknown'
};

export type ComponentState = keyof typeof EComponentState;

export const EComponentType = {
  BC: 'BC' as 'BC',
  SE: 'SE' as 'SE'
};

export type ComponentType = keyof typeof EComponentType;

export interface IComponentBackendSSECommon {
  id: string;
  name: string;
  state: ComponentState;
  type: ComponentType;
  containerId: string;
}

export interface IComponentBackendDetailsCommon {
  parameters: { [key: string]: string };
}

export interface IComponentBackendSSE extends IComponentBackendSSECommon {
  // from server (sse)
  serviceUnits: string[];
}

// tslint:disable-next-line:no-empty-interface
export interface IComponentBackendDetails extends IComponentBackendDetailsCommon {}

export interface IComponentUI {
  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
  isUpdatingState: boolean;
  isDeployingServiceUnit: boolean;
  errorChangeState: string;
  errorDeployment: string;
}

export interface IComponentRow extends IComponentUI, IComponentBackendSSE, IComponentBackendDetails {
}

export interface IComponent extends IComponentUI, IComponentBackendSSECommon, IComponentBackendDetailsCommon {
  serviceUnits: IServiceUnits;
}

export function componentRowFactory(): IComponentRow {
  return {
    id: null,
    name: null,
    state: null,
    type: null,
    containerId: null,
    parameters: {},

    isFolded: false,
    isFetchingDetails: false,
    isUpdatingState: false,
    isDeployingServiceUnit: false,
    errorChangeState: '',
    errorDeployment: '',

    serviceUnits: []
  };
}
