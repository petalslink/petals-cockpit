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

import { createSelector } from '@ngrx/store';

import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { IStore } from 'app/shared/state/store.interface';

export const getServicesById = (state: IStore) => state.services.byId;

export const getServicesAllIds = (state: IStore) => state.services.allIds;

export const getSelectedService = createSelector(
  (state: IStore) => state.services.selectedServiceId,
  getServicesById,
  (id, ss): IServiceRow => ss[id]
);

export const getAllServices = createSelector(
  getServicesAllIds,
  getServicesById,
  (ids, byId) => {
    return ids.map(id => byId[id]);
  }
);
