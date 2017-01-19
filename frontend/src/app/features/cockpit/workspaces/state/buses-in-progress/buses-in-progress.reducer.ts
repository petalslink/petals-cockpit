import { Action } from '@ngrx/store';

import { busesInProgressTableFactory } from './buses-in-progress.initial-state';
import { IBusesInProgressTable } from './buses-in-progress.interface';

export class BusesInProgress {
  private static reducerName = 'BUSES_IN_PROGRESS_REDUCER';

  public static reducer(busesInProgressTable = busesInProgressTableFactory(), {type, payload}: Action) {
    if (!BusesInProgress.mapActionsToMethod[type]) {
      return busesInProgressTable;
    }

    return BusesInProgress.mapActionsToMethod[type](busesInProgressTable, payload) || busesInProgressTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_BUSES_IN_PROGRESS = `${BusesInProgress.reducerName}_FETCH_BUSES_IN_PROGRESS`;
  private static fetchBusesInProgress(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>Object.assign({}, busesInProgressTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_SELECTED_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_SET_SELECTED_BUS_IN_PROGRESS`;
  private static setSelectedBusInProgress(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>Object.assign({}, busesInProgressTable, <IBusesInProgressTable>{
      selectedBusInProgressId: payload
    });
  }

  // tslint:disable-next-line:member-ordering
  // public static FOLD_BUS = `${BusesInProgress.reducerName}_FOLD_BUS`;
  // private static foldBus(busesTable: IBusesTable, payload: { busId: string }) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.busId]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.busId],
  //             { isFolded: true }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [BusesInProgress.FETCH_BUSES_IN_PROGRESS]: BusesInProgress.fetchBusesInProgress,
    [BusesInProgress.SET_SELECTED_BUS_IN_PROGRESS]: BusesInProgress.setSelectedBusInProgress,
  };
}
