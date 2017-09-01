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

import { emptyJsTable, JsTable } from 'app/shared/helpers/jstable.helper';
import {
  IBusInProgressBackend,
  IBusInProgressBackendCommon,
} from 'app/shared/services/buses.service';

export interface IBusInProgressUI {
  // for UI
  isRemoving: boolean;

  // TODO is it really meant to be here?
  password: string;
  passphrase: string;
}

// used within table
export interface IBusInProgressRow
  extends IBusInProgressUI,
    IBusInProgressBackend {}

// used in generated views
export interface IBusInProgress
  extends IBusInProgressUI,
    IBusInProgressBackendCommon {}

export interface IBusesInProgressCommon {
  selectedBusInProgressId: string;

  // there can be only one import at a time
  isImportingBus: boolean;
  importBusError: string;
}

export interface IBusesInProgressTable
  extends IBusesInProgressCommon,
    JsTable<IBusInProgressRow> {}

export interface IBusesInProgress extends IBusesInProgressCommon {
  list: IBusInProgress[];
}

export function busInProgressRowFactory(): IBusInProgressRow {
  return {
    id: null,
    username: null,
    port: null,
    ip: null,

    importError: '',
    isRemoving: false,
    password: '',
    passphrase: '',
  };
}

export function busesInProgressTableFactory(): IBusesInProgressTable {
  return {
    ...emptyJsTable<IBusInProgressRow>(),
    selectedBusInProgressId: '',
    isImportingBus: false,
    importBusError: '',
  };
}
