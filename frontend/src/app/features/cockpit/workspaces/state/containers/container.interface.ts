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

import { IComponents } from '../components/components.interface';
import { IServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.interface';

export interface IContainerBackendSSECommon {
  id: string;
  name: string;
  busId: string;
}
export interface IContainerBackendDetailsCommon {
  ip: string;
  port: number;
  systemInfo: string;
}

export interface IContainerBackendSSE extends IContainerBackendSSECommon {
  components: string[];
  serviceAssemblies: string[];
}

export interface IContainerBackendDetails extends IContainerBackendDetailsCommon {
  reachabilities: string[];
}

export interface IContainerUI {
  // for UI
  isFolded: boolean;
  isFetchingDetails: boolean;
  isDeployingComponent: boolean;
  errorDeploymentComponent: string;
  isDeployingServiceAssembly: boolean;
  errorDeploymentServiceAssembly: string;
}

export interface IContainerRow extends IContainerUI, IContainerBackendSSE, IContainerBackendDetails { }

export interface IContainer extends IContainerUI, IContainerBackendSSECommon, IContainerBackendDetailsCommon {
  components: IComponents;
  serviceAssemblies: IServiceAssemblies;
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
    reachabilities: []
  };
}
