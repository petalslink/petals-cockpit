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
  mergeInto,
  putAll,
  toJsTable,
  updateById,
} from '@shared/helpers/jstable.helper';
import {
  IServiceBackendDetails,
  IServiceBackendSSE,
} from '@shared/services/services.service';
import { SseActions } from '@shared/services/sse.service';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import { Services } from './services.actions';
import {
  IServiceRow,
  IServicesTable,
  serviceRowFactory,
  servicesTableFactory,
} from './services.interface';

export namespace ServicesReducer {
  type All =
    | Services.Added
    | Services.SetCurrent
    | Services.Fetched
    | Services.FetchDetails
    | Services.FetchDetailsError
    | Services.FetchDetailsSuccess
    | Services.Clean
    | Workspaces.CleanWorkspace
    | SseActions.ServicesUpdated
    | SseActions.BusDetached;

  export function reducer(
    table = servicesTableFactory(),
    action: All
  ): IServicesTable {
    switch (action.type) {
      case Services.AddedType: {
        return added(table, action.payload);
      }
      case Services.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case Services.FetchedType: {
        return fetched(table, action.payload);
      }
      case Services.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case Services.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case Services.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case Services.CleanType: {
        return servicesTableFactory();
      }
      case Workspaces.CleanWorkspaceType: {
        return servicesTableFactory();
      }
      case SseActions.ServicesUpdatedType: {
        return servicesUpdated(table, action.payload);
      }
      case SseActions.BusDetachedType: {
        return servicesUpdated(table, action.payload.content);
      }
      default:
        return table;
    }
  }

  function added(table: IServicesTable, payload: JsTable<IServiceBackendSSE>) {
    return putAll(table, payload, serviceRowFactory);
  }

  function setCurrent(
    table: IServicesTable,
    payload: { id: string }
  ): IServicesTable {
    return {
      ...table,
      selectedServiceId: payload.id,
    };
  }

  function fetched(
    table: IServicesTable,
    payload: JsTable<IServiceBackendSSE>
  ): IServicesTable {
    return {
      ...mergeInto(table, payload, serviceRowFactory),
    };
  }

  function fetchDetails(table: IServicesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: true,
    });
  }

  function fetchDetailsSuccess(
    table: IServicesTable,
    payload: { id: string; data: IServiceBackendDetails }
  ) {
    return {
      ...updateById(table, payload.id, {
        isFetchingDetails: false,
      }),
      selectedServiceId: payload.id,
      selectedServiceInterfaces: payload.data.interfaces,
      selectedServiceEndpoints: payload.data.endpoints,
    };
  }

  function fetchDetailsError(table: IServicesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }

  function servicesUpdated(
    table: IServicesTable,
    payload: { services: { [key: string]: IServiceBackendSSE } }
  ) {
    const services = serviceBackendSseMapToserviceRowMap(payload.services);
    return { ...table, ...toJsTable(services) };
  }

  function serviceBackendSseMapToserviceRowMap(sbsMap: {
    [key: string]: IServiceBackendSSE;
  }): {
    [key: string]: IServiceRow;
  } {
    const initialServices: {
      [key: string]: IServiceRow;
    } = {};
    const services = Object.values(sbsMap).reduce(
      (previousValue, currentValue) => {
        previousValue[currentValue.id] = {
          ...currentValue,
          isFetchingDetails: false,
        };
        return previousValue;
      },
      initialServices
    );

    return services;
  }
}
