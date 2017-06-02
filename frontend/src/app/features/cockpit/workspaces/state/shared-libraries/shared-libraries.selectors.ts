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
import { ISharedLibraryRow } from './shared-libraries.interface';
import { filterWorkspaceFetched } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { arrayEquals } from 'app/shared/helpers/shared.helper';
import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';

export function getCurrentSharedLibrary(store$: Store<IStore>): Observable<ISharedLibraryRow> {
  return filterWorkspaceFetched(store$)
    .filter(state => !!state.sharedLibraries.selectedSharedLibraryId)
    .map(state => state.sharedLibraries.byId[state.sharedLibraries.selectedSharedLibraryId])
    .distinctUntilChanged();
}

export function getCurrentSharedLibraryComponents(store$: Store<IStore>): Observable<IComponentRow[]> {
  return getCurrentSharedLibrary(store$)
    .withLatestFrom(store$.select(state => state.components))
    .distinctUntilChanged(arrayEquals)
    .map(([sharedLibrary, componentsTable]) =>
      sharedLibrary.components.map(slId => componentsTable.byId[slId])
    );
}
