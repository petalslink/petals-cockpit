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
import { IComponentRow } from './component.interface';
import { _getCurrentWorkspace } from '../workspaces/workspaces.selectors';

export function _getCurrentComponent(store$: Store<IStore>): Observable<IComponentRow> {
  return store$.select(state => state.components)
    .filter(components => components.selectedComponentId !== '')
    .map(components => {
      const component = components.byId[components.selectedComponentId];

      return component;
    });
}

export function getCurrentComponent() {
  return _getCurrentComponent;
}