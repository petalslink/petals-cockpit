/**
 * Copyright (C) 2017-2018 Linagora
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

import { emptyJsTable, JsTable } from 'app/shared/helpers/jstable.helper';
import {
  IServiceBackendSSE,
  IServiceBackendSSECommon,
} from 'app/shared/services/services.service';

export interface IServiceUI {
  // for UI
  isFetchingDetails: boolean;
}

export interface IServiceRow extends IServiceUI, IServiceBackendSSE {}

export interface IServiceRowWithoutDetails
  extends IServiceUI,
    IServiceBackendSSE {}

export interface IService extends IServiceUI, IServiceBackendSSECommon {}

interface IServicesCommon {
  selectedServiceId: string;
  selectedServiceInterfaces: string[];
  selectedServiceEndpoints: string[];
}

export interface IServicesTable extends IServicesCommon, JsTable<IServiceRow> {}

export function serviceRowFactory(): IServiceRow {
  return {
    id: null,
    name: null,
    components: null,
    isFetchingDetails: false,
  };
}

export function servicesTableFactory(): IServicesTable {
  return {
    ...emptyJsTable<IServiceRow>(),
    selectedServiceId: '',
    selectedServiceInterfaces: [],
    selectedServiceEndpoints: [],
  };
}
