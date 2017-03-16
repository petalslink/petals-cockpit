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

import { IserviceUnitsTable } from './service-units.interface';
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
  private static fetchServiceUnitsSuccess(serviceUnitsTable: IserviceUnitsTable, payload) {
    let allIds = serviceUnitsTable.allIds;

    payload.allIds.forEach(busId => {
      if (!serviceUnitsTable.byId[busId]) {
        allIds = [...allIds, busId];
      }
    });

    return <IserviceUnitsTable>{
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
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
  private static setCurrentServiceUnit(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
        selectedServiceUnitId: payload.serviceUnitId
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_UNIT_DETAILS = `${ServiceUnits.reducerName}_FETCH_SERVICE_UNIT_DETAILS`;
  private static fetchServiceUnitDetails(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string }) {
    const allIds =
      (typeof serviceUnitsTable.byId[payload.serviceUnitId] !== 'undefined'
        ? serviceUnitsTable.allIds
        : [...serviceUnitsTable.allIds, payload.serviceUnitId]);

    return {
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
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
  private static fetchServiceUnitDetailsSuccess(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string, data: any }) {
    return {
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
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
  private static fetchServiceUnitDetailsError(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
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
  private static changeState(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
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
  private static changeStateSuccess(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string, newState: string }) {
    return {
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
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
  private static changeStateError(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string }) {
    return {
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
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
  private static removeServiceUnit(serviceUnitsTable: IserviceUnitsTable, payload: { serviceUnitId: string }) {
    return <IserviceUnitsTable>{
      ...serviceUnitsTable,
      ...<IserviceUnitsTable>{
        byId: omit(serviceUnitsTable.byId, payload.serviceUnitId),
        allIds: serviceUnitsTable.allIds.filter(id => id !== payload.serviceUnitId)
      }
    };
  }

  private static closeWorkspace(_serviceUnitsTable: IserviceUnitsTable, _payload) {
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

    [Workspaces.CLOSE_WORKSPACE]: ServiceUnits.closeWorkspace
  };
}
