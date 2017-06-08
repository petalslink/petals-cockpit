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

import { JsMap, emptyJavascriptMap } from 'app/shared/helpers/map.helper';
import { IComponents } from '../components/components.interface';
import { IServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';
import {
  IContainerBackendSSE,
  IContainerBackendDetails,
  IContainerBackendSSECommon,
  IContainerBackendDetailsCommon,
} from 'app/shared/services/containers.service';
import { ISharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';

export interface IContainerUI {
  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
  isDeployingComponent: boolean;
  errorDeploymentComponent: string;
  isDeployingServiceAssembly: boolean;
  errorDeploymentServiceAssembly: string;
}

export interface IContainerRow extends IContainerUI, IContainerBackendSSE, IContainerBackendDetails {}

export interface IContainer extends IContainerUI, IContainerBackendSSECommon, IContainerBackendDetailsCommon {
  components: IComponents;
  serviceAssemblies: IServiceAssemblies;
  sharedLibraries: ISharedLibraries;
}

export interface IContainersCommon {
  selectedContainerId: string;
  isFetchingDetails: boolean;
}

export interface IContainersTable extends IContainersCommon, JsMap<
  IContainerRow
> {}

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

    isFolded: false,
    isFetchingDetails: false,
    isDeployingComponent: false,
    errorDeploymentComponent: '',
    isDeployingServiceAssembly: false,
    errorDeploymentServiceAssembly: '',

    components: [],
    serviceAssemblies: [],
    reachabilities: [],
    sharedLibraries: [],
  };
}

export function containersTableFactory(): IContainersTable {
  return Object.assign({}, emptyJavascriptMap<IContainerRow>(), {
    selectedContainerId: '',
    isFetchingDetails: false,
  });
}
