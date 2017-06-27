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

import { IStore } from '../../../../../shared/state/store.interface';
import { IContainerRow } from './containers.interface';

import { filterWorkspaceFetched } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';

export interface IContainerWithSiblings extends IContainerRow {
  siblings: IContainerRow[];
}

export function getCurrentContainer(
  store$: Store<IStore>
): Observable<IContainerWithSiblings> {
  return filterWorkspaceFetched(store$)
    .filter(state => !!state.containers.selectedContainerId)
    .map(state => {
      const container =
        state.containers.byId[state.containers.selectedContainerId];
      if (container) {
        return {
          ...container,
          siblings: state.buses.byId[container.busId].containers
            .filter(cid => cid !== container.id)
            .map(cid => state.containers.byId[cid]),
        };
      } else {
        return undefined;
      }
    })
    .filter(c => !!c)
    .distinctUntilChanged();
}
