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
  IInterfaceBackendSSE,
  IInterfaceBackendSSECommon,
} from 'app/shared/services/interfaces.service';

export interface IInterfaceUI {
  // for UI
  isFetchingDetails: boolean;
}

export interface IInterfaceRow extends IInterfaceUI, IInterfaceBackendSSE {}

export interface IInterfaceRowWithQName extends IInterfaceRow {
  namespace: string;
  localpart: string;
}

export interface IInterfaceRowWithoutDetails
  extends IInterfaceUI,
    IInterfaceBackendSSE {}

export interface IInterface extends IInterfaceUI, IInterfaceBackendSSECommon {}

interface IInterfacesCommon {
  selectedInterfaceId: string;
  selectedInterfaceServices: string[];
  selectedInterfaceEndpoints: string[];
}

export interface IInterfacesTable
  extends IInterfacesCommon,
    JsTable<IInterfaceRow> {}

export function interfaceRowFactory(): IInterfaceRow {
  return {
    id: null,
    name: null,
    components: null,
    isFetchingDetails: false,
  };
}

export function interfacesTableFactory(): IInterfacesTable {
  return {
    ...emptyJsTable<IInterfaceRow>(),
    selectedInterfaceId: '',
    selectedInterfaceServices: [],
    selectedInterfaceEndpoints: [],
  };
}
