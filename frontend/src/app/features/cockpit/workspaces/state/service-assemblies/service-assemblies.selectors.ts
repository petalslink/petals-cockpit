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
import { IServiceAssembly } from './service-assemblies.interface';

import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';
import { IServiceUnitRow } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';
import { tuple } from 'app/shared/helpers/shared.helper';
import { IStore } from 'app/shared/state/store.interface';

export interface IServiceAssemblyWithSUsAndComponents extends IServiceAssembly {
  serviceUnitsAndComponent: [IServiceUnitRow, IComponentRow][];
}

export function getCurrentServiceAssembly(
  store$: Store<IStore>
): Observable<IServiceAssemblyWithSUsAndComponents> {
  return store$
    .filter(state => !!state.serviceAssemblies.selectedServiceAssemblyId)
    .mergeMap(state => {
      const sa =
        state.serviceAssemblies.byId[
          state.serviceAssemblies.selectedServiceAssemblyId
        ];
      if (sa) {
        return Observable.of({
          ...sa,
          serviceUnitsAndComponent: sa.serviceUnits.map(id => {
            const su = state.serviceUnits.byId[id];
            return tuple([su, state.components.byId[su.componentId]]);
          }),
        });
      } else {
        return Observable.empty();
      }
    });
}

export const getServiceAssembliesByIds = (state: IStore) =>
  state.serviceAssemblies.byId;

export const getServiceAssembliesAllIds = (state: IStore) =>
  state.serviceAssemblies.allIds;
