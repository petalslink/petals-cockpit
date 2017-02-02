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
