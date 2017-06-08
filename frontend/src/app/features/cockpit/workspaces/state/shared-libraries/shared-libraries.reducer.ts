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

import { Action } from '@ngrx/store';

import { Workspaces } from '../workspaces/workspaces.reducer';
import {
  updateById,
  mergeOnly,
  JsMap,
  putAll,
} from 'app/shared/helpers/map.helper';
import {
  ISharedLibrariesTable,
  sharedLibrariesTableFactory,
  sharedLibraryRowFactory,
} from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';
import {
  ISharedLibraryBackendSSE,
  ISharedLibraryBackendDetails,
} from 'app/shared/services/shared-libraries.service';

export class SharedLibraries {
  private static reducerName = '[Shared libraries]';

  public static reducer(
    sharedLibrariesTable = sharedLibrariesTableFactory(),
    { type, payload }: Action
  ): ISharedLibrariesTable {
    if (!SharedLibraries.mapActionsToMethod[type]) {
      return sharedLibrariesTable;
    }

    return (
      SharedLibraries.mapActionsToMethod[type](sharedLibrariesTable, payload) ||
      sharedLibrariesTable
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCHED = `${SharedLibraries.reducerName} Fetched`;
  private static fetched(
    sharedLibrariesTable: ISharedLibrariesTable,
    payload: JsMap<ISharedLibraryBackendSSE>
  ): ISharedLibrariesTable {
    return mergeOnly(sharedLibrariesTable, payload, sharedLibraryRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static ADDED = `${SharedLibraries.reducerName} Added`;
  private static added(
    sharedLibrariesTable: ISharedLibrariesTable,
    payload: JsMap<ISharedLibraryBackendSSE>
  ): ISharedLibrariesTable {
    return putAll(sharedLibrariesTable, payload, sharedLibraryRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT = `${SharedLibraries.reducerName} Set current`;
  private static setCurrent(
    sharedLibrariesTable: ISharedLibrariesTable,
    payload: { id: string }
  ): ISharedLibrariesTable {
    return {
      ...sharedLibrariesTable,
      selectedSharedLibraryId: payload.id,
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_DETAILS = `${SharedLibraries.reducerName} Fetch details`;
  private static fetchDetails(
    sharedLibrariesTable: ISharedLibrariesTable,
    payload: { id: string }
  ): ISharedLibrariesTable {
    return updateById(sharedLibrariesTable, payload.id, {
      isFetchingDetails: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_DETAILS_SUCCESS = `${SharedLibraries.reducerName} Fetch details success`;
  private static fetchDetailsSuccess(
    sharedLibrariesTable: ISharedLibrariesTable,
    payload: { id: string; data: ISharedLibraryBackendDetails }
  ): ISharedLibrariesTable {
    return updateById(sharedLibrariesTable, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_DETAILS_ERROR = `${SharedLibraries.reducerName} Fetch details error`;
  private static fetchDetailsError(
    sharedLibrariesTable: ISharedLibrariesTable,
    payload: { id: string }
  ): ISharedLibrariesTable {
    return updateById(sharedLibrariesTable, payload.id, {
      isFetchingDetails: false,
    });
  }

  private static cleanWorkspace(
    _sharedLibrariesTable: ISharedLibrariesTable,
    _payload
  ): ISharedLibrariesTable {
    return sharedLibrariesTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: {
    [type: string]: (t: ISharedLibrariesTable, p: any) => ISharedLibrariesTable;
  } = {
    [SharedLibraries.FETCHED]: SharedLibraries.fetched,
    [SharedLibraries.ADDED]: SharedLibraries.added,
    [SharedLibraries.SET_CURRENT]: SharedLibraries.setCurrent,
    [SharedLibraries.FETCH_DETAILS]: SharedLibraries.fetchDetails,
    [SharedLibraries.FETCH_DETAILS_SUCCESS]:
      SharedLibraries.fetchDetailsSuccess,
    [SharedLibraries.FETCH_DETAILS_ERROR]: SharedLibraries.fetchDetailsError,

    [Workspaces.CLEAN_WORKSPACE]: SharedLibraries.cleanWorkspace,
  };
}
