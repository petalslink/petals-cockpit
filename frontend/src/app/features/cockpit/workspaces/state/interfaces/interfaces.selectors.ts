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
import {
  IInterface,
  IInterfaceRow,
} from 'app/features/cockpit/workspaces/state/interfaces/interfaces.interface';
import { IServiceRow } from 'app/features/cockpit/workspaces/state/services/services.interface';
import {
  getServicesById,
  IServiceRowWithQName,
} from 'app/features/cockpit/workspaces/state/services/services.selectors';
import { getSelectedWorkspaceId } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';
import {
  findNamespaceLocalpart,
  groupByNamespace,
} from 'app/shared/helpers/services-list.helper';
import { IStore } from 'app/shared/state/store.interface';

export interface IInterfaceRowWithQName extends IInterfaceRow {
  namespace: string;
  localpart: string;
}

export interface IInterfaceOverview extends IInterface {
  services: IServiceRowWithQName[];
  endpoints: IEndpointRow[];
  namespace: string;
  localpart: string;
}

export function getInterfacesById(state: IStore) {
  return state.interfaces.byId;
}

export function getInterfacesAllIds(state: IStore) {
  return state.interfaces.allIds;
}

export function getInterfaceServices(state: IStore) {
  return state.interfaces.selectedInterfaceServices;
}

export function getInterfaceEndpoints(state: IStore) {
  return state.interfaces.selectedInterfaceEndpoints;
}

export const getSelectedInterface = createSelector(
  (state: IStore) => state.interfaces.selectedInterfaceId,
  getInterfacesById,
  (id, interfaces): IInterfaceRow => interfaces[id]
);

export const getAllInterfaces = createSelector(
  getInterfacesAllIds,
  getInterfacesById,
  (ids, byId) => {
    return ids.map(id => byId[id]);
  }
);

export const getCurrentInterfaceServicesEndpoints = createSelector(
  getSelectedInterface,
  getInterfaceServices,
  getInterfaceEndpoints,
  getServicesById,
  getEndpointsById,
  (
    _interface,
    interfaceServices,
    interfaceEndpoints,
    servicesByIds,
    endpointsByIds
  ): IInterfaceOverview => {
    if (_interface) {
      const serviceMap = new Map<string, { nsp: string; local: string }>();

      for (const id of interfaceServices) {
        const qName = findNamespaceLocalpart(servicesByIds[id].name);
        serviceMap.set(id, { nsp: qName.namespace, local: qName.localpart });
      }
      const interfaceWithNspLocalpart = findNamespaceLocalpart(_interface.name);

      return {
        ..._interface,
        namespace: interfaceWithNspLocalpart.namespace,
        localpart: interfaceWithNspLocalpart.localpart,
        services: interfaceServices.map(id => {
          const svc = servicesByIds[id] as IServiceRow;
          return {
            ...svc,
            namespace: serviceMap.get(id).nsp,
            localpart: serviceMap.get(id).local,
          };
        }),
        endpoints: interfaceEndpoints.map(id => {
          return endpointsByIds[id] as IEndpointRow;
        }),
      };
    } else {
      return undefined;
    }
  }
);

export const getCurrentInterfaceTree = createSelector(
  getSelectedWorkspaceId,
  getInterfacesAllIds,
  getInterfacesById,
  (
    selectedWorkspaceId,
    interfacesAllIds,
    interfacesByIds
  ): TreeElement<any>[] => {
    const baseUrl = `/workspaces/${selectedWorkspaceId}/services/interfaces`;

    const interfacesWithNspLocalpart = interfacesAllIds.map(id => ({
      ...findNamespaceLocalpart(interfacesByIds[id].name),
      id,
    }));

    const groupedByNamespace = groupByNamespace(interfacesWithNspLocalpart);

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
