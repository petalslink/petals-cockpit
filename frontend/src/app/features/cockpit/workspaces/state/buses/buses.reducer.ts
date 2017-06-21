/**
 * Copyright (C) 2017 Linagora
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
  IBusBackendSSE,
  IBusBackendDetails,
} from 'app/shared/services/buses.service';
import {
  IBusesTable,
  busesTableFactory,
  busRowFactory,
} from './buses.interface';

import {
  updateById,
  removeById,
  mergeOnly,
  putAll,
  JsTable,
} from 'app/shared/helpers/jstable.helper';
import { fold, unfold, toggleFold } from 'app/shared/helpers/reducers.helper';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';

export namespace BusesReducer {
  type All =
    | Buses.Fetched
    | Buses.Added
    | Buses.SetCurrent
    | Buses.FetchDetails
    | Buses.FetchDetailsError
    | Buses.FetchDetailsSuccess
    | Buses.Removed
    | Buses.Delete
    | Buses.DeleteError
    | Buses.Fold
    | Buses.Unfold
    | Buses.ToggleFold
    | Workspaces.Clean;

  export function reducer(
    table = busesTableFactory(),
    action: All
  ): IBusesTable {
    switch (action.type) {
      case Buses.FetchedType: {
        return fetched(table, action.payload);
      }
      case Buses.AddedType: {
        return added(table, action.payload);
      }
      case Buses.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case Buses.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case Buses.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case Buses.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case Buses.RemovedType: {
        return removed(table, action.payload);
      }
      case Buses.DeleteType: {
        return deletee(table, action.payload);
      }
      case Buses.DeleteErrorType: {
        return deleteError(table, action.payload);
      }
      case Buses.FoldType: {
        return fold(table, action.payload);
      }
      case Buses.UnfoldType: {
        return unfold(table, action.payload);
      }
      case Buses.ToggleFoldType: {
        return toggleFold(table, action.payload);
      }
      case Workspaces.CleanType: {
        return busesTableFactory();
      }
      default:
        return table;
    }
  }

  function fetched(table: IBusesTable, payload: JsTable<IBusBackendSSE>) {
    return mergeOnly(table, payload, busRowFactory);
  }

  function added(table: IBusesTable, payload: JsTable<IBusBackendSSE>) {
    return putAll(table, payload, busRowFactory);
  }

  function setCurrent(table: IBusesTable, payload: { id: string }) {
    return {
      ...table,
      ...<IBusesTable>{
        selectedBusId: payload.id,
      },
    };
  }

  function fetchDetails(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isFetchingDetails: true });
  }

  function fetchDetailsSuccess(
    table: IBusesTable,
    payload: { id: string; data: IBusBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isFetchingDetails: false });
  }

  function deletee(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isRemoving: true });
  }

  function deleteError(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isRemoving: false });
  }

  function removed(table: IBusesTable, payload: { id: string }) {
    return removeById(table, payload.id);
  }
}
