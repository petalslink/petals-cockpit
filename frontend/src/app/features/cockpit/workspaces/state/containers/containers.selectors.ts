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

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IContainerRow } from './container.interface';
import { isNot, arrayEquals } from '../../../../../shared/helpers/shared.helper';

export function _getCurrentContainer(store$: Store<IStore>): Observable<IContainerRow> {
  return store$
    .select(state => state.containers.selectedContainerId === ''
      ? null
      : state.containers.byId[state.containers.selectedContainerId])
    .filter(isNot(null));
}

export function getCurrentContainer() {
  return _getCurrentContainer;
}

/**
 * Returns the other containers in the bus of the container with id containerId.
 * @param containerId the id of the concerned container (not in the resulting array)
 */
export function getSiblingContainers(containerId: string): (store$: Store<IStore>) => Observable<IContainerRow[]> {
  return store$ => {
    return store$
      .select(state => {
        // TODO not the best in term of performances...
        const busId = state.buses.allIds.find(bId => state.buses.byId[bId].containers.includes(containerId));
        return state.buses.byId[busId].containers
          .filter(cid => cid !== containerId)
          .map(cid => state.containers.byId[cid]);
      })
      .distinctUntilChanged(arrayEquals);
  };
}

