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
import { IEndpointBackendSSE } from '@shared/services/endpoints.service';

export interface IEndpointsBackendCommon {
  id: string;
  name: string;
  serviceId: string;
  componentId: string;
}
export interface IEndpointUI {
  // for UI
  isFetchingDetails: boolean;
}
export interface IEndpointRow extends IEndpointUI, IEndpointBackendSSE {}
export interface IEndpointRowWithoutDetails
  extends IEndpointUI,
    IEndpointBackendSSE {}

interface IEndpointsCommon {
  selectedEndpointId: string;
}

export interface IEndpointsTable
  extends IEndpointsCommon,
    JsTable<IEndpointRow> {}

export function endpointRowFactory(): IEndpointRow {
  return {
    id: null,
    name: null,
    serviceId: null,
    componentId: null,
    isFetchingDetails: false,
    interfacesIds: [],
  };
}

export function endpointsTableFactory(): IEndpointsTable {
  return {
    ...emptyJsTable<IEndpointRow>(),
    selectedEndpointId: '',
  };
}
