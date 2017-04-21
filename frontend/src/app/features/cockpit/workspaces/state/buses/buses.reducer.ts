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

import { IBusesTable, busesTableFactory } from './buses.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { putAll, updateById, removeById } from 'app/shared/helpers/map.helper';
import { busRowFactory } from 'app/features/cockpit/workspaces/state/buses/bus.interface';

export class Buses {
  private static reducerName = '[Buses]';

  public static reducer(busesTable = busesTableFactory(), { type, payload }: Action): IBusesTable {
    if (!Buses.mapActionsToMethod[type]) {
      return busesTable;
    }

    return Buses.mapActionsToMethod[type](busesTable, payload) || busesTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUSES_SUCCESS = `${Buses.reducerName} Fetch buses success`;
  private static fetchBusesSuccess(busesTable: IBusesTable, payload): IBusesTable {
    return putAll(busesTable, payload, busRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_BUS = `${Buses.reducerName} Fold bus`;
  private static foldBus(busesTable: IBusesTable, payload: { busId: string }): IBusesTable {
    if (!busesTable.byId[payload.busId] || busesTable.byId[payload.busId].isFolded) {
      return busesTable;
    }

    return updateById(busesTable, payload.busId, { isFolded: true });
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_BUS = `${Buses.reducerName} Unfold bus`;
  private static unfoldBus(busesTable: IBusesTable, payload: { busId: string }): IBusesTable {
    if (!busesTable.byId[payload.busId] || !busesTable.byId[payload.busId].isFolded) {
      return busesTable;
    }

    return updateById(busesTable, payload.busId, { isFolded: false });
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_BUS = `${Buses.reducerName} Toggle fold bus`;
  private static toggleFoldBus(busesTable: IBusesTable, payload: { busId: string }): IBusesTable {
    const bus = busesTable.byId[payload.busId];

    if (!bus) {
      return busesTable;
    }

    if (bus.isFolded) {
      return Buses.unfoldBus(busesTable, payload);
    }

    return Buses.foldBus(busesTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_BUS = `${Buses.reducerName} Set current bus`;
  private static setCurrentBus(busesTable: IBusesTable, payload: { busId: string }): IBusesTable {
    return {
      ...busesTable,
      ...<IBusesTable>{
        selectedBusId: payload.busId
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUS_DETAILS = `${Buses.reducerName} Fetch bus details`;
  private static fetchBusDetails(busesTable: IBusesTable, payload: { busId: string }): IBusesTable {
    return updateById(busesTable, payload.busId, { isFetchingDetails: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUS_DETAILS_SUCCESS = `${Buses.reducerName} Fetch bus details success`;
  private static fetchBusDetailsSuccess(busesTable: IBusesTable, payload: { busId: string, data: any }): IBusesTable {
    return updateById(busesTable, payload.busId, { ...payload.data, isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUS_DETAILS_ERROR = `${Buses.reducerName} Fetch bus details error`;
  private static fetchBusDetailsError(busesTable: IBusesTable, payload: { busId: string }): IBusesTable {
    return updateById(busesTable, payload.busId, { isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_BUS = `${Buses.reducerName} Delete bus`;
  private static deleteBus(busesTable: IBusesTable, payload: string): IBusesTable {
    return updateById(busesTable, payload, { isRemoving: true });
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_BUS_FAILED = `${Buses.reducerName} Delete bus failed`;
  private static deleteBusFailed(busesTable: IBusesTable, payload: string): IBusesTable {
    return updateById(busesTable, payload, { isRemoving: false });
  }

  /**
   * Note: while DELETE_BUS concerns the HTTP action of deleting a bus,
   * REMOVE_BUS concerns the event coming from the SSE that a bus has been deleted.
   */
  // tslint:disable-next-line:member-ordering
  public static REMOVE_BUS = `${Buses.reducerName} Remove bus`;
  private static removeBus(busesTable: IBusesTable, payload: { busId: string }): IBusesTable {
    return removeById(busesTable, payload.busId);
  }

  private static cleanWorkspace(_busesTable: IBusesTable, _payload): IBusesTable {
    return busesTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: { [type: string]: (t: IBusesTable, p: any) => IBusesTable } = {
    [Buses.FETCH_BUSES_SUCCESS]: Buses.fetchBusesSuccess,
    [Buses.FOLD_BUS]: Buses.foldBus,
    [Buses.UNFOLD_BUS]: Buses.unfoldBus,
    [Buses.TOGGLE_FOLD_BUS]: Buses.toggleFoldBus,
    [Buses.SET_CURRENT_BUS]: Buses.setCurrentBus,
    [Buses.FETCH_BUS_DETAILS]: Buses.fetchBusDetails,
    [Buses.FETCH_BUS_DETAILS_SUCCESS]: Buses.fetchBusDetailsSuccess,
    [Buses.FETCH_BUS_DETAILS_ERROR]: Buses.fetchBusDetailsError,
    [Buses.DELETE_BUS]: Buses.deleteBus,
    [Buses.DELETE_BUS_FAILED]: Buses.deleteBusFailed,
    [Buses.REMOVE_BUS]: Buses.removeBus,

    [Workspaces.CLEAN_WORKSPACE]: Buses.cleanWorkspace
  };
}
