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
import { IServiceUnit } from './service-units.interface';

import { IServiceAssemblyRow } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import { IStore } from 'app/shared/state/store.interface';

export interface IServiceUnitWithSA extends IServiceUnit {
  serviceAssembly: IServiceAssemblyRow;
}

export function getCurrentServiceUnit(
  store$: Store<IStore>
): Observable<IServiceUnitWithSA> {
  return store$
    .filter(state => !!state.serviceUnits.selectedServiceUnitId)
    .mergeMap(state => {
      const su =
        state.serviceUnits.byId[state.serviceUnits.selectedServiceUnitId];
      if (su) {
        return Observable.of({
          ...su,
          serviceAssembly: state.serviceAssemblies.byId[su.serviceAssemblyId],
        });
      } else {
        return Observable.empty();
      }
    });
}

export const getServiceUnitsByIds = (state: IStore) => state.serviceUnits.byId;

export const getServiceUnitsAllIds = (state: IStore) =>
  state.serviceUnits.allIds;
