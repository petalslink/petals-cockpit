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

import { IBusInProgressBackend } from 'app/shared/services/buses.service';
import {
  IBusesInProgressTable,
  busesInProgressTableFactory,
  busInProgressRowFactory,
} from './buses-in-progress.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';
import {
  putAll,
  updateById,
  removeById,
  mergeOnly,
  JsMap,
} from 'app/shared/helpers/map.helper';

export class BusesInProgress {
  private static reducerName = '[Buses In Prog]';

  public static reducer(
    busesInProgressTable = busesInProgressTableFactory(),
    { type, payload }: Action
  ): IBusesInProgressTable {
    if (!BusesInProgress.mapActionsToMethod[type]) {
      return busesInProgressTable;
    }

    return (
      BusesInProgress.mapActionsToMethod[type](busesInProgressTable, payload) ||
      busesInProgressTable
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUSES_IN_PROGRESS = `${BusesInProgress.reducerName} Fetch buses in progress`;
  private static fetchBusesInProgress(
    busesInProgressTable: IBusesInProgressTable,
    payload: JsMap<IBusInProgressBackend>
  ): IBusesInProgressTable {
    return mergeOnly(busesInProgressTable, payload, busInProgressRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static ADD_BUSES_IN_PROGRESS = `${BusesInProgress.reducerName} Add buses in progress`;
  private static addBusesInProgress(
    busesInProgressTable: IBusesInProgressTable,
    payload: JsMap<IBusInProgressBackend>
  ): IBusesInProgressTable {
    return putAll(busesInProgressTable, payload, busInProgressRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_BUS_IN_PROGRESS = `${BusesInProgress.reducerName} Set current bus in progress`;
  private static setCurrentBusInProgress(
    busesInProgressTable: IBusesInProgressTable,
    payload: { busInProgressId: string }
  ): IBusesInProgressTable {
    return {
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        selectedBusInProgressId: payload.busInProgressId,
        isImportingBus: false,
        importBusError: '',
        importBusId: '',
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_BUS_IN_PROGRESS = `${BusesInProgress.reducerName} Post bus in progress`;
  private static postBusInProgress(
    busesInProgressTable: IBusesInProgressTable,
    _payload
  ): IBusesInProgressTable {
    return {
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        isImportingBus: true,
        importBusError: '',
        importBusId: '',
      },
    };
  }

  // once the http request is done
  // the bus itself will be added from buses reducer
  // tslint:disable-next-line:member-ordering
  public static POST_BUS_IN_PROGRESS_SUCCESS = `${BusesInProgress.reducerName} Post bus in progress success`;
  private static postBusInProgressSuccess(
    busesInProgressTable: IBusesInProgressTable,
    payload
  ): IBusesInProgressTable {
    return {
      ...busesInProgressTable,
      ...<IBusesInProgressTable>{
        importBusId: payload.id,
      },
    };
  }

  // once the http request is done but failed
  // tslint:disable-next-line:member-ordering
  public static POST_BUS_IN_PROGRESS_ERROR = `${BusesInProgress.reducerName} Post bus in progress error`;
  private static postBusInProgressError(
    busesInProgressTable: IBusesInProgressTable,
    payload
  ): IBusesInProgressTable {
    // if it's false, it means we changed bus (with SET_CURRENT_BUS_IN_PROGRESS)
    if (busesInProgressTable.isImportingBus) {
      return {
        ...busesInProgressTable,
        ...<IBusesInProgressTable>{
          isImportingBus: false,
          importBusError: payload,
          importBusId: '',
        },
      };
    } else {
      return busesInProgressTable;
    }
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_BUS_IN_PROGRESS = `${BusesInProgress.reducerName} Delete bus in progress`;
  private static deleteBusInProgress(
    busesInProgressTable: IBusesInProgressTable,
    payload
  ): IBusesInProgressTable {
    return updateById(busesInProgressTable, payload.id, { isRemoving: true });
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_BUS_IN_PROGRESS_FAILED = `${BusesInProgress.reducerName} Delete bus in progress failed`;
  private static deleteBusInProgressFailed(
    busesInProgressTable: IBusesInProgressTable,
    payload: string
  ): IBusesInProgressTable {
    return updateById(busesInProgressTable, payload, { isRemoving: false });
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_BUS_IN_PROGRESS = `${BusesInProgress.reducerName} Remove bus in progress`;
  private static removeBusInProgress(
    busesInProgressTable: IBusesInProgressTable,
    payload: string
  ): IBusesInProgressTable {
    return removeById(busesInProgressTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static UPDATE_ERROR_BUS_IN_PROGRESS = `${BusesInProgress.reducerName} Update error bus in progress`;
  private static updateErrorBusInProgress(
    busesInProgressTable: IBusesInProgressTable,
    payload: { id: string; importError: string }
  ): IBusesInProgressTable {
    return updateById(busesInProgressTable, payload.id, {
      importError: payload.importError,
    });
  }

  private static cleanWorkspace(
    _busesInProgressTable: IBusesInProgressTable,
    _payload
  ): IBusesInProgressTable {
    return busesInProgressTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: {
    [type: string]: (t: IBusesInProgressTable, p: any) => IBusesInProgressTable;
  } = {
    [BusesInProgress.FETCH_BUSES_IN_PROGRESS]:
      BusesInProgress.fetchBusesInProgress,
    [BusesInProgress.ADD_BUSES_IN_PROGRESS]: BusesInProgress.addBusesInProgress,
    [BusesInProgress.SET_CURRENT_BUS_IN_PROGRESS]:
      BusesInProgress.setCurrentBusInProgress,
    [BusesInProgress.POST_BUS_IN_PROGRESS]: BusesInProgress.postBusInProgress,
    [BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS]:
      BusesInProgress.postBusInProgressSuccess,
    [BusesInProgress.POST_BUS_IN_PROGRESS_ERROR]:
      BusesInProgress.postBusInProgressError,
    [BusesInProgress.DELETE_BUS_IN_PROGRESS]:
      BusesInProgress.deleteBusInProgress,
    [BusesInProgress.DELETE_BUS_IN_PROGRESS_FAILED]:
      BusesInProgress.deleteBusInProgressFailed,
    [BusesInProgress.REMOVE_BUS_IN_PROGRESS]:
      BusesInProgress.removeBusInProgress,
    [BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS]:
      BusesInProgress.updateErrorBusInProgress,

    [Workspaces.CLEAN_WORKSPACE]: BusesInProgress.cleanWorkspace,
  };
}
