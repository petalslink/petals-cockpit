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

import { IserviceUnitsTable } from './service-units.interface';
import { serviceUnitsTableFactory } from './service-units.initial-state';
import { Users } from './../../../../../shared/state/users.reducer';

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

  private static disconnectUserSuccess(serviceUnitsTable: IserviceUnitsTable, payload) {
    return serviceUnitsTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS]: ServiceUnits.fetchServiceUnitsSuccess,
    [ServiceUnits.SET_CURRENT_SERVICE_UNIT]: ServiceUnits.setCurrentServiceUnit,

    [Users.DISCONNECT_USER_SUCCESS]: ServiceUnits.disconnectUserSuccess
  };
}
