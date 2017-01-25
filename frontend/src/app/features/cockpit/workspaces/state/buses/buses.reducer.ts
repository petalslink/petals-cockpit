import { Action } from '@ngrx/store';

import { IBusRow } from './bus.interface';
import { IBusesTable } from './buses.interface';
import { busesTableFactory } from './buses.initial-state';

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

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Buses.FETCH_BUSES_SUCCESS]: Buses.fetchBusesSuccess,
    [Buses.FOLD_BUS]: Buses.foldBus,
    [Buses.UNFOLD_BUS]: Buses.unfoldBus,
    [Buses.TOGGLE_FOLD_BUS]: Buses.toggleFoldBus,
    [Buses.SET_CURRENT_BUS]: Buses.setCurrentBus
  };
}
