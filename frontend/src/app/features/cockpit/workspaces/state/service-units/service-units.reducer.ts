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
import { omit } from 'underscore';

import { IServiceUnitsTable } from './service-units.interface';
import { serviceUnitsTableFactory } from './service-units.initial-state';
import { Workspaces } from '../workspaces/workspaces.reducer';

export class ServiceUnits {
  private static reducerName = 'SERVICE_UNITS_REDUCER';

  public static reducer(serviceUnitsTable = serviceUnitsTableFactory(), { type, payload }: Action) {
    if (!ServiceUnits.mapActionsToMethod[type]) {
      return serviceUnitsTable;
    }

    return ServiceUnits.mapActionsToMethod[type](serviceUnitsTable, payload) || serviceUnitsTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNITS_SUCCESS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNITS_SUCCESS`;
  private static fetchServiceUnitsSuccess(serviceUnitsTable: IServiceUnitsTable, payload) {
    let allIds = serviceUnitsTable.allIds;

    payload.allIds.forEach(busId => {
      if (!serviceUnitsTable.byId[busId]) {
        allIds = [...allIds, busId];
      }
    });

    return <IServiceUnitsTable>{
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          ...payload.byId
        },
        allIds
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_SERVICE_UNIT = `${ServiceUnits.reducerName}_SET_CURRENT_SERVICE_UNIT`;
  private static setCurrentServiceUnit(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        selectedServiceUnitId: payload.serviceUnitId
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNIT_DETAILS`;
  private static fetchServiceUnitDetails(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }) {
    const allIds = serviceUnitsTable.byId[payload.serviceUnitId]
      ? serviceUnitsTable.allIds
      : [...serviceUnitsTable.allIds, payload.serviceUnitId];

    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          [payload.serviceUnitId]: {
            ...serviceUnitsTable.byId[payload.serviceUnitId],
            isFetchingDetails: true
          }
        },
        allIds
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS_SUCCESS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNIT_DETAILS_SUCCESS`;
  private static fetchServiceUnitDetailsSuccess(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string, data: any }) {
    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          [payload.serviceUnitId]: {
            ...serviceUnitsTable.byId[payload.serviceUnitId],
            ...payload.data,
            isFetchingDetails: false
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS_ERROR = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNIT_DETAILS_ERROR`;
  private static fetchServiceUnitDetailsError(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          [payload.serviceUnitId]: {
            ...serviceUnitsTable.byId[payload.serviceUnitId],
            isFetchingDetails: false
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE = `${ServiceUnits.reducerName}_CHANGE_STATE`;
  private static changeState(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          [payload.serviceUnitId]: {
            ...serviceUnitsTable.byId[payload.serviceUnitId],
            isUpdatingState: true
          }
        }
      }
    };
  }

  // only used in effect, no point to handle that action
  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_WAIT_SSE = `${ServiceUnits.reducerName}_CHANGE_STATE_WAIT_SSE`;

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_SUCCESS = `${ServiceUnits.reducerName}_CHANGE_STATE_SUCCESS`;
  private static changeStateSuccess(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string, newState: string }) {
    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          [payload.serviceUnitId]: {
            ...serviceUnitsTable.byId[payload.serviceUnitId],
            isUpdatingState: false,
            state: payload.newState
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_ERROR = `${ServiceUnits.reducerName}_CHANGE_STATE_ERROR`;
  private static changeStateError(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          [payload.serviceUnitId]: {
            ...serviceUnitsTable.byId[payload.serviceUnitId],
            isUpdatingState: false
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_SERVICE_UNIT = `${ServiceUnits.reducerName}_REMOVE_SERVICE_UNIT`;
  private static removeServiceUnit(serviceUnitsTable: IServiceUnitsTable, payload: { serviceUnitId: string }) {
    return <IServiceUnitsTable>{
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: omit(serviceUnitsTable.byId, payload.serviceUnitId),
        allIds: serviceUnitsTable.allIds.filter(id => id !== payload.serviceUnitId)
      }
    };
  }

  private static deployServiceUnitSuccess(
    serviceUnitsTable: IServiceUnitsTable,
    payload: { serviceUnit: { id: string, name: string, state: string } }
  ) {
    const serviceUnitCp = { ...payload.serviceUnit };

    return <IServiceUnitsTable>{
      ...serviceUnitsTable,
      ...<IServiceUnitsTable>{
        byId: {
          ...serviceUnitsTable.byId,
          [payload.serviceUnit.id]: serviceUnitCp
        },
        allIds: [...serviceUnitsTable.allIds, payload.serviceUnit.id]
      }
    };
  }

  private static cleanWorkspace(_serviceUnitsTable: IServiceUnitsTable, _payload) {
    return serviceUnitsTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
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
    ['COMPONENTS_REDUCER_DEPLOY_SERVICE_UNIT_SUCCESS']: ServiceUnits.deployServiceUnitSuccess,

    [Workspaces.CLEAN_WORKSPACE]: ServiceUnits.cleanWorkspace
  };
}
