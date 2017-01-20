import { Action } from '@ngrx/store';

import { busesInProgressTableFactory } from './buses-in-progress.initial-state';
import { IBusesInProgressTable } from './buses-in-progress.interface';
import { IBusInProgressRow } from './bus-in-progress.interface';

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
  public static POST_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_POST_BUS_IN_PROGRESS`;
  private static postBusInProgress(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>Object.assign({}, busesInProgressTable, <IBusesInProgressTable>{
      isImportingBus: true
    });
  }

  // once the http request is done
  // tslint:disable-next-line:member-ordering
  public static POST_BUS_IN_PROGRESS_SUCCESS = `${BusesInProgress.reducerName}_POST_BUS_IN_PROGRESS_SUCCESS`;
  private static postBusInProgressSuccess(busesInProgressTable: IBusesInProgressTable, payload) {
    return <IBusesInProgressTable>Object.assign({}, busesInProgressTable, <IBusesInProgressTable>{
      isImportingBus: false,
      byId: Object.assign({}, busesInProgressTable.byId, {
        [payload.busInProgress.id]: <IBusInProgressRow>Object.assign({}, payload.busInProgress)
      }),
      allIds: [...busesInProgressTable.allIds, payload.busInProgress.id]
    });
  }

  // when the SSE received an event saying that the bus is now imported
  public static BUS_IN_PROGRESS_IMPORT_SUCCESS = `${BusesInProgress.reducerName}_BUS_IN_PROGRESS_IMPORT_SUCCESS`;
  //TODO : Implement the method

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
    [BusesInProgress.POST_BUS_IN_PROGRESS]: BusesInProgress.postBusInProgress,
    [BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS]: BusesInProgress.postBusInProgressSuccess,
  };
}
