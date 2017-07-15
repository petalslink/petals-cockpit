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

import { IStore } from 'app/shared/state/store.interface';
import { tuple } from 'app/shared/helpers/shared.helper';
import { IServiceUnitRow } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';
import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';

export interface IServiceAssemblyWithSUsAndComponents extends IServiceAssembly {
  serviceUnitsAndComponent: [IServiceUnitRow, IComponentRow][];
}

export function getCurrentServiceAssembly(
  store$: Store<IStore>
): Observable<IServiceAssemblyWithSUsAndComponents> {
  return store$
    .filter(state => !!state.serviceAssemblies.selectedServiceAssemblyId)
    .map(state => {
      const sa =
        state.serviceAssemblies.byId[
          state.serviceAssemblies.selectedServiceAssemblyId
        ];
      if (sa) {
        return {
          ...sa,
          serviceUnitsAndComponent: sa.serviceUnits.map(suId => {
            const su = state.serviceUnits.byId[suId];
            return tuple([su, state.components.byId[su.componentId]]);
          }),
        };
      } else {
        return undefined;
      }
    })
    .filter(s => !!s)
    .distinctUntilChanged();
}
