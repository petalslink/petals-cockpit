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
import {
  IServiceAssemblyBackendSSE,
  IServiceAssemblyBackendDetails,
  IServiceAssemblyBackendSSECommon,
  IServiceAssemblyBackendDetailsCommon,
} from 'app/shared/services/service-assemblies.service';

export interface IServiceAssemblyUI {
  // for UI
  isFolded: boolean;
  isUpdatingState: boolean;
  errorChangeState: string;
  isFetchingDetails: boolean;
}

export interface IServiceAssemblyRow extends IServiceAssemblyUI, IServiceAssemblyBackendSSE, IServiceAssemblyBackendDetails {}

export interface IServiceAssembly extends IServiceAssemblyUI, IServiceAssemblyBackendSSECommon, IServiceAssemblyBackendDetailsCommon {}

interface IServiceAssembliesCommon {
  selectedServiceAssemblyId: string;
}

export interface IServiceAssembliesTable extends IServiceAssembliesCommon, JsTable<
  IServiceAssemblyRow
> {}

export interface IServiceAssemblies extends IServiceAssembliesCommon {
  list: IServiceAssembly[];
}

export function serviceAssemblyRowFactory(): IServiceAssemblyRow {
  return {
    id: null,
    name: null,
    serviceUnits: [],
    containerId: null,
    state: null,

    isFolded: false,
    isUpdatingState: false,
    errorChangeState: '',
    isFetchingDetails: false,
  };
}

export function serviceAssembliesTableFactory(): IServiceAssembliesTable {
  return {
    ...emptyJsTable<IServiceAssemblyRow>(),
    selectedServiceAssemblyId: '',
  };
}
