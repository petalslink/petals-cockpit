/**
 * Copyright (C) 2017-2019 Linagora
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
  IBusBackendDetails,
  IBusBackendDetailsCommon,
  IBusBackendSSE,
  IBusBackendSSECommon,
} from '@shared/services/buses.service';
import { IContainers } from '@wks/state/containers/containers.interface';

export interface IBusUI {
  // for UI
  isBusSelectedForDetachment: boolean;
  isFolded: boolean;
  isFetchingDetails: boolean;
  isDetaching: boolean;
}

// used within table
export interface IBusRow extends IBusUI, IBusBackendSSE, IBusBackendDetails {}

// used in generated views
export interface IBus
  extends IBusUI,
    IBusBackendSSECommon,
    IBusBackendDetailsCommon {
  containers: IContainers;
}

export interface IBusesCommon {
  selectedBusId: string;

  importBusId: string;
  isImportingBus: boolean;
  isCancelingImportBus: boolean;
  importBusError: string;
  importError: string;
}

export interface IBusesTable extends IBusesCommon, JsTable<IBusRow> {}

export interface IBuses extends IBusesCommon {
  list: IBus[];
}

export function busRowFactory(): IBusRow {
  return {
    id: null,
    name: null,
    workspaceId: null,

    isBusSelectedForDetachment: false,
    isFolded: false,
    isFetchingDetails: false,
    isDetaching: false,

    containers: [],
  };
}

export function busesTableFactory(): IBusesTable {
  return {
    ...emptyJsTable<IBusRow>(),
    selectedBusId: '',

    importBusId: '',
    isImportingBus: false,
    isCancelingImportBus: false,
    importBusError: '',
    importError: '',
  };
}
