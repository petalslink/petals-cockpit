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

import { IBusInProgress, IBusInProgressRow } from './bus-in-progress.interface';

export interface IBusesInProgressCommon {
  selectedBusInProgressId: string;

  // there can be only one import at a time
  isImportingBus: boolean;
  importBusError: string;
  importBusId: string;
}

export interface IBusesInProgressTable extends IBusesInProgressCommon {
  byId: { [key: string]: IBusInProgressRow };
  allIds: Array<string>;
}

export interface IBusesInProgress extends IBusesInProgressCommon {
  list: Array<IBusInProgress>;
}

export function busesInProgressTableFactory(): IBusesInProgressTable {
  return {
    selectedBusInProgressId: '',
    isImportingBus: false,
    importBusError: '',
    importBusId: '',

    byId: {},
    allIds: []
  };
}
