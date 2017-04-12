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

import { IServiceUnitsTable } from './service-units.interface';
import { serviceUnitsTableFactory } from './service-units.initial-state';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { putById, putAll, updateById, removeById } from 'app/shared/helpers/shared.helper';

export class ServiceUnits {
  private static reducerName = 'SERVICE_UNITS_REDUCER';

  public static reducer(serviceUnitsTable = serviceUnitsTableFactory(), { type, payload }: Action): IServiceUnitsTable {
    if (!ServiceUnits.mapActionsToMethod[type]) {
      return serviceUnitsTable;
    }

    return ServiceUnits.mapActionsToMethod[type](serviceUnitsTable, payload) || serviceUnitsTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNITS_SUCCESS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNITS_SUCCESS`;
  private static fetchServiceUnitsSuccess(serviceUnitsTable: IServiceUnitsTable, payload): IServiceUnitsTable {
    return putAll(serviceUnitsTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_SERVICE_UNIT = `${ServiceUnits.reducerName}_SET_CURRENT_SERVICE_UNIT`;
  private static setCurrentServiceUnit(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }): IServiceUnitsTable {
    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        selectedServiceUnitId: payload.serviceUnitId
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNIT_DETAILS`;
  private static fetchServiceUnitDetails(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, { isFetchingDetails: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS_SUCCESS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNIT_DETAILS_SUCCESS`;
  private static fetchServiceUnitDetailsSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string, data: any }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, { ...payload.data, isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS_ERROR = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNIT_DETAILS_ERROR`;
  private static fetchServiceUnitDetailsError(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string }
  ): IServiceUnitsTable {
    if (!serviceUnitsTable.byId[payload.serviceUnitId]) {
      return serviceUnitsTable;
    }

    return updateById(serviceUnitsTable, payload.serviceUnitId, { isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE = `${ServiceUnits.reducerName}_CHANGE_STATE`;
  private static changeState(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, { isUpdatingState: true });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_SUCCESS = `${ServiceUnits.reducerName}_CHANGE_STATE_SUCCESS`;
  private static changeStateSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string, newState: string }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, { isUpdatingState: false, state: payload.newState });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_ERROR = `${ServiceUnits.reducerName}_CHANGE_STATE_ERROR`;
  private static changeStateError(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, { isUpdatingState: false });
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_SERVICE_UNIT = `${ServiceUnits.reducerName}_REMOVE_SERVICE_UNIT`;
  private static removeServiceUnit(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }): IServiceUnitsTable {
    if (!serviceUnitsTable.byId[payload.serviceUnitId]) {
      return serviceUnitsTable;
    }

    return removeById(serviceUnitsTable, payload.serviceUnitId);
  }

  private static deployServiceUnitSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnit: { id: string, name: string, state: string } }
  ): IServiceUnitsTable {
    return putById(serviceUnitsTable, payload.serviceUnit.id, payload.serviceUnit);
  }

  private static cleanWorkspace(_serviceUnitsTable: IServiceUnitsTable, _payload): IServiceUnitsTable {
    return serviceUnitsTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: { [type: string]: (t: IServiceUnitsTable, p: any) => IServiceUnitsTable } = {
    [ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS]: ServiceUnits.fetchServiceUnitsSuccess,
    [ServiceUnits.SET_CURRENT_SERVICE_UNIT]: ServiceUnits.setCurrentServiceUnit,
    [ServiceUnits.FETCH_SERVICE_UNIT_DETAILS]: ServiceUnits.fetchServiceUnitDetails,
    [ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_SUCCESS]: ServiceUnits.fetchServiceUnitDetailsSuccess,
    [ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_ERROR]: ServiceUnits.fetchServiceUnitDetailsError,
    [ServiceUnits.CHANGE_STATE]: ServiceUnits.changeState,
    [ServiceUnits.CHANGE_STATE_SUCCESS]: ServiceUnits.changeStateSuccess,
    [ServiceUnits.CHANGE_STATE_ERROR]: ServiceUnits.changeStateError,
    [ServiceUnits.REMOVE_SERVICE_UNIT]: ServiceUnits.removeServiceUnit,
    // TODO : When using Components.DEPLOY_SERVICE_UNIT_SUCCESS, there's an error at runtime
    // [Components.DEPLOY_SERVICE_UNIT_SUCCESS]: ServiceUnits.deployServiceUnitSuccess,
    // issue opened here: https://github.com/angular/angular-cli/issues/5736
    // once solved, update the tests !
    ['COMPONENTS_REDUCER_DEPLOY_SERVICE_UNIT_SUCCESS']: ServiceUnits.deployServiceUnitSuccess,

    [Workspaces.CLEAN_WORKSPACE]: ServiceUnits.cleanWorkspace
  };
}
