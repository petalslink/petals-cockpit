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
  mergeOnly,
  putAll,
  removeById,
  updateById,
} from '@shared/helpers/jstable.helper';
import {
  IServiceUnitBackendDetails,
  IServiceUnitBackendSSE,
} from '@shared/services/service-units.service';
import { ServiceUnits } from '@wks/state/service-units/service-units.actions';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import {
  IServiceUnitRow,
  IServiceUnitsTable,
  serviceUnitRowFactory,
  serviceUnitsTableFactory,
} from './service-units.interface';

export namespace ServiceUnitsReducer {
  type All =
    | ServiceUnits.Fetched
    | ServiceUnits.Added
    | ServiceUnits.SetCurrent
    | ServiceUnits.FetchDetails
    | ServiceUnits.FetchDetailsError
    | ServiceUnits.FetchDetailsSuccess
    | ServiceUnits.Removed
    | Workspaces.Clean;

  export function reducer(
    table = serviceUnitsTableFactory(),
    action: All
  ): IServiceUnitsTable {
    switch (action.type) {
      case ServiceUnits.FetchedType: {
        return fetched(table, action.payload);
      }
      case ServiceUnits.AddedType: {
        return added(table, action.payload);
      }
      case ServiceUnits.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case ServiceUnits.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case ServiceUnits.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case ServiceUnits.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case ServiceUnits.RemovedType: {
        return removed(table, action.payload);
      }
      case Workspaces.CleanType: {
        return serviceUnitsTableFactory();
      }
      default:
        return table;
    }
  }

  function fetched(
    table: IServiceUnitsTable,
    payload: JsTable<IServiceUnitBackendSSE>
  ) {
    return mergeOnly(table, payload, serviceUnitRowFactory);
  }

  function added(
    table: IServiceUnitsTable,
    payload: JsTable<IServiceUnitBackendSSE>
  ) {
    return putAll(table, payload, serviceUnitRowFactory);
  }

  function setCurrent(
    table: IServiceUnitsTable,
    payload: { id: string }
  ): IServiceUnitsTable {
    return {
      ...table,
      selectedServiceUnitId: payload.id,
    };
  }

  function fetchDetails(table: IServiceUnitsTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: true,
    });
  }

  function fetchDetailsSuccess(
    table: IServiceUnitsTable,
    payload: { id: string; data: IServiceUnitBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(
    table: IServiceUnitsTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }

  function removed(table: IServiceUnitsTable, payload: IServiceUnitRow) {
    return removeById(table, payload.id);
  }
}
