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
    return <IserviceUnitsTable>Object.assign({}, serviceUnitsTable, payload);
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS]: ServiceUnits.fetchServiceUnitsSuccess,
  };
}
