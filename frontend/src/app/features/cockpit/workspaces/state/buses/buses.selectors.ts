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

import { IBusUI } from './buses.interface';
import { IStore } from 'app/shared/state/store.interface';
import {
  IBusBackendSSECommon,
  IBusBackendDetailsCommon,
} from 'app/shared/services/buses.service';
import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/containers.interface';

export interface IBusWithContainers
  extends IBusUI,
    IBusBackendSSECommon,
    IBusBackendDetailsCommon {
  containers: IContainerRow[];
}

export function getCurrentBus(
  store$: Store<IStore>
): Observable<IBusWithContainers> {
  return store$
    .filter(state => !!state.buses.selectedBusId)
    .map(state => {
      const bus = state.buses.byId[state.buses.selectedBusId];
      if (bus) {
        return {
          ...bus,
          containers: bus.containers.map(c => state.containers.byId[c]),
        };
      } else {
        return undefined;
      }
    })
    .filter(b => !!b)
    .distinctUntilChanged();
}
