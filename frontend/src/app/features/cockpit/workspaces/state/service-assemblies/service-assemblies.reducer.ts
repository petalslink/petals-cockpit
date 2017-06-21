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
  IServiceAssembliesTable,
  serviceAssembliesTableFactory,
  serviceAssemblyRowFactory,
  IServiceAssemblyRow,
} from './service-assemblies.interface';

import {
  putAll,
  updateById,
  removeById,
  mergeOnly,
  JsTable,
} from 'app/shared/helpers/jstable.helper';
import {
  IServiceAssemblyBackendSSE,
  IServiceAssemblyBackendDetails,
  ServiceAssemblyState,
} from 'app/shared/services/service-assemblies.service';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';

export namespace ServiceAssembliesReducer {
  type All =
    | ServiceAssemblies.Fetched
    | ServiceAssemblies.Added
    | ServiceAssemblies.SetCurrent
    | ServiceAssemblies.FetchDetails
    | ServiceAssemblies.FetchDetailsError
    | ServiceAssemblies.FetchDetailsSuccess
    | ServiceAssemblies.ChangeState
    | ServiceAssemblies.ChangeStateError
    | ServiceAssemblies.ChangeStateSuccess
    | ServiceAssemblies.Removed
    | Workspaces.Clean;

  export function reducer(
    table = serviceAssembliesTableFactory(),
    action: All
  ): IServiceAssembliesTable {
    switch (action.type) {
      case ServiceAssemblies.FetchedType: {
        return fetched(table, action.payload);
      }
      case ServiceAssemblies.AddedType: {
        return added(table, action.payload);
      }
      case ServiceAssemblies.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case ServiceAssemblies.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case ServiceAssemblies.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case ServiceAssemblies.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case ServiceAssemblies.RemovedType: {
        return removed(table, action.payload);
      }
      case ServiceAssemblies.ChangeStateType: {
        return changeState(table, action.payload);
      }
      case ServiceAssemblies.ChangeStateErrorType: {
        return changeStateError(table, action.payload);
      }
      case ServiceAssemblies.ChangeStateSuccessType: {
        return changeStateSuccess(table, action.payload);
      }
      case Workspaces.CleanType: {
        return serviceAssembliesTableFactory();
      }
      default:
        return table;
    }
  }

  function fetched(
    table: IServiceAssembliesTable,
    payload: JsTable<IServiceAssemblyBackendSSE>
  ) {
    return mergeOnly(table, payload, serviceAssemblyRowFactory);
  }

  function added(
    table: IServiceAssembliesTable,
    payload: JsTable<IServiceAssemblyBackendSSE>
  ) {
    return putAll(table, payload, serviceAssemblyRowFactory);
  }

  function setCurrent(table: IServiceAssembliesTable, payload: { id: string }) {
    const res = <IServiceAssembliesTable>{
      selectedServiceAssemblyId: payload.id,
    };

    if (payload.id) {
      return {
        ...updateById(table, payload.id, {
          errorChangeState: '',
        }),
        ...res,
      };
    }

    return {
      ...table,
      ...res,
    };
  }

  function fetchDetails(
    table: IServiceAssembliesTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isFetchingDetails: true,
    });
  }

  function fetchDetailsSuccess(
    table: IServiceAssembliesTable,
    payload: { id: string; data: IServiceAssemblyBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(
    table: IServiceAssembliesTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }

  function changeState(
    table: IServiceAssembliesTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isUpdatingState: true,
    });
  }

  function changeStateSuccess(
    table: IServiceAssembliesTable,
    payload: { id: string; state: ServiceAssemblyState }
  ) {
    return updateById(table, payload.id, {
      isUpdatingState: false,
      state: payload.state,
      errorChangeState: '',
    });
  }

  function changeStateError(
    table: IServiceAssembliesTable,
    payload: { id: string; errorChangeState: string }
  ) {
    return updateById(table, payload.id, {
      isUpdatingState: false,
      errorChangeState: payload.errorChangeState,
    });
  }

  function removed(
    table: IServiceAssembliesTable,
    payload: IServiceAssemblyRow
  ) {
    const selectedServiceAssemblyId = table.selectedServiceAssemblyId ===
      payload.id
      ? ''
      : table.selectedServiceAssemblyId;

    return {
      ...removeById(table, payload.id),
      selectedServiceAssemblyId,
    };
  }
}
