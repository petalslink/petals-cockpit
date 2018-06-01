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

import { createSelector } from '@ngrx/store';

import { IStore } from '@shared/state/store.interface';
import {
  IBusInProgress,
  IBusInProgressRow,
} from '@wks/state/buses-in-progress/buses-in-progress.interface';

export function getBusesInProgressAllIds(state: IStore) {
  return state.busesInProgress.allIds;
}

export function getBusesInProgressByIds(state: IStore) {
  return state.busesInProgress.byId;
}

export const getBusesInProgress = createSelector(
  getBusesInProgressAllIds,
  getBusesInProgressByIds,
  (allIds, byId): IBusInProgressRow[] => allIds.map(id => byId[id])
);

export const getCurrentBusInProgress = createSelector(
  (state: IStore) => state.busesInProgress.selectedBusInProgressId,
  getBusesInProgressByIds,
  (selectedBusInProgressId, busesInProgressById): IBusInProgress =>
    busesInProgressById[selectedBusInProgressId]
);
