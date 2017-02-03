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

import { IBusRow } from './bus.interface';
import { IBusesTable } from './buses.interface';
import { busesTableFactory } from './buses.initial-state';
import { Users } from './../../../../../shared/state/users.reducer';

export class Buses {
  private static reducerName = 'BUSES_REDUCER';

  public static reducer(busesTable = busesTableFactory(), {type, payload}: Action) {
    if (!Buses.mapActionsToMethod[type]) {
      return busesTable;
    }

    return Buses.mapActionsToMethod[type](busesTable, payload) || busesTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUSES_SUCCESS = `${Buses.reducerName}_FETCH_BUSES_SUCCESS`;
  private static fetchBusesSuccess(busesTable: IBusesTable, payload) {
    let allIds = busesTable.allIds;

    payload.allIds.forEach(busId => {
      if (!busesTable.byId[busId]) {
        allIds = [...allIds, busId];
      }
    });

    return <IBusesTable>Object.assign({},
      busesTable,
      {
        byId: Object.assign({}, busesTable.byId, payload.byId),
        allIds
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_BUS = `${Buses.reducerName}_FOLD_BUS`;
  private static foldBus(busesTable: IBusesTable, payload: { busId: string }) {
    return <IBusesTable>Object.assign(
      {},
      busesTable,
      {
        byId: Object.assign(
          {},
          busesTable.byId,
          {
            [payload.busId]: <IBusRow>Object.assign(
              {},
              busesTable.byId[payload.busId],
              { isFolded: true }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_BUS = `${Buses.reducerName}_UNFOLD_BUS`;
  private static unfoldBus(busesTable: IBusesTable, payload: { busId: string }) {
    return <IBusesTable>Object.assign(
      {},
      busesTable,
      {
        byId: Object.assign(
          {},
          busesTable.byId,
          {
            [payload.busId]: <IBusRow>Object.assign(
              {},
              busesTable.byId[payload.busId],
              { isFolded: false }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_BUS = `${Buses.reducerName}_TOGGLE_FOLD_BUS`;
  private static toggleFoldBus(busesTable: IBusesTable, payload: { busId: string }) {
    const bus = busesTable.byId[payload.busId];

    if (bus.isFolded) {
      return Buses.unfoldBus(busesTable, payload);
    }

    return Buses.foldBus(busesTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_BUS = `${Buses.reducerName}_SET_CURRENT_BUS`;
  private static setCurrentBus(busesTable: IBusesTable, payload: { busId: string }) {
    return Object.assign({}, busesTable, <IBusesTable>{
      selectedBusId: payload.busId
    });
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_BUS = `${Buses.reducerName}_REMOVE_BUS`;
  private static removeBus(busesTable: IBusesTable, payload: { busId: string }) {
    if (typeof busesTable.byId[payload.busId] !== 'undefined') {
      return Object.assign({}, omit(busesTable, 'byId'), <IBusesTable>{
        byId: omit(busesTable.byId, payload.busId),
        allIds: busesTable.allIds.filter(id => id !== payload.busId)
      });
    }

    return busesTable;
  }

  private static disconnectUserSuccess(busesTable: IBusesTable, payload) {
    return busesTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Buses.FETCH_BUSES_SUCCESS]: Buses.fetchBusesSuccess,
    [Buses.FOLD_BUS]: Buses.foldBus,
    [Buses.UNFOLD_BUS]: Buses.unfoldBus,
    [Buses.TOGGLE_FOLD_BUS]: Buses.toggleFoldBus,
    [Buses.SET_CURRENT_BUS]: Buses.setCurrentBus,
    [Buses.REMOVE_BUS]: Buses.removeBus,

    [Users.DISCONNECT_USER_SUCCESS]: Buses.disconnectUserSuccess
  };
}