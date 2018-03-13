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

import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import {
  JsTable,
  mergeInto,
  putAll,
  updateById,
} from 'app/shared/helpers/jstable.helper';
import {
  IServiceBackendDetails,
  IServiceBackendSSE,
} from 'app/shared/services/services.service';
import { Services } from './services.actions';
import {
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
    | Workspaces.Clean;

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
      case Workspaces.CleanType: {
        return servicesTableFactory();
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
}
