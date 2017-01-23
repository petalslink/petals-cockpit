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
        allIds = [...busesTable.allIds, busId];
      }
    });

    return <IBusesTable>Object.assign({},
      busesTable,
      {
        byId: Object.assign({}, busesTable.byId, payload.byId)
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
  // public static IMPORT_BUS = `${Buses.reducerName}_IMPORT_BUS`;
  // private static importBus(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign({}, busesTable, { importingBus: true });
  // }

  // tslint:disable-next-line:member-ordering
  // public static IMPORT_BUS_SUCCESS = `${Buses.reducerName}_IMPORT_BUS_SUCCESS`;
  // private static importBusSuccess(busesTable, type, payload) {
  //   // once the bus is imported, move it from workspaces
  //   // but not here as it's been done in an async way using sse
  //   // CF ADD_BUS_SUCCESS
  //   return <IBusesTable>Object.assign({}, busesTable, { importingBus: false });
  // }

  // tslint:disable-next-line:member-ordering
  // public static IMPORT_BUS_FAILED = `${Buses.reducerName}_IMPORT_BUS_FAILED`;
  // private static importBusFailed(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign({}, busesTable, { importingBus: false });
  // }

  // tslint:disable-next-line:member-ordering
  // public static ADD_BUS_SUCCESS = `${Buses.reducerName}_ADD_BUS_SUCCESS`;
  // private static addBusSuccess(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.id]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.id],
  //             { isInProgress: false }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static ADD_BUS_FAILED = `${Buses.reducerName}_ADD_BUS_FAILED`;
  // private static addBusFailed(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.id]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.id],
  //             { importError: payload.importError }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static REMOVE_BUS = `${Buses.reducerName}_REMOVE_BUS`;
  // private static removeBus(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.id]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.id],
  //             { isBeingRemoved: true }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static REMOVE_BUS_SUCCESS = `${Buses.reducerName}_REMOVE_BUS_SUCCESS`;
  // private static removeBusSuccess(busesTable, type, payload) {
  //   let busesCp = <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.id]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.id]
  //           )
  //         }
  //       )
  //     }
  //   );

  //   delete busesCp.byId[payload.id];

  //   return busesCp;
  // }

  // tslint:disable-next-line:member-ordering
  // public static REMOVE_BUS_FAILED = `${Buses.reducerName}_REMOVE_BUS_FAILED`;
  // private static removeBusFailed(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.id]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.id],
  //             { isBeingRemoved: false }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static FETCH_BUS_DETAILS = `${Buses.reducerName}_FETCH_BUS_DETAILS`;
  // private static fetchBusDetails(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.idBus]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.idBus],
  //             { isFetchingDetails: true }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static FETCH_BUS_DETAILS_SUCCESS = `${Buses.reducerName}_FETCH_BUS_DETAILS_SUCCESS`;
  // private static fetchBusDetailsSuccess(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.id]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.id],
  //             payload,
  //             { isFetchingDetails: false }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static FETCH_BUS_DETAILS_FAILED = `${Buses.reducerName}_FETCH_BUS_DETAILS_FAILED`;
  // private static fetchBusDetailsFailed(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.id]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.id],
  //             payload,
  //             { isFetchingDetails: false }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static FOLD_BUS = `${Buses.reducerName}_FOLD_BUS`;
  // private static foldBus(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.idBus]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.idBus],
  //             { isFolded: true }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static UNFOLD_BUS = `${Buses.reducerName}_UNFOLD_BUS`;
  // private static unfoldBus(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.idBus]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.idBus],
  //             { isFolded: false }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // tslint:disable-next-line:member-ordering
  // public static TOGGLE_FOLD_BUS = `${Buses.reducerName}_TOGGLE_FOLD_BUS`;
  // private static toggleFoldBus(busesTable, type, payload) {
  //   return <IBusesTable>Object.assign(
  //     {},
  //     busesTable,
  //     {
  //       byId: Object.assign(
  //         {},
  //         busesTable.byId,
  //         {
  //           [payload.idBus]: <IBusRow>Object.assign(
  //             {},
  //             busesTable.byId[payload.idBus],
  //             { isFolded: !busesTable.byId[payload.idBus].isFolded }
  //           )
  //         }
  //       )
  //     }
  //   );
  // }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Buses.FETCH_BUSES_SUCCESS]: Buses.fetchBusesSuccess,
    [Buses.FOLD_BUS]: Buses.foldBus,
    [Buses.UNFOLD_BUS]: Buses.unfoldBus,
    [Buses.TOGGLE_FOLD_BUS]: Buses.toggleFoldBus,
    [Buses.SET_CURRENT_BUS]: Buses.setCurrentBus,
    // [Buses.IMPORT_BUS]: Buses.importBus,
    // [Buses.IMPORT_BUS_SUCCESS]: Buses.importBusSuccess,
    // [Buses.IMPORT_BUS_FAILED]: Buses.importBusFailed,
    // [Buses.ADD_BUS_SUCCESS]: Buses.addBusSuccess,
    // [Buses.ADD_BUS_FAILED]: Buses.addBusFailed,
    // [Buses.REMOVE_BUS]: Buses.removeBus,
    // [Buses.REMOVE_BUS_SUCCESS]: Buses.removeBusSuccess,
    // [Buses.REMOVE_BUS_FAILED]: Buses.removeBusFailed,
    // [Buses.FETCH_BUS_DETAILS]: Buses.fetchBusDetails,
    // [Buses.FETCH_BUS_DETAILS_SUCCESS]: Buses.fetchBusDetailsSuccess,
    // [Buses.FETCH_BUS_DETAILS_FAILED]: Buses.fetchBusDetailsFailed,
    // [Buses.FOLD_BUS]: Buses.foldBus,
    // [Buses.UNFOLD_BUS]: Buses.unfoldBus,
    // [Buses.TOGGLE_FOLD_BUS]: Buses.toggleFoldBus
  };
}
