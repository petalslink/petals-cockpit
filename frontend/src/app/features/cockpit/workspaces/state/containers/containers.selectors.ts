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

import { IBusRow } from 'app/features/cockpit/workspaces/state/buses/buses.interface';
import { getBusesById } from 'app/features/cockpit/workspaces/state/buses/buses.selectors';
import { getComponentsById } from 'app/features/cockpit/workspaces/state/components/components.selectors';
import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/containers.interface';
import { IStore } from 'app/shared/state/store.interface';

export interface IContainerWithSiblings extends IContainerRow {
  siblings: IContainerRow[];
}

export function getContainersById(state: IStore) {
  return state.containers.byId;
}

export function getContainersAllIds(state: IStore) {
  return state.containers.allIds;
}

export const getSelectedContainer = createSelector(
  (state: IStore) => state.containers.selectedContainerId,
  getContainersById,
  (id, containers): IContainerRow => containers[id]
);

export const getCurrentContainerBus = createSelector(
  getSelectedContainer,
  getBusesById,
  (container, buses): IBusRow =>
    container ? buses[container.busId] : undefined
);

export const getCurrentContainer = createSelector(
  getSelectedContainer,
  getCurrentContainerBus,
  getContainersById,
  (container, bus, containers): IContainerWithSiblings => {
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

/**
 * useful to know whether a component already has a given container
 * without having to loop on the whole component.containers array,
 * only by trying to access it's key
 * @returns
 */
export const componentsOfCurrentContainerByName = createSelector(
  getCurrentContainer,
  getComponentsById,
  (currentContainer, componentsById) =>
    currentContainer.components.reduce(
      (acc, componentId) => {
        const component = componentsById[componentId];
        const componentName = component.name.trim().toLowerCase();

        acc[componentName] = true;
        return acc;
      },
      <{ [name: string]: boolean }>{}
    )
);
