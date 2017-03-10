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

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IBusesInProgress } from './buses-in-progress.interface';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IBusInProgressRow } from './bus-in-progress.interface';
import { isNot } from '../../../../../shared/helpers/shared.helper';

export function _getBusesInProgress(store$: Store<IStore>): Observable<IBusesInProgress> {
  return store$.select(state => state.busesInProgress)
    .map(busesInProgressTable => {
      return <IBusesInProgress>{
        ...busesInProgressTable,
        list: busesInProgressTable.allIds.map(busInProgressId => {
          return busesInProgressTable.byId[busInProgressId];
        })
      };
    });
}

export function getBusesInProgress() {
  return _getBusesInProgress;
}

// ------------------------------------------------------------------

export function _getCurrentBusInProgress(store$: Store<IStore>): Observable<IBusInProgressRow> {
  return store$
    .select(state => state.busesInProgress.selectedBusInProgressId === ''
      ? null
      : state.busesInProgress.byId[state.busesInProgress.selectedBusInProgressId])
    .filter(isNot(null));
}

export function getCurrentBusInProgress() {
  return _getCurrentBusInProgress;
}

// ------------------------------------------------------------------

export function _getCurrentBusInProgressEvenIfNull(store$: Store<IStore>): Observable<IBusInProgressRow> {
  return store$.select(state => state.busesInProgress)
    .filter(busesInProgress => busesInProgress.allIds.length > 0)
    .map(busesInProgress => {
      if (busesInProgress.selectedBusInProgressId === '') {
        return null;
      }

      const busInProgress = busesInProgress.byId[busesInProgress.selectedBusInProgressId];

      return busInProgress;
    });
}

export function getCurrentBusInProgressEvenIfNull() {
  return _getCurrentBusInProgressEvenIfNull;
}
