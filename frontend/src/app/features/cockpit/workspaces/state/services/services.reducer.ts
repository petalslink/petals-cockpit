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

import {
  JsTable,
  mergeInto,
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
    | Services.SetCurrent
    | Services.FetchAll
    | Services.FetchAllError
    | Services.FetchAllSuccess
    | Services.FetchDetails
    | Services.FetchDetailsError
    | Services.FetchDetailsSuccess;

  export function reducer(
    table = servicesTableFactory(),
    action: All
  ): IServicesTable {
    switch (action.type) {
      case Services.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case Services.FetchAllType: {
        return fetchAll(table);
      }
      case Services.FetchAllErrorType: {
        return fetchAllError(table);
      }
      case Services.FetchAllSuccessType: {
        return fetchAllSuccess(table, action.payload);
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
      default:
        return table;
    }
  }

  function setCurrent(
    table: IServicesTable,
    payload: { id: string }
  ): IServicesTable {
    return {
      ...table,
      isFetchingServices: false,
      selectedServiceId: payload.id,
    };
  }

  function fetchAll(table: IServicesTable): IServicesTable {
    return { ...table, isFetchingServices: true };
  }

  function fetchAllError(table: IServicesTable): IServicesTable {
    return { ...table, isFetchingServices: false };
  }

  function fetchAllSuccess(
    table: IServicesTable,
    payload: JsTable<IServiceBackendSSE>
  ): IServicesTable {
    return {
      ...mergeInto(table, payload, serviceRowFactory),
      isFetchingServices: false,
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
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(table: IServicesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }
}
