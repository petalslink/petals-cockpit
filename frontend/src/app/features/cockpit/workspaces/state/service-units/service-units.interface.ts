/**
 * Copyright (C) 2017-2020 Linagora
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

import { emptyJsTable, JsTable } from '@shared/helpers/jstable.helper';
import {
  IServiceUnitBackendDetails,
  IServiceUnitBackendDetailsCommon,
  IServiceUnitBackendSSE,
  IServiceUnitBackendSSECommon,
} from '@shared/services/service-units.service';

export interface IServiceUnitUI {
  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
}

export interface IServiceUnitRow
  extends IServiceUnitUI,
    IServiceUnitBackendSSE,
    IServiceUnitBackendDetails {}

export interface IServiceUnitRowWithoutDetails
  extends IServiceUnitUI,
    IServiceUnitBackendSSE {}

export interface IServiceUnit
  extends IServiceUnitUI,
    IServiceUnitBackendSSECommon,
    IServiceUnitBackendDetailsCommon {}

interface IServiceUnitsCommon {
  selectedServiceUnitId: string;
}

export interface IServiceUnitsTable
  extends IServiceUnitsCommon,
    JsTable<IServiceUnitRow> {}

export interface IServiceUnits extends IServiceUnitsCommon {
  list: IServiceUnit[];
}

export function serviceUnitRowFactory(): IServiceUnitRow {
  return {
    id: null,
    name: null,
    containerId: null,
    componentId: null,
    serviceAssemblyId: null,

    isFolded: false,
    isFetchingDetails: false,
  };
}

export function serviceUnitsTableFactory(): IServiceUnitsTable {
  return {
    ...emptyJsTable<IServiceUnitRow>(),
    selectedServiceUnitId: '',
  };
}
