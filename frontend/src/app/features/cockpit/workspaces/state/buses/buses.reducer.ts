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
  mergeOnly,
  putAll,
  removeById,
  updateById,
} from '@shared/helpers/jstable.helper';
import { toggleFold } from '@shared/helpers/reducers.helper';
import {
  IBusBackendDetails,
  IBusBackendSSE,
} from '@shared/services/buses.service';
import { Buses } from '@wks/state/buses/buses.actions';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import {
  busesTableFactory,
  busRowFactory,
  IBusesTable,
} from './buses.interface';

export namespace BusesReducer {
  type All =
    // BUS
    | Buses.Fetched
    | Buses.Added
    | Buses.SetCurrent
    | Buses.FetchDetails
    | Buses.FetchDetailsError
    | Buses.FetchDetailsSuccess
    | Buses.ToggleFold
    | Buses.CancelSelect
    | Buses.ToggleSelect
    | Buses.Detach
    | Buses.DetachError
    | Buses.Detached
    // BUS IN PROGRESS
    | Buses.CleanImport
    | Buses.Post
    | Buses.PostError
    | Buses.PostSuccess
    | Buses.CancelImport
    | Buses.CancelImportError
    | Buses.CanceledImport
    | Buses.UpdateError
    | Workspaces.CleanWorkspace;

  export function reducer(
    table = busesTableFactory(),
    action: All
  ): IBusesTable {
    switch (action.type) {
      // BUS
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
      case Buses.ToggleFoldType: {
        return toggleFold(table, action.payload);
      }
      case Buses.CancelSelectType: {
        return cancelSelect(table, action.payload);
      }
      case Buses.ToggleSelectType: {
        return toggleSelect(table, action.payload);
      }
      case Buses.DetachType: {
        return detach(table, action.payload);
      }
      case Buses.DetachErrorType: {
        return detachError(table, action.payload);
      }
      case Buses.DetachedType: {
        return detached(table, action.payload);
      }
      // BUS IN PROGRESS
      case Buses.CleanImportType: {
        return cleanImport(table);
      }
      case Buses.PostType: {
        return post(table);
      }
      case Buses.PostErrorType: {
        return postError(table, action.payload);
      }
      case Buses.PostSuccessType: {
        return postSuccess(table, action.payload);
      }
      case Buses.CancelImportType: {
        return cancelImport(table, action.payload);
      }
      case Buses.CancelImportErrorType: {
        return cancelImportError(table, action.payload);
      }
      case Buses.CanceledImportType: {
        return canceledImport(table, action.payload);
      }
      case Buses.UpdateErrorType: {
        return updateError(table, action.payload);
      }
      case Workspaces.CleanWorkspaceType: {
        return busesTableFactory();
      }
      default:
        return table;
    }
  }
  // BUS
  function fetched(table: IBusesTable, payload: JsTable<IBusBackendSSE>) {
    return mergeOnly(table, payload, busRowFactory);
  }

  function added(table: IBusesTable, payload: JsTable<IBusBackendSSE>) {
    if (table.importBusId === payload.allIds[0]) {
      return putAll(
        {
          ...table,
          importBusId: '',
          isImportingBus: false,
          isCancelingImportBus: false,
        },
        payload,
        busRowFactory
      );
    } else {
      return putAll(table, payload, busRowFactory);
    }
  }

  function setCurrent(
    table: IBusesTable,
    payload: { id: string }
  ): IBusesTable {
    return {
      ...table,
      selectedBusId: payload.id,
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

  function cancelSelect(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isBusSelectedForDetachment: false,
    });
  }

  function toggleSelect(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isBusSelectedForDetachment: !table.byId[payload.id]
        .isBusSelectedForDetachment,
    });
  }

  function detached(table: IBusesTable, payload: { id: string }) {
    return {
      ...updateById(table, payload.id, { isDetaching: false }),
      ...removeById(table, payload.id),
    };
  }

  function detach(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isDetaching: true });
  }

  function detachError(table: IBusesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isDetaching: false });
  }

  // BUS IN PROGRESS
  function cleanImport(table: IBusesTable): IBusesTable {
    return {
      ...table,
      isImportingBus: false,
      importError: '',
      importBusError: '',
    };
  }

  function post(table: IBusesTable): IBusesTable {
    return {
      ...table,
      isImportingBus: true,
      importError: '',
      importBusError: '',
    };
  }

  // once the http request is done but failed
  function postError(
    table: IBusesTable,
    payload: { importBusError: string }
  ): IBusesTable {
    if (table.isImportingBus) {
      return {
        ...table,
        isImportingBus: false,
        importBusError: payload.importBusError,
        importError: '',
      };
    } else {
      return table;
    }
  }

  function postSuccess(
    table: IBusesTable,
    payload: {
      id: string;
    }
  ) {
    if (!table.importBusId && !(table.importBusError || table.importError)) {
      if (table.byId[payload.id]) {
        return {
          ...table,
          importBusId: '',
          isImportingBus: false,
          importError: '',
          importBusError: '',
        };
      } else {
        return {
          ...table,
          importBusId: payload.id,
        };
      }
    } else {
      return table;
    }
  }

  function cancelImport(table: IBusesTable, payload: { id: string }) {
    if (table.importBusId === payload.id) {
      return {
        ...table,
        isCancelingImportBus: true,
      };
    } else {
      return updateById(table, payload.id, {
        isDetaching: true,
      });
    }
  }

  function cancelImportError(
    table: IBusesTable,
    payload: { id: string }
  ): IBusesTable {
    if (table.importBusId === payload.id) {
      return {
        ...table,
        importBusId: '',
        isCancelingImportBus: false,
        isImportingBus: false,
      };
    } else {
      return updateById(table, payload.id, {
        isDetaching: false,
      });
    }
  }

  function canceledImport(
    table: IBusesTable,
    payload: { id: string }
  ): IBusesTable {
    if (table.importBusId === payload.id) {
      return {
        ...table,
        importBusId: '',
        isCancelingImportBus: false,
        isImportingBus: false,
      };
    } else {
      return removeById(table, payload.id);
    }
  }

  function updateError(
    table: IBusesTable,
    payload: { id: string; importError: string }
  ): IBusesTable {
    if (table.importBusId === payload.id || !table.importBusId) {
      return {
        ...table,
        importBusId: '',
        importError: payload.importError,
        importBusError: '',
        isImportingBus: false,
        isCancelingImportBus: false,
      };
    } else {
      return table;
    }
  }
}
