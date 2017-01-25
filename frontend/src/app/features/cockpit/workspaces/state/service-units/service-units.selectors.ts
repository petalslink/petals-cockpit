import { IServiceUnitRow } from './service-unit.interface';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from '../../../../../shared/interfaces/store.interface';

export function _getCurrentServiceUnit(store$: Store<IStore>): Observable<IServiceUnitRow> {
  return store$.select(state => state.serviceUnits)
    .filter(serviceUnits => serviceUnits.selectedServiceUnitId !== '')
    .map(serviceUnits => {
      const serviceUnit = serviceUnits.byId[serviceUnits.selectedServiceUnitId];

      return serviceUnit;
    });
}

export function getCurrentServiceUnit() {
  return _getCurrentServiceUnit;
}
