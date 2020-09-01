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

import { createSelector } from '@ngrx/store';

import { findNamespaceLocalpart } from '@shared/helpers/services-list.helper';
import { IStore } from '@shared/state/store.interface';
import { IEndpointRow } from '@wks/state/endpoints/endpoints.interface';
import { getEndpointsById } from '@wks/state/endpoints/endpoints.selectors';
import {
  IInterface,
  IInterfaceRow,
} from '@wks/state/interfaces/interfaces.interface';
import {
  IServiceRow,
  IServiceRowWithQName,
} from '@wks/state/services/services.interface';
import { getServicesById } from '@wks/state/services/services.selectors';

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
      const filteredInterfaceServices = interfaceServices.filter(
        id => servicesByIds[id]
      );

      for (const id of filteredInterfaceServices) {
        const qName = findNamespaceLocalpart(servicesByIds[id].name);
        serviceMap.set(id, { nsp: qName.namespace, local: qName.localpart });
      }
      const interfaceWithNspLocalpart = findNamespaceLocalpart(_interface.name);

      return {
        id: _interface.id,
        name: _interface.name,
        components: _interface.components,
        isFetchingDetails: _interface.isFetchingDetails,
        namespace: interfaceWithNspLocalpart.namespace,
        localpart: interfaceWithNspLocalpart.localpart,
        services: filteredInterfaceServices.map(id => {
          const svc = servicesByIds[id] as IServiceRow;
          return {
            ...svc,
            namespace: serviceMap.get(id).nsp,
            localpart: serviceMap.get(id).local,
          };
        }),
        endpoints: interfaceEndpoints
          .filter(id => endpointsByIds[id])
          .map(id => {
            return endpointsByIds[id] as IEndpointRow;
          }),
      };
    } else {
      return undefined;
    }
  }
);
