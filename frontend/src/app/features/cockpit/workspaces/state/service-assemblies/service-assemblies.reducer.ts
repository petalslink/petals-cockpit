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

import { IServiceAssembliesTable, serviceAssembliesTableFactory } from './service-assemblies.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { putAll, updateById, removeById, mergeOnly, JsMap } from 'app/shared/helpers/map.helper';
import {
  serviceAssemblyRowFactory,
  IServiceAssemblyBackendSSE,
  IServiceAssemblyBackendDetails
} from 'app/features/cockpit/workspaces/state/service-assemblies/service-assembly.interface';

export class ServiceAssemblies {
  private static reducerName = '[Service assemblies]';

  public static reducer(serviceAssembliesTable = serviceAssembliesTableFactory(), { type, payload }: Action): IServiceAssembliesTable {
    if (!ServiceAssemblies.mapActionsToMethod[type]) {
      return serviceAssembliesTable;
    }

    return ServiceAssemblies.mapActionsToMethod[type](serviceAssembliesTable, payload) || serviceAssembliesTable;
  }


  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_ASSEMBLIES_SUCCESS = `${ServiceAssemblies.reducerName} Fetch service assemblies success`;
  private static fetchServiceAssembliesSuccess(
    serviceAssembliesTable: IServiceAssembliesTable,
    payload: JsMap<IServiceAssemblyBackendSSE>
  ): IServiceAssembliesTable {
    return mergeOnly(serviceAssembliesTable, payload, serviceAssemblyRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static ADD_SERVICE_ASSEMBLIES_SUCCESS = `${ServiceAssemblies.reducerName} Add service assemblies success`;
  private static addServiceAssembliesSuccess(
    serviceAssembliesTable: IServiceAssembliesTable,
    payload: JsMap<IServiceAssemblyBackendSSE>
  ): IServiceAssembliesTable {
    return putAll(serviceAssembliesTable, payload, serviceAssemblyRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_SERVICE_ASSEMBLY = `${ServiceAssemblies.reducerName} Set current service assembly`;
  private static setCurrentServiceAssembly(
    serviceAssembliesTable: IServiceAssembliesTable, payload: { serviceAssemblyId: string }): IServiceAssembliesTable {
    const res = <IServiceAssembliesTable>{
      selectedServiceAssemblyId: payload.serviceAssemblyId
    };

    if (payload.serviceAssemblyId) {
      return {
        ...updateById(serviceAssembliesTable, payload.serviceAssemblyId, { errorChangeState: '' }),
        ...res
      };
    }

    return {
      ...serviceAssembliesTable,
      ...res
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_ASSEMBLY_DETAILS = `${ServiceAssemblies.reducerName} Fetch service assembly details`;
  private static fetchServiceAssemblyDetails(
    serviceAssembliesTable: IServiceAssembliesTable, payload: { serviceAssemblyId: string }): IServiceAssembliesTable {
    return updateById(serviceAssembliesTable, payload.serviceAssemblyId, { isFetchingDetails: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_ASSEMBLY_DETAILS_SUCCESS = `${ServiceAssemblies.reducerName} Fetch service assembly details success`;
  private static fetchServiceAssemblyDetailsSuccess(
    serviceAssembliesTable: IServiceAssembliesTable,
    payload: { serviceAssemblyId: string, data: IServiceAssemblyBackendDetails }
  ): IServiceAssembliesTable {
    return updateById(serviceAssembliesTable, payload.serviceAssemblyId, { ...payload.data, isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_SERVICE_ASSEMBLY_DETAILS_ERROR = `${ServiceAssemblies.reducerName} Fetch service assembly details error`;
  private static fetchServiceAssemblyDetailsError(
    serviceAssembliesTable: IServiceAssembliesTable,
    payload: { serviceAssemblyId: string }
  ): IServiceAssembliesTable {
    return updateById(serviceAssembliesTable, payload.serviceAssemblyId, { isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE = `${ServiceAssemblies.reducerName} Change state`;
  private static changeState(
    serviceAssembliesTable: IServiceAssembliesTable, payload: { serviceAssemblyId: string }): IServiceAssembliesTable {
    return updateById(serviceAssembliesTable, payload.serviceAssemblyId, { isUpdatingState: true });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_SUCCESS = `${ServiceAssemblies.reducerName} Change state success`;
  private static changeStateSuccess(
    serviceAssembliesTable: IServiceAssembliesTable,
    payload: { serviceAssemblyId: string, newState: string }
  ): IServiceAssembliesTable {
    return updateById(serviceAssembliesTable, payload.serviceAssemblyId, {
      isUpdatingState: false,
      state: payload.newState,
      errorChangeState: ''
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_ERROR = `${ServiceAssemblies.reducerName} Change state error`;
  private static changeStateError(
    serviceAssembliesTable: IServiceAssembliesTable,
    payload: { serviceAssemblyId: string, errorChangeState: string }
  ): IServiceAssembliesTable {
    return updateById(serviceAssembliesTable, payload.serviceAssemblyId, {
      isUpdatingState: false,
      errorChangeState: payload.errorChangeState
    });
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_SERVICE_ASSEMBLY = `${ServiceAssemblies.reducerName} Remove service assembly`;
  private static removeServiceAssembly(
    serviceAssembliesTable: IServiceAssembliesTable,
    payload: { containerId: string, serviceAssemblyId: string }
  ): IServiceAssembliesTable {
    const selectedServiceAssemblyId =
      serviceAssembliesTable.selectedServiceAssemblyId === payload.serviceAssemblyId ?
        '' :
        serviceAssembliesTable.selectedServiceAssemblyId;

    return {
      ...removeById(serviceAssembliesTable, payload.serviceAssemblyId),
      selectedServiceAssemblyId
    };
  }

  private static cleanWorkspace(_serviceAssembliesTable: IServiceAssembliesTable, _payload): IServiceAssembliesTable {
    return serviceAssembliesTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: { [type: string]: (t: IServiceAssembliesTable, p: any) => IServiceAssembliesTable } = {
    [ServiceAssemblies.FETCH_SERVICE_ASSEMBLIES_SUCCESS]: ServiceAssemblies.fetchServiceAssembliesSuccess,
    [ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS]: ServiceAssemblies.addServiceAssembliesSuccess,
    [ServiceAssemblies.SET_CURRENT_SERVICE_ASSEMBLY]: ServiceAssemblies.setCurrentServiceAssembly,
    [ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS]: ServiceAssemblies.fetchServiceAssemblyDetails,
    [ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_SUCCESS]: ServiceAssemblies.fetchServiceAssemblyDetailsSuccess,
    [ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_ERROR]: ServiceAssemblies.fetchServiceAssemblyDetailsError,
    [ServiceAssemblies.CHANGE_STATE]: ServiceAssemblies.changeState,
    [ServiceAssemblies.CHANGE_STATE_SUCCESS]: ServiceAssemblies.changeStateSuccess,
    [ServiceAssemblies.CHANGE_STATE_ERROR]: ServiceAssemblies.changeStateError,
    [ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY]: ServiceAssemblies.removeServiceAssembly,

    [Workspaces.CLEAN_WORKSPACE]: ServiceAssemblies.cleanWorkspace
  };
}
