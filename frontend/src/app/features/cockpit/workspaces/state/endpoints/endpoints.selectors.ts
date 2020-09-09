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

import { JsTable } from '@shared/helpers/jstable.helper';
import { findNamespaceLocalpart } from '@shared/helpers/services-list.helper';
import { IStore } from '@shared/state/store.interface';
import { getBusesById } from '@wks/state/buses/buses.selectors';
import { getContainersById } from '@wks/state/containers/containers.selectors';
import {
  IEndpointRow,
  IEndpointUI,
} from '@wks/state/endpoints/endpoints.interface';
import { IEndpointOverview } from '@wks/state/endpoints/endpoints.selectors';
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
import { IBusRow } from '../buses/buses.interface';
import { IComponentRow } from '../components/components.interface';
import { getComponentsById } from '../components/components.selectors';
import { IContainerRow } from '../containers/containers.interface';

export interface IEndpointOverview extends IEndpointUI {
  id: string;
  name: string;
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

export const getSelectedEndpointOverview = createSelector(
  state => state,
  (state: IStore): IEndpointOverview => {
    return getEndpointOverview(state, state.endpoints.selectedEndpointId);
  }
);

export const getEndpointOverview = createSelector(
  getEndpointsById,
  getServicesById,
  getInterfacesById,
  getComponentsById,
  getContainersById,
  getBusesById,
  (
    endpointById: JsTable<IEndpointRow>['byId'],
    servicesById: JsTable<IServiceRow>['byId'],
    interfacesById: JsTable<IInterfaceRow>['byId'],
    componentsById: JsTable<IComponentRow>['byId'],
    containersById: JsTable<IContainerRow>['byId'],
    busesById: JsTable<IBusRow>['byId'],
    endpointId: string
  ): IEndpointOverview => {
    const endpoint = endpointById[endpointId];
    if (endpointById[endpointId]) {
      const svc: IServiceRow = servicesById[endpoint.serviceId] || null;
      const comp: IComponentRow = componentsById[endpoint.componentId] || null;
      const cont: IContainerRow = containersById[comp.containerId] || null;
      const bus: IBusRow = busesById[cont.busId] || null;

      const qNameSvc = findNamespaceLocalpart(svc.name);

      const intMap = new Map<string, { nsp: string; local: string }>();
      endpoint.interfacesIds.filter(id => interfacesById[id]).forEach(id => {
        const qName = findNamespaceLocalpart(interfacesById[id].name);
        intMap.set(id, { nsp: qName.namespace, local: qName.localpart });
      });

      return {
        id: endpoint.id,
        name: endpoint.name,
        component: comp,
        container: cont,
        bus: bus,
        service: {
          ...svc,
          namespace: qNameSvc.namespace,
          localpart: qNameSvc.localpart,
        },
        interfaces: endpoint.interfacesIds.map(id => {
          const itf = interfacesById[id] as IInterfaceRow;
          return {
            ...itf,
            namespace: intMap.get(id).nsp,
            localpart: intMap.get(id).local,
          };
        }),
        isFetchingDetails: false,
      };
    } else {
      return null;
    }
  }
);
