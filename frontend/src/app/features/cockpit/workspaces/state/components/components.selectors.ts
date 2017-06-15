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
import { IComponentRow } from './components.interface';
import { ISharedLibraryRow } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';
import { filterWorkspaceFetched } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { arrayEquals } from 'app/shared/helpers/shared.helper';

export function getCurrentComponent(
  store$: Store<IStore>
): Observable<IComponentRow> {
  return filterWorkspaceFetched(store$)
    .filter(state => !!state.components.selectedComponentId)
    .map(state => state.components.byId[state.components.selectedComponentId])
    .filter(c => !!c)
    .distinctUntilChanged();
}

export function getCurrentComponentSharedLibraries(
  store$: Store<IStore>
): Observable<ISharedLibraryRow[]> {
  return getCurrentComponent(store$)
    .withLatestFrom(store$.select(state => state.sharedLibraries))
    .distinctUntilChanged(arrayEquals)
    .map(([component, sharedLibrariesTable]) =>
      component.sharedLibraries.map(slId => sharedLibrariesTable.byId[slId])
    );
}
