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
import { omit } from 'underscore';

import { busesInProgressTableFactory } from './buses-in-progress.initial-state';
import { IBusesInProgressTable } from './buses-in-progress.interface';
import { IBusInProgressRow } from './bus-in-progress.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';

export class BusesInProgress {
  private static reducerName = 'BUSES_IN_PROGRESS_REDUCER';

  public static reducer(busesInProgressTable = busesInProgressTableFactory(), { type, payload }: Action) {
    if (!BusesInProgress.mapActionsToMethod[type]) {
      return busesInProgressTable;
    }

    return BusesInProgress.mapActionsToMethod[type](busesInProgressTable, payload) || busesInProgressTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUSES_IN_PROGRESS = `${BusesInProgress.reducerName}_FETCH_BUSES_IN_PROGRESS`;
  private static fetchBusesInProgress(busesInProgressTable: IBusesInProgressTable, payload) {
    let allIds = busesInProgressTable.allIds;

    payload.allIds.forEach(busId => {
      if (!busesInProgressTable.byId[busId]) {
        allIds = [...allIds, busId];
      }
    });

    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      byId: {
        ...busesInProgressTable.byId,
        ...payload.byId
      },
      allIds
    };
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_SET_CURRENT_BUS_IN_PROGRESS`;
  private static setCurrentBusInProgress(busesInProgressTable: IBusesInProgressTable, payload: { busInProgressId: string } ) {
    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        selectedBusInProgressId: payload.busInProgressId,
        isImportingBus: false,
        importBusError: '',
        importBusId: ''
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_POST_BUS_IN_PROGRESS`;
  private static postBusInProgress(busesInProgressTable: IBusesInProgressTable, _payload) {
    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        isImportingBus: true,
        importBusError: '',
        importBusId: ''
      }
    };
  }

  // once the http request is done
  // tslint:disable-next-line:member-ordering
  public static POST_BUS_IN_PROGRESS_SUCCESS = `${BusesInProgress.reducerName}_POST_BUS_IN_PROGRESS_SUCCESS`;
  private static postBusInProgressSuccess(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        importBusId: payload.id
      }
    };
  }

  // once the http request is done but failed
  // tslint:disable-next-line:member-ordering
  public static POST_BUS_IN_PROGRESS_ERROR = `${BusesInProgress.reducerName}_POST_BUS_IN_PROGRESS_ERROR`;
  private static postBusInProgressError(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        isImportingBus: false,
        importBusError: payload,
        importBusId: ''
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_DELETE_BUS_IN_PROGRESS`;
  private static deleteBusInProgress(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        byId: {
          ...busesInProgressTable.byId,
          [payload.id]: <IBusInProgressRow>{
            ...busesInProgressTable.byId[payload.id],
            ...<IBusInProgressRow>{ isRemoving: true }
          }
        }
      }
    };
  }

  // once the http request is done, no particular modification of the store, since it will be deleted
  // tslint:disable-next-line:member-ordering
  public static DELETE_BUS_IN_PROGRESS_SUCCESS = `${BusesInProgress.reducerName}_DELETE_BUS_IN_PROGRESS_SUCCESS`;

  // tslint:disable-next-line:member-ordering
  public static REMOVE_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_REMOVE_BUS_IN_PROGRESS`;
  private static removeBusInProgress(busesInProgressTable: IBusesInProgressTable, payload: string) {
    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        byId: omit(busesInProgressTable.byId, payload),
        allIds: busesInProgressTable.allIds.filter(id => id !== payload)
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static UPDATE_ERROR_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_UPDATE_ERROR_BUS_IN_PROGRESS`;
  private static updateErrorBusInProgress(busesInProgressTable: IBusesInProgressTable, payload: { id: string, importError: string }) {
    return <IBusesInProgressTable>{
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        byId: {
          ...busesInProgressTable.byId,
          [payload.id]: {
            ...busesInProgressTable.byId[payload.id],
            importError: payload.importError
          }
        }
      }
    };
  }

  private static cleanWorkspace(_busesInProgressTable: IBusesInProgressTable, _payload) {
    return busesInProgressTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [BusesInProgress.FETCH_BUSES_IN_PROGRESS]: BusesInProgress.fetchBusesInProgress,
    [BusesInProgress.SET_CURRENT_BUS_IN_PROGRESS]: BusesInProgress.setCurrentBusInProgress,
    [BusesInProgress.POST_BUS_IN_PROGRESS]: BusesInProgress.postBusInProgress,
    [BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS]: BusesInProgress.postBusInProgressSuccess,
    [BusesInProgress.POST_BUS_IN_PROGRESS_ERROR]: BusesInProgress.postBusInProgressError,
    [BusesInProgress.DELETE_BUS_IN_PROGRESS]: BusesInProgress.deleteBusInProgress,
    [BusesInProgress.REMOVE_BUS_IN_PROGRESS]: BusesInProgress.removeBusInProgress,
    [BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS]: BusesInProgress.updateErrorBusInProgress,

    [Workspaces.CLEAN_WORKSPACE]: BusesInProgress.cleanWorkspace
  };
}
