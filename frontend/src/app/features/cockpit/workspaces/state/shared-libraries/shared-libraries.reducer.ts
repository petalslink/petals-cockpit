/**
 * Copyright (C) 2017-2019 Linagora
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
import { IComponentBackendSSE } from '@shared/services/components.service';
import {
  ISharedLibraryBackendDetails,
  ISharedLibraryBackendSSE,
} from '@shared/services/shared-libraries.service';
import { Components } from '@wks/state/components/components.actions';
import { IComponentRow } from '@wks/state/components/components.interface';
import { Containers } from '@wks/state/containers/containers.actions';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import { SharedLibraries } from './shared-libraries.actions';
import {
  ISharedLibrariesTable,
  ISharedLibraryRow,
  sharedLibrariesTableFactory,
  sharedLibraryRowFactory,
} from './shared-libraries.interface';

export namespace SharedLibrariesReducer {
  type All =
    | SharedLibraries.Fetched
    | SharedLibraries.Added
    | SharedLibraries.SetCurrent
    | SharedLibraries.FetchDetails
    | SharedLibraries.FetchDetailsError
    | SharedLibraries.FetchDetailsSuccess
    | SharedLibraries.ChangeState
    | SharedLibraries.ChangeStateError
    | SharedLibraries.Removed
    | Containers.DeployComponentSuccess
    | Components.Removed
    | Workspaces.Clean;

  export function reducer(
    table = sharedLibrariesTableFactory(),
    action: All
  ): ISharedLibrariesTable {
    switch (action.type) {
      case SharedLibraries.FetchedType: {
        return fetched(table, action.payload);
      }
      case SharedLibraries.AddedType: {
        return added(table, action.payload);
      }
      case SharedLibraries.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case SharedLibraries.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case SharedLibraries.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case SharedLibraries.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case SharedLibraries.ChangeStateType: {
        return changeState(table, action.payload);
      }
      case SharedLibraries.ChangeStateErrorType: {
        return changeStateError(table, action.payload);
      }
      case SharedLibraries.RemovedType: {
        return removed(table, action.payload);
      }
      case Containers.DeployComponentSuccessType: {
        return deployComponentSuccess(table, action.payload);
      }
      case Components.RemovedType: {
        return removeComponent(table, action.payload);
      }
      case Workspaces.CleanType: {
        return sharedLibrariesTableFactory();
      }
      default:
        return table;
    }
  }

  function fetched(
    table: ISharedLibrariesTable,
    payload: JsTable<ISharedLibraryBackendSSE>
  ) {
    return mergeOnly(table, payload, sharedLibraryRowFactory);
  }

  function added(
    table: ISharedLibrariesTable,
    payload: JsTable<ISharedLibraryBackendSSE>
  ) {
    return putAll(table, payload, sharedLibraryRowFactory);
  }

  function setCurrent(
    table: ISharedLibrariesTable,
    payload: { id: string }
  ): ISharedLibrariesTable {
    const res = {
      selectedSharedLibraryId: payload.id,
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

  function fetchDetails(table: ISharedLibrariesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: true,
    });
  }

  function fetchDetailsSuccess(
    table: ISharedLibrariesTable,
    payload: { id: string; data: ISharedLibraryBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(
    table: ISharedLibrariesTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }

  function changeState(table: ISharedLibrariesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isUpdatingState: true,
    });
  }

  function changeStateError(
    table: ISharedLibrariesTable,
    payload: { id: string; errorChangeState: string }
  ): ISharedLibrariesTable {
    return updateById(table, payload.id, {
      isUpdatingState: false,
      errorChangeState: payload.errorChangeState,
    });
  }

  function removed(
    table: ISharedLibrariesTable,
    payload: ISharedLibraryRow
  ): ISharedLibrariesTable {
    return removeById(table, payload.id);
  }

  function deployComponentSuccess(
    table: ISharedLibrariesTable,
    payload: IComponentBackendSSE
  ) {
    return payload.sharedLibraries.reduce((acc, sl) => {
      return updateById(acc, sl, {
        components: [...table.byId[sl].components, payload.id],
      });
    }, table);
  }

  function removeComponent(
    table: ISharedLibrariesTable,
    payload: IComponentRow
  ) {
    return payload.sharedLibraries.reduce((acc, sl) => {
      return updateById(acc, sl, {
        components: table.byId[sl].components.filter(id => id !== payload.id),
      });
    }, table);
  }
}
