import { Action } from '@ngrx/store';
import { omit } from 'underscore';

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
    let allIds = busesInProgressTable.allIds;

    payload.allIds.forEach(busId => {
      if (!busesInProgressTable.byId[busId]) {
        allIds = [...allIds, busId];
      }
    });

    return <IBusesInProgressTable>Object.assign({},
      busesInProgressTable,
      {
        byId: Object.assign({}, busesInProgressTable.byId, payload.byId),
        allIds
      }
    );
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

  // tslint:disable-next-line:member-ordering
  public static REMOVE_BUS_IN_PROGRESS = `${BusesInProgress.reducerName}_REMOVE_BUS_IN_PROGRESS`;
  private static removeBusInProgress(busesInProgressTable: IBusesInProgressTable, payload: { busInProgressId: string }) {
    return <IBusesInProgressTable>Object.assign({}, busesInProgressTable, <IBusesInProgressTable>{
      byId: omit(busesInProgressTable.byId, payload.busInProgressId),
      allIds: busesInProgressTable.allIds.filter(id => id !== payload.busInProgressId)
    });
  }

  // when the SSE received an event saying that the bus is now imported
  // tslint:disable-next-line:member-ordering
  // public static BUS_IMPORT_OK = `${BusesInProgress.reducerName}_BUS_IMPORT_OK`;
  // private static busImportOk(busesInProgressTable: IBusesInProgressTable, payload) {
  //   const busesInProgressTableTmp = <IBusesInProgressTable>Object.assign({}, busesInProgressTable, <IBusesInProgressTable>{
  //     allIds: busesInProgressTable.allIds.filter(id => id !== payload.bus.id)
  //   });

  //   delete busesInProgressTableTmp.byId[payload.bus.id];

  //   return busesInProgressTableTmp;
  // }

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
    [BusesInProgress.REMOVE_BUS_IN_PROGRESS]: BusesInProgress.removeBusInProgress,
    // [BusesInProgress.]: BusesInProgress.busImportOk,
  };
}
