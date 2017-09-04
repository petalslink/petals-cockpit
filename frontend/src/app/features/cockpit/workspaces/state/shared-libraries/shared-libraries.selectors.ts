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

import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';
import { IStore } from 'app/shared/state/store.interface';
import { ISharedLibrary } from './shared-libraries.interface';

export interface ISharedLibraryWithComponents extends ISharedLibrary {
  components: IComponentRow[];
}

export function getCurrentSharedLibrary(
  store$: Store<IStore>
): Observable<ISharedLibraryWithComponents> {
  return store$
    .filter(state => !!state.sharedLibraries.selectedSharedLibraryId)
    .map(state => {
      const sl =
        state.sharedLibraries.byId[
          state.sharedLibraries.selectedSharedLibraryId
        ];
      if (sl) {
        return {
          ...sl,
          components: sl.components.map(id => state.components.byId[id]),
        };
      } else {
        return null;
      }
    });
}

export const getSharedLibrariesByIds = (state: IStore) =>
  state.sharedLibraries.byId;

export const getSharedLibrariesAllIds = (state: IStore) =>
  state.sharedLibraries.allIds;
