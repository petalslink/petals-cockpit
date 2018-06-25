/**
 * Copyright (C) 2017-2018 Linagora
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

import { TreeElement } from '@shared/components/material-tree/material-tree.component';
import { findNamespaceLocalpart } from '@shared/helpers/services-list.helper';
import { IStore } from '@shared/state/store.interface';
import { getBusesById } from '@wks/state/buses/buses.selectors';
import { getContainersById } from '@wks/state/containers/containers.selectors';
import {
  IEndpoint,
  IEndpointRow,
} from '@wks/state/endpoints/endpoints.interface';
import {
  IInterfaceRow,
  IInterfaceRowWithQName,
} from '@wks/state/interfaces/interfaces.interface';
import { getInterfacesById } from '@wks/state/interfaces/interfaces.selectors';
import {
  IServiceRow,
  IServiceRowWithQName,
} from '@wks/state/services/services.interface';
import { getServicesById } from '@wks/state/services/services.selectors';
import { getSelectedWorkspaceId } from '@wks/state/workspaces/workspaces.selectors';
import { IBusRow } from '../buses/buses.interface';
import { IComponentRow } from '../components/components.interface';
import { getComponentsById } from '../components/components.selectors';
import { IContainerRow } from '../containers/containers.interface';

export interface IEndpointOverview extends IEndpoint {
  service: IServiceRowWithQName;
  interfaces: IInterfaceRowWithQName[];
  bus: IBusRow;
  container: IContainerRow;
  component: IComponentRow;
}

export function getEndpointsById(state: IStore) {
  return state.endpoints.byId;
}

export function getEndpointsAllIds(state: IStore) {
  return state.endpoints.allIds;
}

export function getEndpointService(state: IStore) {
  return state.endpoints.selectedEndpointService;
}

export function getEndpointInterfaces(state: IStore) {
  return state.endpoints.selectedEndpointInterfaces;
}

export function getSelectedEndpointId(state: IStore) {
  return state.endpoints.selectedEndpointId;
}

export const getSelectedEndpoint = createSelector(
  getSelectedEndpointId,
  getEndpointsById,
  (id, endpoints): IEndpointRow => endpoints[id]
);

export const getAllEndpoints = createSelector(
  getEndpointsAllIds,
  getEndpointsById,
  (ids, byId) => {
    return ids.map(id => byId[id]);
  }
);

export const getCurrentEndpointServiceInterfaces = createSelector(
  getSelectedEndpoint,
  getEndpointService,
  getEndpointInterfaces,
  getServicesById,
  getInterfacesById,
  getComponentsById,
  getContainersById,
  getBusesById,
  (
    endpoint,
    endpointService,
    endpointInterfaces,
    servicesByIds,
    interfacesByIds,
    componentsByIds,
    containersByIds,
    busesByIds
  ): IEndpointOverview => {
    if (endpoint) {
      const svc = servicesByIds[endpointService]
        ? servicesByIds[endpointService]
        : ({} as IServiceRow);
      const comp = componentsByIds[endpoint.componentId]
        ? componentsByIds[endpoint.componentId]
        : ({} as IComponentRow);
      const cont = containersByIds[comp.containerId]
        ? containersByIds[comp.containerId]
        : ({} as IContainerRow);
      const bus = busesByIds[cont.busId]
        ? busesByIds[cont.busId]
        : ({} as IBusRow);
      const qNameSvc = findNamespaceLocalpart(svc.name);
      const intMap = new Map<string, { nsp: string; local: string }>();
      const filteredEndpointInterfaces = endpointInterfaces.filter(
        id => interfacesByIds[id]
      );

      for (const id of filteredEndpointInterfaces) {
        const qName = findNamespaceLocalpart(interfacesByIds[id].name);
        intMap.set(id, { nsp: qName.namespace, local: qName.localpart });
      }

      return {
        ...endpoint,
        component: comp,
        container: cont,
        bus: bus,
        service: {
          ...svc,
          namespace: qNameSvc.namespace,
          localpart: qNameSvc.localpart,
        },
        interfaces: filteredEndpointInterfaces.map(id => {
          const itf = interfacesByIds[id] as IInterfaceRow;
          return {
            ...itf,
            namespace: intMap.get(id).nsp,
            localpart: intMap.get(id).local,
          };
        }),
      };
    } else {
      return undefined;
    }
  }
);

export const getCurrentEndpointTree = createSelector(
  getSelectedWorkspaceId,
  getEndpointsAllIds,
  getEndpointsById,
  (
    selectedWorkspaceId,
    endpointsAllIds,
    endpointsByIds
  ): TreeElement<any>[] => {
    const baseUrl = `/workspaces/${selectedWorkspaceId}/services/endpoints`;

    const endpoints = endpointsAllIds.map(id => ({
      name: endpointsByIds[id].name,
      id,
    }));

    return endpoints.map(edp => ({
      name: edp.name,
      isFolded: false,
      cssClass: `item-edpName`,
      link: `${baseUrl}/${edp.id}`,
      children: [],
    }));
  }
);
