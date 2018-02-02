/**
 * Copyright (C) 2017-2018 Linagora
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

import { createSelector } from '@ngrx/store';

import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';
import { getComponentsById } from 'app/features/cockpit/workspaces/state/components/components.selectors';
import { IStore } from 'app/shared/state/store.interface';
import { ISharedLibrary } from './shared-libraries.interface';

export interface ISharedLibraryWithComponents extends ISharedLibrary {
  components: IComponentRow[];
}

export const getSharedLibrariesById = (state: IStore) =>
  state.sharedLibraries.byId;

export const getSharedLibrariesAllIds = (state: IStore) =>
  state.sharedLibraries.allIds;

export const getSelectedSharedLibrary = createSelector(
  (state: IStore) => state.sharedLibraries.selectedSharedLibraryId,
  getSharedLibrariesById,
  (id, sls) => sls[id]
);

export const getCurrentSharedLibrary = createSelector(
  getSelectedSharedLibrary,
  getComponentsById,
  (sl, components) => {
    if (sl) {
      return {
        ...sl,
        components: sl.components.map(id => components[id]),
      };
    } else {
      return undefined;
    }
  }
);
