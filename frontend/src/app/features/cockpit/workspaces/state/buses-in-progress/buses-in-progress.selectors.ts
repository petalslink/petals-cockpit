import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IBusesInProgress } from './buses-in-progress.interface';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IBusInProgressRow } from './bus-in-progress.interface';

export function _getBusesInProgress(store$: Store<IStore>): Observable<IBusesInProgress> {
  return store$.select(state => state.busesInProgress)
    .map(busesInProgressTable => {
      return <IBusesInProgress>Object.assign({}, busesInProgressTable, {
        list: busesInProgressTable.allIds.map(busInProgressId => {
          return busesInProgressTable.byId[busInProgressId];
        })
      });
    });
}

export function getBusesInProgress() {
  return _getBusesInProgress;
}

// ------------------------------------------------------------------

export function _getCurrentBusInProgress(store$: Store<IStore>): Observable<IBusInProgressRow> {
  return store$.select(state => state.busesInProgress)
    .filter(busesInProgress => busesInProgress.selectedBusInProgressId !== '')
    .map(busesInProgress => {
      const busInProgress = busesInProgress.byId[busesInProgress.selectedBusInProgressId];

      return busInProgress;
    });
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
