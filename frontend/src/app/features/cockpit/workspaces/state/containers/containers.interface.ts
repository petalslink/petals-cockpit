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

import { emptyJsTable, JsTable } from '@shared/helpers/jstable.helper';
import {
  IContainerBackendDetails,
  IContainerBackendDetailsCommon,
  IContainerBackendSSE,
  IContainerBackendSSECommon,
} from '@shared/services/containers.service';
import { IServiceAssemblies } from '@wks/state/service-assemblies/service-assemblies.interface';
import { ISharedLibraries } from '@wks/state/shared-libraries/shared-libraries.interface';
import { IComponents } from '../components/components.interface';

export interface IContainerUI {
  // for UI
  isFolded: boolean;
  isComponentsCategoryFolded: boolean;
  isSharedLibrariesCategoryFolded: boolean;
  isServiceAssembliesCategoryFolded: boolean;
  isFetchingDetails: boolean;
  isDeployingComponent: boolean;
  errorDeploymentComponent: string;
  isDeployingServiceAssembly: boolean;
  errorDeploymentServiceAssembly: string;
  isDeployingSharedLibrary: boolean;
  errorDeploymentSharedLibrary: string;
}

export interface IContainerRow
  extends IContainerUI,
    IContainerBackendSSE,
    IContainerBackendDetails {}

export interface IContainer
  extends IContainerUI,
    IContainerBackendSSECommon,
    IContainerBackendDetailsCommon {
  components: IComponents;
  serviceAssemblies: IServiceAssemblies;
  sharedLibraries: ISharedLibraries;
}

export interface IContainersCommon {
  selectedContainerId: string;
}

export interface IContainersTable
  extends IContainersCommon,
    JsTable<IContainerRow> {}

export interface IContainers extends IContainersCommon {
  list: IContainer[];
}

export function containerRowFactory(): IContainerRow {
  return {
    id: null,
    name: null,
    busId: null,
    ip: undefined,
    port: undefined,
    systemInfo: undefined,
    isReachable: undefined,

    isFolded: false,
    isComponentsCategoryFolded: false,
    isSharedLibrariesCategoryFolded: false,
    isServiceAssembliesCategoryFolded: false,
    isFetchingDetails: false,
    isDeployingComponent: false,
    errorDeploymentComponent: '',
    isDeployingServiceAssembly: false,
    errorDeploymentServiceAssembly: '',
    isDeployingSharedLibrary: false,
    errorDeploymentSharedLibrary: '',

    components: [],
    serviceAssemblies: [],
    reachabilities: [],
    sharedLibraries: [],
  };
}

export function containersTableFactory(): IContainersTable {
  return {
    ...emptyJsTable<IContainerRow>(),
    selectedContainerId: '',
  };
}
