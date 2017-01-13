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
  public static FETCH_BUSSES_IN_PROGRESS = `${BusesInProgress.reducerName}_FETCH_BUSSES_IN_PROGRESS`;
  private static fetchBussesInProgress(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>Object.assign({}, busesInProgressTable, payload);
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
    [BusesInProgress.FETCH_BUSSES_IN_PROGRESS]: BusesInProgress.fetchBussesInProgress,
  };
}
