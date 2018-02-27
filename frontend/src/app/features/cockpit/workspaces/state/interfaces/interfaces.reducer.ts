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
  IInterfaceBackendDetails,
  IInterfaceBackendSSE,
} from 'app/shared/services/interfaces.service';
import { Interfaces } from './interfaces.actions';
import {
  IInterfacesTable,
  interfaceRowFactory,
  interfacesTableFactory,
} from './interfaces.interface';

export namespace InterfacesReducer {
  type All =
    | Interfaces.Added
    | Interfaces.SetCurrent
    | Interfaces.Fetched
    | Interfaces.FetchDetails
    | Interfaces.FetchDetailsError
    | Interfaces.FetchDetailsSuccess
    | Interfaces.Clean
    | Workspaces.Clean;

  export function reducer(
    table = interfacesTableFactory(),
    action: All
  ): IInterfacesTable {
    switch (action.type) {
      case Interfaces.AddedType: {
        return added(table, action.payload);
      }
      case Interfaces.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case Interfaces.FetchedType: {
        return fetched(table, action.payload);
      }
      case Interfaces.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case Interfaces.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case Interfaces.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case Interfaces.CleanType: {
        return interfacesTableFactory();
      }
      case Workspaces.CleanType: {
        return interfacesTableFactory();
      }
      default:
        return table;
    }
  }

  function added(
    table: IInterfacesTable,
    payload: JsTable<IInterfaceBackendSSE>
  ) {
    return putAll(table, payload, interfaceRowFactory);
  }

  function setCurrent(
    table: IInterfacesTable,
    payload: { id: string }
  ): IInterfacesTable {
    return {
      ...table,
      selectedInterfaceId: payload.id,
    };
  }

  function fetched(
    table: IInterfacesTable,
    payload: JsTable<IInterfaceBackendSSE>
  ): IInterfacesTable {
    return {
      ...mergeInto(table, payload, interfaceRowFactory),
    };
  }

  function fetchDetails(table: IInterfacesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: true,
    });
  }

  function fetchDetailsSuccess(
    table: IInterfacesTable,
    payload: { id: string; data: IInterfaceBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(table: IInterfacesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }
}
