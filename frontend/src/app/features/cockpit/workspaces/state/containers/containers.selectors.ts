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

import { IStore } from 'app/shared/state/store.interface';
import { IContainerRow } from './containers.interface';

export interface IContainerWithSiblings extends IContainerRow {
  siblings: IContainerRow[];
}

export function getCurrentContainer(
  store$: Store<IStore>
): Observable<IContainerWithSiblings> {
  return store$
    .filter(state => !!state.containers.selectedContainerId)
    .mergeMap(state => {
      const container =
        state.containers.byId[state.containers.selectedContainerId];
      if (container) {
        return Observable.of({
          ...container,
          siblings: state.buses.byId[container.busId].containers
            .filter(id => id !== container.id)
            .map(id => state.containers.byId[id]),
        });
      } else {
        return Observable.empty();
      }
    });
}
