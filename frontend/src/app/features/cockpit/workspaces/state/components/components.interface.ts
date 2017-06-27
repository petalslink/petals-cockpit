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

import { JsTable, emptyJsTable } from 'app/shared/helpers/jstable.helper';
import { IServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';
import {
  IComponentBackendSSE,
  IComponentBackendDetails,
  IComponentBackendSSECommon,
  IComponentBackendDetailsCommon,
} from 'app/shared/services/components.service';

export interface IComponentUI {
  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
  isUpdatingState: boolean;
  isDeployingServiceUnit: boolean;
  errorChangeState: string;
  errorDeployment: string;
}

export interface IComponentRow extends IComponentUI, IComponentBackendSSE, IComponentBackendDetails {}

export interface IComponent extends IComponentUI, IComponentBackendSSECommon, IComponentBackendDetailsCommon {
  serviceUnits: IServiceUnits;
}

export interface IComponentsCommon {
  selectedComponentId: string;
}

export interface IComponentsTable extends IComponentsCommon, JsTable<
  IComponentRow
> {}

export interface IComponents extends IComponentsCommon {
  list: IComponent[];
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

    serviceUnits: [],
    sharedLibraries: [],
  };
}

export function componentsTableFactory(): IComponentsTable {
  return {
    ...emptyJsTable<IComponentRow>(),
    selectedComponentId: '',
    isFetchingDetails: false,
  };
}
