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

import { IComponentsTable } from './components.interface';
import { IComponentRow } from './component.interface';
import { componentsTableFactory } from './components.initial-state';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { getComponentOfServiceUnit } from '../../../../../shared/helpers/service-unit.helper';
import { ServiceUnits } from '../service-units/service-units.reducer';

export class Components {
  private static reducerName = 'COMPONENTS_REDUCER';

  public static reducer(componentsTable = componentsTableFactory(), { type, payload }: Action): IComponentsTable {
    if (!Components.mapActionsToMethod[type]) {
      return componentsTable;
    }

    return Components.mapActionsToMethod[type](componentsTable, payload) || componentsTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENTS_SUCCESS = `${Components.reducerName}_FETCH_COMPONENTS_SUCCESS`;
  private static fetchComponentsSuccess(componentsTable: IComponentsTable, payload): IComponentsTable {
    return <IComponentsTable>{
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          ...payload.byId
        },
        allIds: [...Array.from(new Set([...componentsTable.allIds, ...payload.allIds]))]
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_COMPONENT = `${Components.reducerName}_FOLD_COMPONENT`;
  private static foldComponent(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    if (!componentsTable.byId[payload.componentId] || componentsTable.byId[payload.componentId].isFolded) {
      return componentsTable;
    }

    return <IComponentsTable>{
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: <IComponentRow>{
            ...componentsTable.byId[payload.componentId],
            isFolded: true
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_COMPONENT = `${Components.reducerName}_UNFOLD_COMPONENT`;
  private static unfoldComponent(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    if (!componentsTable.byId[payload.componentId] || !componentsTable.byId[payload.componentId].isFolded) {
      return componentsTable;
    }

    return <IComponentsTable>{
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: <IComponentRow>{
            ...componentsTable.byId[payload.componentId],
            isFolded: false
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_COMPONENT = `${Components.reducerName}_TOGGLE_FOLD_COMPONENT`;
  private static toggleFoldComponent(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    const component = componentsTable.byId[payload.componentId];

    if (!componentsTable.byId[payload.componentId]) {
      return componentsTable;
    }

    if (component.isFolded) {
      return Components.unfoldComponent(componentsTable, payload);
    }

    return Components.foldComponent(componentsTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_COMPONENT = `${Components.reducerName}_SET_CURRENT_COMPONENT`;
  private static setCurrentComponent(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    return {
      ...componentsTable,
      ...<IComponentsTable>{
        selectedComponentId: payload.componentId
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENT_DETAILS = `${Components.reducerName}_FETCH_COMPONENT_DETAILS`;
  private static fetchComponentDetails(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            isFetchingDetails: true
          }
        },
        allIds: [...Array.from(new Set([...componentsTable.allIds, payload.componentId]))]
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENT_DETAILS_SUCCESS = `${Components.reducerName}_FETCH_COMPONENT_DETAILS_SUCCESS`;
  private static fetchComponentDetailsSuccess(
    componentsTable: IComponentsTable,
    payload: { componentId: string, data: any }
  ): IComponentsTable {
    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            ...payload.data,
            isFetchingDetails: false
          }
        },
        allIds: [...Array.from(new Set([...componentsTable.allIds, payload.componentId]))]
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENT_DETAILS_ERROR = `${Components.reducerName}_FETCH_COMPONENT_DETAILS_ERROR`;
  private static fetchComponentDetailsError(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    if (!componentsTable.byId[payload.componentId]) {
      return componentsTable;
    }

    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            isFetchingDetails: false
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE = `${Components.reducerName}_CHANGE_STATE`;
  private static changeState(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            isUpdatingState: true
          }
        },
        allIds: [...Array.from(new Set([...componentsTable.allIds, payload.componentId]))]
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_SUCCESS = `${Components.reducerName}_CHANGE_STATE_SUCCESS`;
  private static changeStateSuccess(
    componentsTable: IComponentsTable,
    payload: { componentId: string, newState: string }
  ): IComponentsTable {
    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            isUpdatingState: false,
            state: payload.newState
          }
        },
        allIds: [...Array.from(new Set([...componentsTable.allIds, payload.componentId]))]
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_ERROR = `${Components.reducerName}_CHANGE_STATE_ERROR`;
  private static changeStateError(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            isUpdatingState: false
          }
        }
      },
      allIds: [...Array.from(new Set([...componentsTable.allIds, payload.componentId]))]
    };
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_COMPONENT = `${Components.reducerName}_REMOVE_COMPONENT`;
  private static removeComponent(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    if (!componentsTable.byId[payload.componentId]) {
      return componentsTable;
    }

    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: omit(componentsTable.byId, payload.componentId),
        allIds: componentsTable.allIds.filter(componentId => componentId !== payload.componentId)
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_UNIT = `${Components.reducerName}_DEPLOY_SERVICE_UNIT`;
  private static deployServiceUnit(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    if (!componentsTable.byId[payload.componentId]) {
      return componentsTable;
    }

    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            isDeployingServiceUnit: true
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_UNIT_ERROR = `${Components.reducerName}_DEPLOY_SERVICE_UNIT_ERROR`;
  private static deployServiceUnitError(componentsTable: IComponentsTable, payload: { componentId: string }): IComponentsTable {
    if (!componentsTable.byId[payload.componentId]) {
      return componentsTable;
    }

    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: {
            ...componentsTable.byId[payload.componentId],
            isDeployingServiceUnit: false
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_UNIT_SUCCESS = `${Components.reducerName}_DEPLOY_SERVICE_UNIT_SUCCESS`;
  private static deployServiceUnitSuccess(
    componentsTable: IComponentsTable,
    payload: { componentId: string, serviceUnit: { id: string, name: string, state: string } }
  ): IComponentsTable {
    let component = componentsTable.byId[payload.componentId];

    if (!component) {
      component = <IComponentRow>{ serviceUnits: [] };
    }

    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [payload.componentId]: <IComponentRow>{
            ...component,
            isDeployingServiceUnit: false,
            serviceUnits: [...Array.from(new Set([...component.serviceUnits, payload.serviceUnit.id]))]
          }
        },
        allIds: [...Array.from(new Set([...componentsTable.allIds, payload.componentId]))]
      }
    };
  }

  private static removeServiceUnit(componentsTable: IComponentsTable, payload: { serviceUnitId: string }): IComponentsTable {
    const componentContainingServiceUnit = getComponentOfServiceUnit(componentsTable, payload.serviceUnitId);

    if (!componentContainingServiceUnit) {
      return componentsTable;
    }

    return {
      ...componentsTable,
      ...<IComponentsTable>{
        byId: {
          ...componentsTable.byId,
          [componentContainingServiceUnit.id]: <IComponentRow>{
            ...componentsTable.byId[componentContainingServiceUnit.id],
            serviceUnits: componentsTable
              .byId[componentContainingServiceUnit.id]
              .serviceUnits
              .filter(serviceUnitId => serviceUnitId !== payload.serviceUnitId)
          }
        }
      }
    };
  }

  private static cleanWorkspace(_componentsTable: IComponentsTable, _payload): IComponentsTable {
    return componentsTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: { [type: string]: (t: IComponentsTable, p: any) => IComponentsTable } = {
    [Components.FETCH_COMPONENTS_SUCCESS]: Components.fetchComponentsSuccess,
    [Components.FOLD_COMPONENT]: Components.foldComponent,
    [Components.UNFOLD_COMPONENT]: Components.unfoldComponent,
    [Components.TOGGLE_FOLD_COMPONENT]: Components.toggleFoldComponent,
    [Components.SET_CURRENT_COMPONENT]: Components.setCurrentComponent,
    [Components.FETCH_COMPONENT_DETAILS]: Components.fetchComponentDetails,
    [Components.FETCH_COMPONENT_DETAILS_SUCCESS]: Components.fetchComponentDetailsSuccess,
    [Components.FETCH_COMPONENT_DETAILS_ERROR]: Components.fetchComponentDetailsError,
    [Components.CHANGE_STATE]: Components.changeState,
    [Components.CHANGE_STATE_SUCCESS]: Components.changeStateSuccess,
    [Components.CHANGE_STATE_ERROR]: Components.changeStateError,
    [Components.REMOVE_COMPONENT]: Components.removeComponent,
    [Components.DEPLOY_SERVICE_UNIT]: Components.deployServiceUnit,
    [Components.DEPLOY_SERVICE_UNIT_SUCCESS]: Components.deployServiceUnitSuccess,
    [Components.DEPLOY_SERVICE_UNIT_ERROR]: Components.deployServiceUnitError,

    [ServiceUnits.REMOVE_SERVICE_UNIT]: Components.removeServiceUnit,
    [Workspaces.CLEAN_WORKSPACE]: Components.cleanWorkspace
  };
}
