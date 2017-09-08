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

import { IStore } from 'app/shared/state/store.interface';
import { IContainerRow } from './containers.interface';

export interface IContainerWithSiblings extends IContainerRow {
  siblings: IContainerRow[];
}

export const getContainersById = (state: IStore) => state.containers.byId;

export const getContainersAllIds = (state: IStore) => state.containers.allIds;

export const getSelectedContainer = createSelector(
  (state: IStore) => state.containers.selectedContainerId,
  getContainersById,
  (id, containers) => containers[id]
);

export const getCurrentContainerBus = createSelector(
  getSelectedContainer,
  (state: IStore) => state.buses.byId,
  (container, buses) => buses[container.busId]
);

export const getCurrentContainer = createSelector(
  getSelectedContainer,
  getCurrentContainerBus,
  getContainersById,
  (container, bus, containers) => {
    if (container) {
      return {
        ...container,
        siblings: bus.containers
          .filter(id => id !== container.id)
          .map(id => containers[id]),
      };
    } else {
      return undefined;
    }
  }
);
