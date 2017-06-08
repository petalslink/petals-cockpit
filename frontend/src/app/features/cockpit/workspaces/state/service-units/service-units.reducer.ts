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

import {
  IServiceUnitsTable,
  serviceUnitsTableFactory,
  serviceUnitRowFactory,
} from './service-units.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';
import {
  putAll,
  updateById,
  removeById,
  mergeOnly,
  JsMap,
} from 'app/shared/helpers/map.helper';
import {
  IServiceUnitBackendSSE,
  IServiceUnitBackendDetails,
} from 'app/shared/services/service-units.service';

export class ServiceUnits {
  private static reducerName = '[Service units]';

  public static reducer(
    serviceUnitsTable = serviceUnitsTableFactory(),
    { type, payload }: Action
  ): IServiceUnitsTable {
    if (!ServiceUnits.mapActionsToMethod[type]) {
      return serviceUnitsTable;
    }

    return (
      ServiceUnits.mapActionsToMethod[type](serviceUnitsTable, payload) ||
      serviceUnitsTable
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNITS_SUCCESS = `${ServiceUnits.reducerName} Fetch service units success`;
  private static fetchServiceUnitsSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: JsMap<IServiceUnitBackendSSE>
  ): IServiceUnitsTable {
    return mergeOnly(serviceUnitsTable, payload, serviceUnitRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static ADD_SERVICE_UNITS_SUCCESS = `${ServiceUnits.reducerName} Add service units success`;
  private static addServiceUnitsSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: JsMap<IServiceUnitBackendSSE>
  ): IServiceUnitsTable {
    return putAll(serviceUnitsTable, payload, serviceUnitRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_SERVICE_UNIT = `${ServiceUnits.reducerName} Set current service unit`;
  private static setCurrentServiceUnit(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string }
  ): IServiceUnitsTable {
    const res = <IServiceUnitsTable>{
      selectedServiceUnitId: payload.serviceUnitId,
    };

    if (payload.serviceUnitId) {
      return {
        ...updateById(serviceUnitsTable, payload.serviceUnitId, {
          errorChangeState: '',
        }),
        ...res,
      };
    }

    return {
      ...serviceUnitsTable,
      ...res,
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS = `${ServiceUnits.reducerName} Fetch service unit details`;
  private static fetchServiceUnitDetails(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, {
      isFetchingDetails: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS_SUCCESS = `${ServiceUnits.reducerName} Fetch service unit details success`;
  private static fetchServiceUnitDetailsSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string; data: IServiceUnitBackendDetails }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS_ERROR = `${ServiceUnits.reducerName} Fetch service unit details error`;
  private static fetchServiceUnitDetailsError(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, {
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE = `${ServiceUnits.reducerName} Change state`;
  private static changeState(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, {
      isUpdatingState: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_SUCCESS = `${ServiceUnits.reducerName} Change state success`;
  private static changeStateSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string; newState: string }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, {
      isUpdatingState: false,
      state: payload.newState,
      errorChangeState: '',
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_ERROR = `${ServiceUnits.reducerName} Change state error`;
  private static changeStateError(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnitId: string; errorChangeState: string }
  ): IServiceUnitsTable {
    return updateById(serviceUnitsTable, payload.serviceUnitId, {
      isUpdatingState: false,
      errorChangeState: payload.errorChangeState,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_SERVICE_UNIT = `${ServiceUnits.reducerName} Remove service unit`;
  private static removeServiceUnit(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { componentId: string; serviceUnitId: string }
  ): IServiceUnitsTable {
    return removeById(serviceUnitsTable, payload.serviceUnitId);
  }

  private static cleanWorkspace(
    _serviceUnitsTable: IServiceUnitsTable,
    _payload
  ): IServiceUnitsTable {
    return serviceUnitsTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: {
    [type: string]: (t: IServiceUnitsTable, p: any) => IServiceUnitsTable;
  } = {
    [ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS]:
      ServiceUnits.fetchServiceUnitsSuccess,
    [ServiceUnits.ADD_SERVICE_UNITS_SUCCESS]:
      ServiceUnits.addServiceUnitsSuccess,
    [ServiceUnits.SET_CURRENT_SERVICE_UNIT]: ServiceUnits.setCurrentServiceUnit,
    [ServiceUnits.FETCH_SERVICE_UNIT_DETAILS]:
      ServiceUnits.fetchServiceUnitDetails,
    [ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_SUCCESS]:
      ServiceUnits.fetchServiceUnitDetailsSuccess,
    [ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_ERROR]:
      ServiceUnits.fetchServiceUnitDetailsError,
    [ServiceUnits.CHANGE_STATE]: ServiceUnits.changeState,
    [ServiceUnits.CHANGE_STATE_SUCCESS]: ServiceUnits.changeStateSuccess,
    [ServiceUnits.CHANGE_STATE_ERROR]: ServiceUnits.changeStateError,
    [ServiceUnits.REMOVE_SERVICE_UNIT]: ServiceUnits.removeServiceUnit,

    [Workspaces.CLEAN_WORKSPACE]: ServiceUnits.cleanWorkspace,
  };
}
