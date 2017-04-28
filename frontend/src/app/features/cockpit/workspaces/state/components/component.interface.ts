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

export enum EComponentType { BC, SE }

export interface IComponentCommon {
  // from server
  id: string;
  name: string;
  state: keyof typeof EComponentState;
  type: EComponentType;
  parameters: { [key: string]: string };

  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
  isUpdatingState: boolean;
  isDeployingServiceUnit: boolean;
  errorChangeState: string;
  errorDeployment: string;
}

export interface IComponentRow extends IComponentCommon {
  // from server
  serviceUnits: string[];
}

export interface IComponent extends IComponentCommon {
  // from server
  serviceUnits: IServiceUnits;
}

export function componentRowFactory(
  id?: string, name?: string, state?: keyof typeof EComponentState, type?: EComponentType
): IComponentRow {
  return {
    id,
    name,
    state,
    type,
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
