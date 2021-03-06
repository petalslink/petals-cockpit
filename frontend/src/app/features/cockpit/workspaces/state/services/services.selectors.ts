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
import {
  getEndpointOverview,
  IEndpointOverview,
} from '@wks/state/endpoints/endpoints.selectors';
import {
  IInterfaceRow,
  IInterfaceRowWithQName,
} from '@wks/state/interfaces/interfaces.interface';
import { getInterfacesById } from '@wks/state/interfaces/interfaces.selectors';
import { IService, IServiceRow } from '@wks/state/services/services.interface';

export interface IServiceOverview extends IService {
  interfaces: IInterfaceRowWithQName[];
  endpoints: IEndpointOverview[];
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

export function getSelectedServiceId(state: IStore) {
  return state.services.selectedServiceId;
}

export const getSelectedService = createSelector(
  getSelectedServiceId,
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

export const getCurrentServiceOverview = createSelector(
  (state: IStore) => state,
  getSelectedService,
  getServiceInterfaces,
  getServiceEndpoints,
  getInterfacesById,
  (
    state,
    service,
    serviceInterfaces,
    serviceEndpoints,
    interfacesByIds
  ): IServiceOverview => {
    if (service) {
      const intMap = new Map<string, { nsp: string; local: string }>();
      const filteredServiceInterfaces = serviceInterfaces.filter(
        id => interfacesByIds[id]
      );

      for (const id of filteredServiceInterfaces) {
        const qName = findNamespaceLocalpart(interfacesByIds[id].name);
        intMap.set(id, { nsp: qName.namespace, local: qName.localpart });
      }

      const serviceWithNspLocalpart = findNamespaceLocalpart(service.name);
      return {
        id: service.id,
        name: service.name,
        components: service.components,
        isFetchingDetails: service.isFetchingDetails,
        namespace: serviceWithNspLocalpart.namespace,
        localpart: serviceWithNspLocalpart.localpart,
        interfaces: filteredServiceInterfaces.map(id => {
          const itf = interfacesByIds[id] as IInterfaceRow;
          return {
            ...itf,
            namespace: intMap.get(id).nsp,
            localpart: intMap.get(id).local,
          };
        }),
        endpoints: serviceEndpoints.map(id => {
          return getEndpointOverview(state, id) as IEndpointOverview;
        }),
      };
    } else {
      return undefined;
    }
  }
);
