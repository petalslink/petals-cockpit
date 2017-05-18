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

import { IComponentRowWithoutDetails } from 'app/features/cockpit/workspaces/state/components/component.interface';

export interface IServiceUnitBackendSSECommon {
  id: string;
  name: string;
  containerId: string;
  componentId: string;
  serviceAssemblyId: string;
}

// tslint:disable-next-line:no-empty-interface
export interface IServiceUnitBackendDetailsCommon { }

// tslint:disable-next-line:no-empty-interface
export interface IServiceUnitBackendSSE extends IServiceUnitBackendSSECommon { }

// tslint:disable-next-line:no-empty-interface
export interface IServiceUnitBackendDetails extends IServiceUnitBackendDetailsCommon { }

export interface IServiceUnitUI {
  // for UI
  isFolded: boolean;
  isUpdatingState: boolean;
  errorChangeState: string;
}

export interface IServiceUnitRow extends IServiceUnitUI, IServiceUnitBackendSSE, IServiceUnitBackendDetails { }

export interface IServiceUnitRowWithoutDetails extends IServiceUnitUI, IServiceUnitBackendSSE { }

export interface IServiceUnit extends IServiceUnitUI, IServiceUnitBackendSSECommon, IServiceUnitBackendDetailsCommon { }

export function serviceUnitRowFactory(): IServiceUnitRow {
  return {
    id: null,
    name: null,
    containerId: null,
    componentId: null,
    serviceAssemblyId: null,

    isFolded: false,
    isUpdatingState: false,
    errorChangeState: ''
  };
}

// -------------------------

// selectors

export interface IServiceUnitAndComponent extends IServiceUnitRowWithoutDetails {
  component: IComponentRowWithoutDetails;
}
