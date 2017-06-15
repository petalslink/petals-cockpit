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
import { IServiceAssemblyRow } from './service-assemblies.interface';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { filterWorkspaceFetched } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { IServiceUnitAndComponent } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';
import { arrayEquals, tuple } from 'app/shared/helpers/shared.helper';

export function getCurrentServiceAssembly(
  store$: Store<IStore>
): Observable<IServiceAssemblyRow> {
  return filterWorkspaceFetched(store$)
    .filter(state => !!state.serviceAssemblies.selectedServiceAssemblyId)
    .map(
      state =>
        state.serviceAssemblies.byId[
          state.serviceAssemblies.selectedServiceAssemblyId
        ]
    )
    .filter(s => !!s)
    .distinctUntilChanged();
}

export function getServiceUnitsAndComponentsOfServiceAssembly(
  store$: Store<IStore>
): Observable<IServiceUnitAndComponent[]> {
  return getCurrentServiceAssembly(store$)
    .withLatestFrom(
      store$.select(state => tuple([state.serviceUnits, state.components]))
    )
    .map(([a, [b, c]]) => tuple([a, b, c]))
    .distinctUntilChanged(arrayEquals)
    .map(([serviceAssemblyRow, serviceUnitsTable, componentsTable]) =>
      serviceAssemblyRow.serviceUnits.map(
        serviceUnitId =>
          <IServiceUnitAndComponent>{
            ...serviceUnitsTable.byId[serviceUnitId],
            component:
              componentsTable.byId[
                serviceUnitsTable.byId[serviceUnitId].componentId
              ],
          }
      )
    );
}
