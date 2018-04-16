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
  IEndpointBackendDetails,
  IEndpointBackendSSE,
} from 'app/shared/services/endpoints.service';
import { Endpoints } from './endpoints.actions';
import {
  endpointRowFactory,
  endpointsTableFactory,
  IEndpointsTable,
} from './endpoints.interface';

export namespace EndpointsReducer {
  type All =
    | Endpoints.Added
    | Endpoints.SetCurrent
    | Endpoints.Fetched
    | Endpoints.FetchDetails
    | Endpoints.FetchDetailsError
    | Endpoints.FetchDetailsSuccess
    | Endpoints.Clean
    | Workspaces.Clean;

  export function reducer(
    table = endpointsTableFactory(),
    action: All
  ): IEndpointsTable {
    switch (action.type) {
      case Endpoints.AddedType: {
        return added(table, action.payload);
      }
      case Endpoints.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case Endpoints.FetchedType: {
        return fetched(table, action.payload);
      }
      case Endpoints.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case Endpoints.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case Endpoints.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case Endpoints.CleanType: {
        return endpointsTableFactory();
      }
      case Workspaces.CleanType: {
        return endpointsTableFactory();
      }
      default:
        return table;
    }
  }

  function added(
    table: IEndpointsTable,
    payload: JsTable<IEndpointBackendSSE>
  ) {
    return putAll(table, payload, endpointRowFactory);
  }

  function setCurrent(
    table: IEndpointsTable,
    payload: { id: string }
  ): IEndpointsTable {
    return {
      ...table,
      selectedEndpointId: payload.id,
    };
  }

  function fetched(
    table: IEndpointsTable,
    payload: JsTable<IEndpointBackendSSE>
  ): IEndpointsTable {
    return {
      ...mergeInto(table, payload, endpointRowFactory),
    };
  }

  function fetchDetails(table: IEndpointsTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: true,
    });
  }

  function fetchDetailsSuccess(
    table: IEndpointsTable,
    payload: { id: string; data: IEndpointBackendDetails }
  ) {
    return {
      ...updateById(table, payload.id, {
        isFetchingDetails: false,
      }),
      selectedEndpointId: payload.id,
      selectedEndpointService: payload.data.service,
      selectedEndpointInterfaces: payload.data.interfaces,
    };
  }

  function fetchDetailsError(table: IEndpointsTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }
}