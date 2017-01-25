import { Action } from '@ngrx/store';

import { IserviceUnitsTable } from './service-units.interface';
import { serviceUnitsTableFactory } from './service-units.initial-state';

export class ServiceUnits {
  private static reducerName = 'SERVICE_UNITS_REDUCER';

  public static reducer(serviceUnitsTable = serviceUnitsTableFactory(), {type, payload}: Action) {
    if (!ServiceUnits.mapActionsToMethod[type]) {
      return serviceUnitsTable;
    }

    return ServiceUnits.mapActionsToMethod[type](serviceUnitsTable, payload) || serviceUnitsTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNITS_SUCCESS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNITS_SUCCESS`;
  private static fetchServiceUnitsSuccess(serviceUnitsTable: IserviceUnitsTable, payload) {
    let allIds = serviceUnitsTable.allIds;

    payload.allIds.forEach(busId => {
      if (!serviceUnitsTable.byId[busId]) {
        allIds = [...allIds, busId];
      }
    });

    return <IserviceUnitsTable>Object.assign({},
      serviceUnitsTable,
      {
        byId: Object.assign({}, serviceUnitsTable.byId, payload.byId),
        allIds
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_SERVICE_UNIT = `${ServiceUnits.reducerName}_SET_CURRENT_SERVICE_UNIT`;
  private static setCurrentServiceUnit(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string }) {
    return Object.assign({}, serviceUnitsTable, <IserviceUnitsTable>{
      selectedServiceUnitId: payload.serviceUnitId
    });
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS]: ServiceUnits.fetchServiceUnitsSuccess,
    [ServiceUnits.SET_CURRENT_SERVICE_UNIT]: ServiceUnits.setCurrentServiceUnit,
  };
}
