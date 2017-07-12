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

import { IBusInProgressBackend } from 'app/shared/services/buses.service';
import {
  IBusesInProgressTable,
  busesInProgressTableFactory,
  busInProgressRowFactory,
  IBusInProgressRow,
} from './buses-in-progress.interface';

import {
  putAll,
  updateById,
  removeById,
  mergeOnly,
  JsTable,
} from 'app/shared/helpers/jstable.helper';
import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';

export namespace BusesInProgressReducer {
  type All =
    | BusesInProgress.Fetched
    | BusesInProgress.Added
    | BusesInProgress.SetCurrent
    | BusesInProgress.Post
    | BusesInProgress.PostError
    | BusesInProgress.PostSuccess
    | BusesInProgress.Delete
    | BusesInProgress.DeleteError
    | BusesInProgress.Removed
    | BusesInProgress.UpdateError
    | Workspaces.Clean;

  export function reducer(
    table = busesInProgressTableFactory(),
    action: All
  ): IBusesInProgressTable {
    switch (action.type) {
      case BusesInProgress.FetchedType: {
        return fetched(table, action.payload);
      }
      case BusesInProgress.AddedType: {
        return added(table, action.payload);
      }
      case BusesInProgress.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case BusesInProgress.PostType: {
        return post(table);
      }
      case BusesInProgress.PostErrorType: {
        return postError(table, action.payload);
      }
      case BusesInProgress.PostSuccessType: {
        return postSuccess(table, action.payload);
      }
      case BusesInProgress.RemovedType: {
        return removed(table, action.payload);
      }
      case BusesInProgress.DeleteType: {
        return deletee(table, action.payload);
      }
      case BusesInProgress.DeleteErrorType: {
        return deleteError(table, action.payload);
      }
      case BusesInProgress.UpdateErrorType: {
        return updateError(table, action.payload);
      }
      case Workspaces.CleanType: {
        return busesInProgressTableFactory();
      }
      default:
        return table;
    }
  }

  function fetched(
    table: IBusesInProgressTable,
    payload: JsTable<IBusInProgressBackend>
  ) {
    return mergeOnly(table, payload, busInProgressRowFactory);
  }

  function added(
    table: IBusesInProgressTable,
    payload: JsTable<IBusInProgressBackend>
  ) {
    return putAll(table, payload, busInProgressRowFactory);
  }

  function setCurrent(
    table: IBusesInProgressTable,
    payload: { id: string }
  ): IBusesInProgressTable {
    return {
      ...table,
      selectedBusInProgressId: payload.id,
      isImportingBus: false,
      importBusError: '',
      importBusId: '',
    };
  }

  function post(table: IBusesInProgressTable): IBusesInProgressTable {
    return {
      ...table,
      isImportingBus: true,
      importBusError: '',
      importBusId: '',
    };
  }

  // once the http request is done
  // the bus itself will be added from buses reducer
  function postSuccess(
    table: IBusesInProgressTable,
    payload: { id: string }
  ): IBusesInProgressTable {
    return {
      ...table,
      importBusId: payload.id,
    };
  }

  // once the http request is done but failed
  function postError(
    table: IBusesInProgressTable,
    payload: { importBusError: string }
  ): IBusesInProgressTable {
    // if it's false, it means we changed bus (with SET_CURRENT_BUS_IN_PROGRESS)
    if (table.isImportingBus) {
      return {
        ...table,
        isImportingBus: false,
        importBusError: payload.importBusError,
        importBusId: '',
      };
    } else {
      return table;
    }
  }

  function deletee(table: IBusesInProgressTable, payload: IBusInProgressRow) {
    return updateById(table, payload.id, { isRemoving: true });
  }

  function deleteError(table: IBusesInProgressTable, payload: { id: string }) {
    return updateById(table, payload.id, { isRemoving: false });
  }

  function removed(table: IBusesInProgressTable, payload: { id: string }) {
    return removeById(table, payload.id);
  }

  function updateError(
    table: IBusesInProgressTable,
    payload: { id: string; importError: string }
  ) {
    return updateById(table, payload.id, {
      importError: payload.importError,
    });
  }
}
