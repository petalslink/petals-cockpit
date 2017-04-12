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

import { Action } from '@ngrx/store';

import { IContainersTable } from './containers.interface';
import { containersTableFactory } from './containers.initial-state';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { getContainerOfComponent } from '../../../../../shared/helpers/component.helper';
import { Components } from '../components/components.reducer';
import { putAll, updateById } from 'app/shared/helpers/shared.helper';

export class Containers {
  private static reducerName = 'CONTAINERS_REDUCER';

  public static reducer(containersTable = containersTableFactory(), { type, payload }: Action): IContainersTable {
    if (!Containers.mapActionsToMethod[type]) {
      return containersTable;
    }

    return Containers.mapActionsToMethod[type](containersTable, payload) || containersTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINERS_SUCCESS = `${Containers.reducerName}_FETCH_CONTAINERS_SUCCESS`;
  private static fetchContainersSuccess(containersTable: IContainersTable, payload): IContainersTable {
    const table = putAll(containersTable, payload);

    payload.allIds.forEach(id => {
      // when we fetch containers, the server doesn't add reachabilites
      // set it to empty array by default
      if (!table.byId[id].reachabilities) {
        table.byId[id].reachabilities = [];
      }
    });

    return table;
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_CONTAINER = `${Containers.reducerName}_FOLD_CONTAINER`;
  private static foldContainers(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    if (!containersTable.byId[payload.containerId] || containersTable.byId[payload.containerId].isFolded) {
      return containersTable;
    }

    return updateById(containersTable, payload.containerId, { isFolded: true });
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_CONTAINER = `${Containers.reducerName}_UNFOLD_CONTAINER`;
  private static unfoldContainer(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    if (!containersTable.byId[payload.containerId] || !containersTable.byId[payload.containerId].isFolded) {
      return containersTable;
    }

    return updateById(containersTable, payload.containerId, { isFolded: false });
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_CONTAINER = `${Containers.reducerName}_TOGGLE_FOLD_CONTAINER`;
  private static toggleFoldContainer(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    const container = containersTable.byId[payload.containerId];

    if (!container) {
      return containersTable;
    }

    if (container.isFolded) {
      return Containers.unfoldContainer(containersTable, payload);
    }

    return Containers.foldContainers(containersTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_CONTAINER = `${Containers.reducerName}_SET_CURRENT_CONTAINER`;
  private static setCurrentContainer(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    return {
      ...containersTable,
      ...<IContainersTable>{
        selectedContainerId: payload.containerId
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS = `${Containers.reducerName}_FETCH_CONTAINER_DETAILS`;
  private static fetchContainerDetails(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    return updateById(containersTable, payload.containerId, { isFetchingDetails: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS_SUCCESS = `${Containers.reducerName}_FETCH_CONTAINER_DETAILS_SUCCESS`;
  private static fetchContainerDetailsSuccess(
    containersTable: IContainersTable,
    payload: { containerId: string, data: any }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, { ...payload.data, isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS_ERROR = `${Containers.reducerName}_FETCH_CONTAINER_DETAILS_ERROR`;
  private static fetchContainerDetailsError(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    if (!containersTable.byId[payload.containerId]) {
      return containersTable;
    }

    return updateById(containersTable, payload.containerId, { isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  private static removeComponent(containersTable: IContainersTable, payload: { componentId: string }): IContainersTable {
    const containerContainingComponent = getContainerOfComponent(containersTable, payload.componentId);
    if (!containerContainingComponent) {
      return containersTable;
    }

    return updateById(containersTable, containerContainingComponent.id, {
      components: containersTable
        .byId[containerContainingComponent.id]
        .components
        .filter(id => id !== payload.componentId)
    });
  }

  private static cleanWorkspace(_containersTable: IContainersTable, _payload): IContainersTable {
    return containersTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: { [type: string]: (t: IContainersTable, p: any) => IContainersTable } = {
    [Containers.FETCH_CONTAINERS_SUCCESS]: Containers.fetchContainersSuccess,
    [Containers.FOLD_CONTAINER]: Containers.foldContainers,
    [Containers.UNFOLD_CONTAINER]: Containers.unfoldContainer,
    [Containers.TOGGLE_FOLD_CONTAINER]: Containers.toggleFoldContainer,
    [Containers.SET_CURRENT_CONTAINER]: Containers.setCurrentContainer,
    [Containers.FETCH_CONTAINER_DETAILS]: Containers.fetchContainerDetails,
    [Containers.FETCH_CONTAINER_DETAILS_SUCCESS]: Containers.fetchContainerDetailsSuccess,
    [Containers.FETCH_CONTAINER_DETAILS_ERROR]: Containers.fetchContainerDetailsError,

    [Components.REMOVE_COMPONENT]: Containers.removeComponent,
    [Workspaces.CLEAN_WORKSPACE]: Containers.cleanWorkspace
  };
}
