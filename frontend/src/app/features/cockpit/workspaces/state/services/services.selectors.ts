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

import { IEndpointRow } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.interface';
import { getEndpointsById } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.selectors';
import { IInterfaceRow } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.interface';
import {
  getInterfacesById,
  IInterfaceRowWithQName,
} from 'app/features/cockpit/workspaces/state/interfaces/interfaces.selectors';
import {
  IService,
  IServiceRow,
} from 'app/features/cockpit/workspaces/state/services/services.interface';
import { getSelectedWorkspaceId } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';
import {
  findNamespaceLocalpart,
  groupByNamespace,
} from 'app/shared/helpers/services-list.helper';
import { IStore } from 'app/shared/state/store.interface';

export interface IServiceRowWithQName extends IServiceRow {
  namespace: string;
  localpart: string;
}

export interface IServiceOverview extends IService {
  interfaces: IInterfaceRowWithQName[];
  endpoints: IEndpointRow[];
  namespace: string;
  localpart: string;
}

export function getServicesById(state: IStore) {
  return state.services.byId;
}

export function getServicesAllIds(state: IStore) {
  return state.services.allIds;
}

export function getServiceInterfaces(state: IStore) {
  return state.services.selectedServiceInterfaces;
}

export function getServiceEndpoints(state: IStore) {
  return state.services.selectedServiceEndpoints;
}

export const getSelectedService = createSelector(
  (state: IStore) => state.services.selectedServiceId,
  getServicesById,
  (id, services): IServiceRow => services[id]
);

export const getAllServices = createSelector(
  getServicesAllIds,
  getServicesById,
  (ids, byId) => {
    return ids.map(id => byId[id]);
  }
);

export const getCurrentServiceInterfacesEndpoints = createSelector(
  getSelectedService,
  getServiceInterfaces,
  getServiceEndpoints,
  getInterfacesById,
  getEndpointsById,
  (
    service,
    serviceInterfaces,
    serviceEndpoints,
    interfacesByIds,
    endpointsByIds
  ): IServiceOverview => {
    if (service) {
      const intMap = new Map<string, { nsp: string; local: string }>();

      for (const id of serviceInterfaces) {
        const qName = findNamespaceLocalpart(interfacesByIds[id].name);
        intMap.set(id, { nsp: qName.namespace, local: qName.localpart });
      }

      const serviceWithNspLocalpart = findNamespaceLocalpart(service.name);
      return {
        ...service,
        namespace: serviceWithNspLocalpart.namespace,
        localpart: serviceWithNspLocalpart.localpart,
        interfaces: serviceInterfaces.map(id => {
          const itf = interfacesByIds[id] as IInterfaceRow;
          return {
            ...itf,
            namespace: intMap.get(id).nsp,
            localpart: intMap.get(id).local,
          };
        }),
        endpoints: serviceEndpoints.map(id => {
          return endpointsByIds[id] as IEndpointRow;
        }),
      };
    } else {
      return undefined;
    }
  }
);

export const getCurrentServiceTree = createSelector(
  getSelectedWorkspaceId,
  getServicesAllIds,
  getServicesById,
  (selectedWorkspaceId, servicesAllIds, servicesByIds): TreeElement<any>[] => {
    const baseUrl = `/workspaces/${selectedWorkspaceId}/services/services`;

    const servicesWithNspLocalpart = servicesAllIds.map(id => ({
      ...findNamespaceLocalpart(servicesByIds[id].name),
      id,
    }));

    const groupedByNamespace = groupByNamespace(servicesWithNspLocalpart);

    return groupedByNamespace.map(nspWithLocalparts => ({
      name: nspWithLocalparts.namespace,
      isFolded: false,
      cssClass: `item-namespace`,
      link: ``,
      children: nspWithLocalparts.localparts.map(localpart => ({
        name: localpart.name,
        isFolded: false,
        cssClass: `item-localpart`,
        link: `${baseUrl}/${localpart.id}`,
        children: [],
      })),
    }));
  }
);
