import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IBusRow } from './bus.interface';
import { _getCurrentWorkspace } from '../workspaces/workspaces.selectors';

export function _getCurrentBus(store$: Store<IStore>): Observable<IBusRow> {
  return store$.select(state => state.buses)
    .filter(buses => buses.selectedBusId !== '')
    .map(buses => {
      let bus = buses.byId[buses.selectedBusId];

      return bus;
    });
}

export function getCurrentBus() {
  return _getCurrentBus;
}
