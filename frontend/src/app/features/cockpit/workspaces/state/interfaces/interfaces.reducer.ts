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
  mergeInto,
  putAll,
  toJsTable,
  updateById,
} from '@shared/helpers/jstable.helper';
import {
  IInterfaceBackendDetails,
  IInterfaceBackendSSE,
} from '@shared/services/interfaces.service';
import { SseActions } from '@shared/services/sse.service';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import { Interfaces } from './interfaces.actions';
import {
  IInterfaceRow,
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
    | Workspaces.CleanWorkspace
    | SseActions.ServicesUpdated
    | SseActions.BusDetached;

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
      case Workspaces.CleanWorkspaceType: {
        return interfacesTableFactory();
      }
      case SseActions.ServicesUpdatedType: {
        return interfacesUpdated(table, action.payload);
      }
      case SseActions.BusDetachedType: {
        return interfacesUpdated(table, action.payload.content);
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
    return { ...mergeInto(table, payload, interfaceRowFactory) };
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
    return {
      ...updateById(table, payload.id, {
        isFetchingDetails: false,
      }),
      selectedInterfaceId: payload.id,
      selectedInterfaceServices: payload.data.services,
      selectedInterfaceEndpoints: payload.data.endpoints,
    };
  }

  function fetchDetailsError(table: IInterfacesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isFetchingDetails: false,
    });
  }

  function interfacesUpdated(
    table: IInterfacesTable,
    payload: { interfaces: { [key: string]: IInterfaceBackendSSE } }
  ) {
    const interfaces = interfaceBackendSseMapToInterfaceRowMap(
      payload.interfaces
    );
    return { ...table, ...toJsTable(interfaces) };
  }

  function interfaceBackendSseMapToInterfaceRowMap(ibsMap: {
    [key: string]: IInterfaceBackendSSE;
  }): { [key: string]: IInterfaceRow } {
    const initialInterfaces: { [key: string]: IInterfaceRow } = {};
    const interfaces = Object.values(ibsMap).reduce(
      (previousValue, currentValue) => {
        previousValue[currentValue.id] = {
          ...currentValue,
          isFetchingDetails: false,
        };
        return previousValue;
      },
      initialInterfaces
    );

    return interfaces;
  }
}
