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

import { IContainersTable, containersTableFactory } from './containers.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { getContainerOfComponent } from '../../../../../shared/helpers/component.helper';
import { Components } from '../components/components.reducer';
import { putAll, updateById } from 'app/shared/helpers/map.helper';
import { containerRowFactory } from 'app/features/cockpit/workspaces/state/containers/container.interface';

export class Containers {
  private static reducerName = '[Containers]';

  public static reducer(containersTable = containersTableFactory(), { type, payload }: Action): IContainersTable {
    if (!Containers.mapActionsToMethod[type]) {
      return containersTable;
    }

    return Containers.mapActionsToMethod[type](containersTable, payload) || containersTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINERS_SUCCESS = `${Containers.reducerName} Fetch containers success`;
  private static fetchContainersSuccess(containersTable: IContainersTable, payload): IContainersTable {
    return putAll(containersTable, payload, containerRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_CONTAINER = `${Containers.reducerName} Fold container`;
  private static foldContainers(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    if (!containersTable.byId[payload.containerId] || containersTable.byId[payload.containerId].isFolded) {
      return containersTable;
    }

    return updateById(containersTable, payload.containerId, { isFolded: true });
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_CONTAINER = `${Containers.reducerName} Unfold container`;
  private static unfoldContainer(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    if (!containersTable.byId[payload.containerId] || !containersTable.byId[payload.containerId].isFolded) {
      return containersTable;
    }

    return updateById(containersTable, payload.containerId, { isFolded: false });
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_CONTAINER = `${Containers.reducerName} Toggle fold container`;
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
  public static SET_CURRENT_CONTAINER = `${Containers.reducerName} Set current container`;
  private static setCurrentContainer(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    const res = <IContainersTable>{
      selectedContainerId: payload.containerId
    };

    if (payload.containerId) {
      return {
        ...updateById(containersTable, payload.containerId, { errorDeployment: '' }),
        ...res
      };
    }

    return {
      ...containersTable,
      ...res
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS = `${Containers.reducerName} Fetch container details`;
  private static fetchContainerDetails(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    return updateById(containersTable, payload.containerId, { isFetchingDetails: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS_SUCCESS = `${Containers.reducerName} Fetch container details success`;
  private static fetchContainerDetailsSuccess(
    containersTable: IContainersTable,
    payload: { containerId: string, data: any }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, { ...payload.data, isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS_ERROR = `${Containers.reducerName} Fetch container details error`;
  private static fetchContainerDetailsError(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    return updateById(containersTable, payload.containerId, { isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_COMPONENT = `${Containers.reducerName} Deploy component`;
  private static deployComponent(containersTable: IContainersTable, payload: { containerId: string }): IContainersTable {
    return updateById(containersTable, payload.containerId, { isDeployingComponent: true });
  }
  // tslint:disable-next-line:member-ordering
  public static DEPLOY_COMPONENT_ERROR = `${Containers.reducerName} Deploy component error`;
  private static deployComponentError(
    containersTable: IContainersTable,
    payload: { containerId: string, errorDeployment: string }): IContainersTable {
    return updateById(containersTable, payload.containerId, { isDeployingComponent: false, errorDeployment: payload.errorDeployment });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_COMPONENT_SUCCESS = `${Containers.reducerName} Deploy component success`;
  private static deployComponentSuccess(
    containersTable: IContainersTable,
    payload: { containerId: string, component: { id: string, name: string, state: string } }
  ): IContainersTable {
    const container = containersTable.byId[payload.containerId];

    return updateById(containersTable, payload.containerId, {
      components: [...Array.from(new Set([...container.components, payload.component.id]))],
      isDeployingComponent: false,
      errorDeployment: ''
    });
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
    [Containers.DEPLOY_COMPONENT]: Containers.deployComponent,
    [Containers.DEPLOY_COMPONENT_ERROR]: Containers.deployComponentError,
    [Containers.DEPLOY_COMPONENT_SUCCESS]: Containers.deployComponentSuccess,

    [Components.REMOVE_COMPONENT]: Containers.removeComponent,
    [Workspaces.CLEAN_WORKSPACE]: Containers.cleanWorkspace
  };
}
