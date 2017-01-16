import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IBusesInProgress } from './buses-in-progress.interface';
import { IStore } from '../../../../../shared/interfaces/store.interface';

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

