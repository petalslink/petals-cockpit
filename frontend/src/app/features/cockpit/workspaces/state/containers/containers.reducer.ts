/**
 * Copyright (C) 2017-2020 Linagora
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

import {
  JsTable,
  mergeOnly,
  putAll,
  updateById,
} from '@shared/helpers/jstable.helper';
import { fold, toggleFold, unfold } from '@shared/helpers/reducers.helper';
import { IComponentBackendSSE } from '@shared/services/components.service';
import {
  IContainerBackendDetails,
  IContainerBackendSSE,
} from '@shared/services/containers.service';
import { IServiceAssemblyBackendSSE } from '@shared/services/service-assemblies.service';
import { ISharedLibraryBackendSSE } from '@shared/services/shared-libraries.service';
import { Components } from '@wks/state/components/components.actions';
import { IComponentRow } from '@wks/state/components/components.interface';
import { Containers } from '@wks/state/containers/containers.actions';
import { ServiceAssemblies } from '@wks/state/service-assemblies/service-assemblies.actions';
import { IServiceAssemblyRow } from '@wks/state/service-assemblies/service-assemblies.interface';
import { SharedLibraries } from '@wks/state/shared-libraries/shared-libraries.actions';
import { ISharedLibraryRow } from '@wks/state/shared-libraries/shared-libraries.interface';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import {
  containerRowFactory,
  containersTableFactory,
  IContainerRow,
  IContainersTable,
} from './containers.interface';

export namespace ContainersReducer {
  type All =
    | Containers.Fetched
    | Containers.Added
    | Containers.SetCurrent
    | Containers.FetchDetails
    | Containers.FetchDetailsError
    | Containers.FetchDetailsSuccess
    | Containers.Fold
    | Containers.Unfold
    | Containers.ToggleFold
    | Containers.DeployServiceAssembly
    | Containers.DeployServiceAssemblyError
    | Containers.DeployServiceAssemblySuccess
    | Containers.DeploySharedLibrary
    | Containers.DeploySharedLibraryError
    | Containers.DeploySharedLibrarySuccess
    | Containers.DeployComponent
    | Containers.DeployComponentError
    | Containers.DeployComponentSuccess
    | Containers.CleanArtifactDeploymentError
    | Components.Added
    | Components.Removed
    | ServiceAssemblies.Added
    | ServiceAssemblies.Removed
    | SharedLibraries.Added
    | SharedLibraries.Removed
    | Workspaces.Clean;

  export function reducer(
    table = containersTableFactory(),
    action: All
  ): IContainersTable {
    switch (action.type) {
      case Containers.FetchedType: {
        return fetched(table, action.payload);
      }
      case Containers.AddedType: {
        return added(table, action.payload);
      }
      case Containers.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case Containers.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case Containers.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case Containers.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case Containers.FoldType: {
        return fold<IContainerRow, IContainersTable>(
          table,
          action.payload,
          getFoldProperty(action.payload)
        );
      }
      case Containers.UnfoldType: {
        return unfold<IContainerRow, IContainersTable>(
          table,
          action.payload,
          getFoldProperty(action.payload)
        );
      }
      case Containers.ToggleFoldType: {
        return toggleFold<IContainerRow, IContainersTable>(
          table,
          action.payload,
          getFoldProperty(action.payload)
        );
      }
      case Containers.DeployServiceAssemblyType: {
        return deployServiceAssembly(table, action.payload);
      }
      case Containers.DeployServiceAssemblyErrorType: {
        return deployServiceAssemblyError(table, action.payload);
      }
      case Containers.DeployServiceAssemblySuccessType: {
        return deployServiceAssemblySuccess(table, action.payload);
      }
      case Containers.DeploySharedLibraryType: {
        return deploySharedLibrary(table, action.payload);
      }
      case Containers.DeploySharedLibraryErrorType: {
        return deploySharedLibraryError(table, action.payload);
      }
      case Containers.DeploySharedLibrarySuccessType: {
        return deploySharedLibrarySuccess(table, action.payload);
      }
      case Containers.DeployComponentType: {
        return deployComponent(table, action.payload);
      }
      case Containers.DeployComponentErrorType: {
        return deployComponentError(table, action.payload);
      }
      case Containers.DeployComponentSuccessType: {
        return deployComponentSuccess(table, action.payload);
      }
      case Containers.CleanArtifactDeploymentErrorType: {
        return cleanArtifactDeploymentError(table, action.payload);
      }
      case ServiceAssemblies.AddedType: {
        return serviceAssembliesAdded(table, action.payload);
      }
      case ServiceAssemblies.RemovedType: {
        return removeServiceAssembly(table, action.payload);
      }
      case Components.AddedType: {
        return componentsAdded(table, action.payload);
      }
      case Components.RemovedType: {
        return removeComponent(table, action.payload);
      }
      case SharedLibraries.AddedType: {
        return sharedLibrariesAdded(table, action.payload);
      }
      case SharedLibraries.RemovedType: {
        return removeSharedLibrary(table, action.payload);
      }
      case Workspaces.CleanType: {
        return containersTableFactory();
      }
      default:
        return table;
    }
  }

  function getFoldProperty(
    payload: Containers.FoldPayload
  ): keyof IContainerRow {
    switch (payload.type) {
      case 'components':
        return 'isComponentsCategoryFolded';
      case 'shared-libraries':
        return 'isSharedLibrariesCategoryFolded';
      case 'service-assemblies':
        return 'isServiceAssembliesCategoryFolded';
      default:
        return undefined;
    }
  }

  function fetched(
    table: IContainersTable,
    payload: JsTable<IContainerBackendSSE>
  ) {
    return mergeOnly(table, payload, containerRowFactory);
  }

  function added(
    table: IContainersTable,
    payload: JsTable<IContainerBackendSSE>
  ) {
    return putAll(table, payload, containerRowFactory);
  }

  function setCurrent(
    table: IContainersTable,
    payload: { id: string }
  ): IContainersTable {
    const res = {
      selectedContainerId: payload.id,
    };

    if (payload.id) {
      return {
        ...updateById(table, payload.id, {
          errorDeploymentComponent: '',
        }),
        ...res,
      };
    }

    return {
      ...table,
      ...res,
    };
  }

  function fetchDetails(table: IContainersTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: true,
    });
  }

  function fetchDetailsSuccess(
    table: IContainersTable,
    payload: { id: string; data: IContainerBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(table: IContainersTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }

  function deployComponent(table: IContainersTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isDeployingComponent: true,
    });
  }

  function deployComponentError(
    table: IContainersTable,
    payload: { id: string; errorDeployment: string }
  ) {
    return updateById(table, payload.id, {
      isDeployingComponent: false,
      errorDeploymentComponent: payload.errorDeployment,
    });
  }

  function deployComponentSuccess(
    table: IContainersTable,
    payload: IComponentBackendSSE
  ) {
    return updateById(table, payload.containerId, {
      isDeployingComponent: false,
      errorDeploymentComponent: '',
    });
  }

  function deployServiceAssembly(
    table: IContainersTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isDeployingServiceAssembly: true,
    });
  }

  function deployServiceAssemblyError(
    table: IContainersTable,
    payload: { id: string; errorDeployment: string }
  ) {
    return updateById(table, payload.id, {
      isDeployingServiceAssembly: false,
      errorDeploymentServiceAssembly: payload.errorDeployment,
    });
  }

  function deployServiceAssemblySuccess(
    table: IContainersTable,
    payload: IServiceAssemblyBackendSSE
  ) {
    return updateById(table, payload.containerId, {
      isDeployingServiceAssembly: false,
      errorDeploymentServiceAssembly: '',
    });
  }

  function deploySharedLibrary(
    table: IContainersTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isDeployingSharedLibrary: true,
    });
  }

  function deploySharedLibraryError(
    table: IContainersTable,
    payload: { id: string; errorDeployment: string }
  ) {
    return updateById(table, payload.id, {
      isDeployingSharedLibrary: false,
      errorDeploymentSharedLibrary: payload.errorDeployment,
    });
  }

  function deploySharedLibrarySuccess(
    table: IContainersTable,
    payload: ISharedLibraryBackendSSE
  ) {
    return updateById(table, payload.containerId, {
      isDeployingSharedLibrary: false,
      errorDeploymentSharedLibrary: '',
    });
  }

  function cleanArtifactDeploymentError(
    table: IContainersTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      errorDeploymentComponent: '',
      errorDeploymentServiceAssembly: '',
      errorDeploymentSharedLibrary: '',
    });
  }

  function componentsAdded(
    table: IContainersTable,
    payload: JsTable<IComponentBackendSSE>
  ) {
    return payload.allIds.reduce((t, c) => {
      const component = payload.byId[c];
      const container = t.byId[component.containerId];
      return updateById(t, container.id, {
        components: Array.from(
          new Set([...container.components, component.id])
        ),
      });
    }, table);
  }

  function serviceAssembliesAdded(
    table: IContainersTable,
    payload: JsTable<IServiceAssemblyBackendSSE>
  ) {
    return payload.allIds.reduce((t, c) => {
      const sa = payload.byId[c];
      const container = t.byId[sa.containerId];
      return updateById(t, container.id, {
        serviceAssemblies: Array.from(
          new Set([...container.serviceAssemblies, sa.id])
        ),
      });
    }, table);
  }

  function sharedLibrariesAdded(
    table: IContainersTable,
    payload: JsTable<ISharedLibraryBackendSSE>
  ) {
    return payload.allIds.reduce((t, c) => {
      const sl = payload.byId[c];
      const container = t.byId[sl.containerId];
      return updateById(t, container.id, {
        sharedLibraries: Array.from(
          new Set([...container.sharedLibraries, sl.id])
        ),
      });
    }, table);
  }

  function removeComponent(table: IContainersTable, payload: IComponentRow) {
    return updateById(table, payload.containerId, {
      components: table.byId[payload.containerId].components.filter(
        id => id !== payload.id
      ),
    });
  }

  function removeServiceAssembly(
    table: IContainersTable,
    payload: IServiceAssemblyRow
  ) {
    return updateById(table, payload.containerId, {
      serviceAssemblies: table.byId[
        payload.containerId
      ].serviceAssemblies.filter(id => id !== payload.id),
    });
  }

  function removeSharedLibrary(
    table: IContainersTable,
    payload: ISharedLibraryRow
  ): IContainersTable {
    return updateById(table, payload.containerId, {
      sharedLibraries: table.byId[payload.containerId].sharedLibraries.filter(
        id => id !== payload.id
      ),
    });
  }
}
