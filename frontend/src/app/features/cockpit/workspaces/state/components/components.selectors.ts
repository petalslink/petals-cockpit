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

import { IServiceUnitRow } from 'app/features/cockpit/workspaces/state/service-units/service-units.interface';
import { ISharedLibraryRow } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';
import {
  IComponentBackendDetailsCommon,
  IComponentBackendSSECommon,
} from 'app/shared/services/components.service';
import { IStore } from 'app/shared/state/store.interface';
import { IComponentUI } from './components.interface';

export interface IComponentWithSLsAndSUs
  extends IComponentUI,
    IComponentBackendSSECommon,
    IComponentBackendDetailsCommon {
  serviceUnits: IServiceUnitRow[];
  sharedLibraries: ISharedLibraryRow[];
}

export function getCurrentComponent(
  store$: Store<IStore>
): Observable<IComponentWithSLsAndSUs> {
  return store$
    .filter(state => !!state.components.selectedComponentId)
    .mergeMap(state => {
      const component =
        state.components.byId[state.components.selectedComponentId];
      if (component) {
        return Observable.of({
          ...component,
          serviceUnits: component.serviceUnits.map(
            id => state.serviceUnits.byId[id]
          ),
          sharedLibraries: component.sharedLibraries.map(
            id => state.sharedLibraries.byId[id]
          ),
        });
      } else {
        return Observable.empty();
      }
    });
}
