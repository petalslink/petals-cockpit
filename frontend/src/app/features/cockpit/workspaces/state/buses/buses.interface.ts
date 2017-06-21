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

import { IContainers } from '../containers/containers.interface';
import { JsTable, emptyJsTable } from 'app/shared/helpers/jstable.helper';
import {
  IBusBackendSSE,
  IBusBackendDetails,
  IBusBackendSSECommon,
  IBusBackendDetailsCommon,
} from 'app/shared/services/buses.service';

export interface IBusUI {
  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
  isRemoving: boolean;
}

// used within table
export interface IBusRow extends IBusUI, IBusBackendSSE, IBusBackendDetails {}

// used in generated views
export interface IBus extends IBusUI, IBusBackendSSECommon, IBusBackendDetailsCommon {
  containers: IContainers;
}

export interface IBusesCommon {
  selectedBusId: string;
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

    isFolded: false,
    isFetchingDetails: false,
    isRemoving: false,

    containers: [],
  };
}

export function busesTableFactory(): IBusesTable {
  return Object.assign({}, emptyJsTable<IBusRow>(), {
    selectedBusId: '',
  });
}
