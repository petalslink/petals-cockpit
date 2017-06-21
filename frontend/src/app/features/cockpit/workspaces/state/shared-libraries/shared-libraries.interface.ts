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
  ISharedLibraryBackendSSE,
  ISharedLibraryBackendDetails,
  ISharedLibraryBackendSSECommon,
  ISharedLibraryBackendDetailsCommon,
} from 'app/shared/services/shared-libraries.service';

export interface ISharedLibraryUI {
  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
}

export interface ISharedLibraryRow extends ISharedLibraryUI, ISharedLibraryBackendSSE, ISharedLibraryBackendDetails {}

export interface ISharedLibrary extends ISharedLibraryUI, ISharedLibraryBackendSSECommon, ISharedLibraryBackendDetailsCommon {}

interface ISharedLibrariesCommon {
  selectedSharedLibraryId: string;
}

export interface ISharedLibrariesTable extends ISharedLibrariesCommon, JsTable<
  ISharedLibraryRow
> {}

export interface ISharedLibraries extends ISharedLibrariesCommon {
  list: ISharedLibrary[];
}

export function sharedLibraryRowFactory(): ISharedLibraryRow {
  return {
    id: null,
    name: null,
    version: null,
    components: [],
    containerId: null,
    isFetchingDetails: false,

    isFolded: false,
  };
}

export function sharedLibrariesTableFactory(): ISharedLibrariesTable {
  return Object.assign({}, emptyJsTable<ISharedLibraryRow>(), {
    selectedSharedLibraryId: '',
  });
}
