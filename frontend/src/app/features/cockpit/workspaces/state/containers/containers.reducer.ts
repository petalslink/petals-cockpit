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

import {
  IContainerBackendSSE,
  IContainerBackendDetails,
} from 'app/shared/services/containers.service';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import {
  IContainersTable,
  containersTableFactory,
  containerRowFactory,
} from './containers.interface';
import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/components.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { Components } from '../components/components.reducer';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import {
  putAll,
  updateById,
  mergeOnly,
  JsMap,
} from 'app/shared/helpers/map.helper';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';

export class Containers {
  private static reducerName = '[Containers]';

  public static reducer(
    containersTable = containersTableFactory(),
    { type, payload }: Action
  ): IContainersTable {
    if (!Containers.mapActionsToMethod[type]) {
      return containersTable;
    }

    return (
      Containers.mapActionsToMethod[type](containersTable, payload) ||
      containersTable
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINERS_SUCCESS = `${Containers.reducerName} Fetch containers success`;
  private static fetchContainersSuccess(
    containersTable: IContainersTable,
    payload: JsMap<IContainerBackendSSE>
  ): IContainersTable {
    return mergeOnly(containersTable, payload, containerRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static ADD_CONTAINERS_SUCCESS = `${Containers.reducerName} Add containers success`;
  private static addContainersSuccess(
    containersTable: IContainersTable,
    payload: JsMap<IContainerBackendSSE>
  ): IContainersTable {
    return putAll(containersTable, payload, containerRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_CONTAINER = `${Containers.reducerName} Fold container`;
  private static foldContainers(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    if (
      !containersTable.byId[payload.containerId] ||
      containersTable.byId[payload.containerId].isFolded
    ) {
      return containersTable;
    }

    return updateById(containersTable, payload.containerId, { isFolded: true });
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_CONTAINER = `${Containers.reducerName} Unfold container`;
  private static unfoldContainer(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    if (
      !containersTable.byId[payload.containerId] ||
      !containersTable.byId[payload.containerId].isFolded
    ) {
      return containersTable;
    }

    return updateById(containersTable, payload.containerId, {
      isFolded: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_CONTAINER = `${Containers.reducerName} Toggle fold container`;
  private static toggleFoldContainer(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
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
  private static setCurrentContainer(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    const res = <IContainersTable>{
      selectedContainerId: payload.containerId,
    };

    if (payload.containerId) {
      return {
        ...updateById(containersTable, payload.containerId, {
          errorDeploymentComponent: '',
        }),
        ...res,
      };
    }

    return {
      ...containersTable,
      ...res,
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS = `${Containers.reducerName} Fetch container details`;
  private static fetchContainerDetails(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isFetchingDetails: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS_SUCCESS = `${Containers.reducerName} Fetch container details success`;
  private static fetchContainerDetailsSuccess(
    containersTable: IContainersTable,
    payload: { containerId: string; data: IContainerBackendDetails }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINER_DETAILS_ERROR = `${Containers.reducerName} Fetch container details error`;
  private static fetchContainerDetailsError(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_COMPONENT = `${Containers.reducerName} Deploy component`;
  private static deployComponent(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isDeployingComponent: true,
    });
  }
  // tslint:disable-next-line:member-ordering
  public static DEPLOY_COMPONENT_ERROR = `${Containers.reducerName} Deploy component error`;
  private static deployComponentError(
    containersTable: IContainersTable,
    payload: { containerId: string; errorDeploymentComponent: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isDeployingComponent: false,
      errorDeploymentComponent: payload.errorDeploymentComponent,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_COMPONENT_SUCCESS = `${Containers.reducerName} Deploy component success`;
  private static deployComponentSuccess(
    containersTable: IContainersTable,
    payload: IComponentRow
  ): IContainersTable {
    const container = containersTable.byId[payload.containerId];

    return updateById(containersTable, payload.containerId, {
      components: [...container.components, payload.id],
      isDeployingComponent: false,
      errorDeploymentComponent: '',
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_ASSEMBLY = `${Containers.reducerName} Deploy service assembly`;
  private static deployServiceAssembly(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isDeployingServiceAssembly: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_ASSEMBLY_ERROR = `${Containers.reducerName} Deploy service assembly error`;
  private static deployServiceAssemblyError(
    containersTable: IContainersTable,
    payload: { containerId: string; errorDeploymentServiceAssembly: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isDeployingServiceAssembly: false,
      errorDeploymentServiceAssembly: payload.errorDeploymentServiceAssembly,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_ASSEMBLY_SUCCESS = `${Containers.reducerName} Deploy service assembly success`;
  private static deployServiceAssemblySuccess(
    containersTable: IContainersTable,
    payload: IServiceAssemblyBackendSSE
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      serviceAssemblies: [
        ...containersTable.byId[payload.containerId].serviceAssemblies,
        payload.id,
      ],
      isDeployingServiceAssembly: false,
      errorDeploymentServiceAssembly: '',
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SHARED_LIBRARY = `${Containers.reducerName} Deploy shared library`;
  private static deploySharedLibrary(
    containersTable: IContainersTable,
    payload: { containerId: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isDeployingSharedLibrary: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SHARED_LIBRARY_ERROR = `${Containers.reducerName} Deploy shared library error`;
  private static deploySharedLibraryError(
    containersTable: IContainersTable,
    payload: { containerId: string; errorDeploymentSharedLibrary: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      isDeployingSharedLibrary: false,
      errorDeploymentSharedLibrary: payload.errorDeploymentSharedLibrary,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SHARED_LIBRARY_SUCCESS = `${Containers.reducerName} Deploy shared library success`;
  private static deploySharedLibrarySuccess(
    containersTable: IContainersTable,
    payload: ISharedLibraryBackendSSE
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      sharedLibraries: [
        ...containersTable.byId[payload.containerId].sharedLibraries,
        payload.id,
      ],
      isDeployingSharedLibrary: false,
      errorDeploymentSharedLibrary: '',
    });
  }

  // tslint:disable-next-line:member-ordering
  private static removeComponent(
    containersTable: IContainersTable,
    payload: IComponentRow
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      components: containersTable.byId[payload.containerId].components.filter(
        id => id !== payload.id
      ),
    });
  }

  // tslint:disable-next-line:member-ordering
  private static removeServiceAssembly(
    containersTable: IContainersTable,
    payload: { containerId: string; serviceAssemblyId: string }
  ): IContainersTable {
    return updateById(containersTable, payload.containerId, {
      serviceAssemblies: containersTable.byId[
        payload.containerId
      ].serviceAssemblies.filter(id => id !== payload.serviceAssemblyId),
    });
  }

  private static cleanWorkspace(
    _containersTable: IContainersTable,
    _payload
  ): IContainersTable {
    return containersTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: {
    [type: string]: (t: IContainersTable, p: any) => IContainersTable;
  } = {
    [Containers.FETCH_CONTAINERS_SUCCESS]: Containers.fetchContainersSuccess,
    [Containers.ADD_CONTAINERS_SUCCESS]: Containers.addContainersSuccess,
    [Containers.FOLD_CONTAINER]: Containers.foldContainers,
    [Containers.UNFOLD_CONTAINER]: Containers.unfoldContainer,
    [Containers.TOGGLE_FOLD_CONTAINER]: Containers.toggleFoldContainer,
    [Containers.SET_CURRENT_CONTAINER]: Containers.setCurrentContainer,
    [Containers.FETCH_CONTAINER_DETAILS]: Containers.fetchContainerDetails,
    [Containers.FETCH_CONTAINER_DETAILS_SUCCESS]:
      Containers.fetchContainerDetailsSuccess,
    [Containers.FETCH_CONTAINER_DETAILS_ERROR]:
      Containers.fetchContainerDetailsError,
    [Containers.DEPLOY_COMPONENT]: Containers.deployComponent,
    [Containers.DEPLOY_COMPONENT_ERROR]: Containers.deployComponentError,
    [Containers.DEPLOY_COMPONENT_SUCCESS]: Containers.deployComponentSuccess,
    [Containers.DEPLOY_SERVICE_ASSEMBLY]: Containers.deployServiceAssembly,
    [Containers.DEPLOY_SERVICE_ASSEMBLY_SUCCESS]:
      Containers.deployServiceAssemblySuccess,
    [Containers.DEPLOY_SERVICE_ASSEMBLY_ERROR]:
      Containers.deployServiceAssemblyError,
    [Containers.DEPLOY_SHARED_LIBRARY]: Containers.deploySharedLibrary,
    [Containers.DEPLOY_SHARED_LIBRARY_SUCCESS]:
      Containers.deploySharedLibrarySuccess,
    [Containers.DEPLOY_SHARED_LIBRARY_ERROR]:
      Containers.deploySharedLibraryError,

    [Components.REMOVE_COMPONENT]: Containers.removeComponent,
    [ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY]:
      Containers.removeServiceAssembly,
    [Workspaces.CLEAN_WORKSPACE]: Containers.cleanWorkspace,
  };
}
