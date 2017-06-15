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
  IComponentBackendSSE,
  IComponentBackendDetails,
} from 'app/shared/services/components.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import {
  IComponentsTable,
  componentsTableFactory,
  componentRowFactory,
  IComponentRow,
} from './components.interface';
import { Workspaces } from '../workspaces/workspaces.reducer';
import { ServiceUnits } from '../service-units/service-units.reducer';
import {
  putAll,
  updateById,
  removeById,
  mergeOnly,
  JsMap,
} from 'app/shared/helpers/map.helper';

export class Components {
  private static reducerName = '[Components]';

  public static reducer(
    componentsTable = componentsTableFactory(),
    { type, payload }: Action
  ): IComponentsTable {
    if (!Components.mapActionsToMethod[type]) {
      return componentsTable;
    }

    return (
      Components.mapActionsToMethod[type](componentsTable, payload) ||
      componentsTable
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENTS_SUCCESS = `${Components.reducerName} Fetch components success`;
  private static fetchComponentsSuccess(
    componentsTable: IComponentsTable,
    payload: JsMap<IComponentBackendSSE>
  ): IComponentsTable {
    return mergeOnly(componentsTable, payload, componentRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static ADD_COMPONENTS_SUCCESS = `${Components.reducerName} Add components success`;
  private static addComponentsSuccess(
    componentsTable: IComponentsTable,
    payload: JsMap<IComponentBackendSSE>
  ): IComponentsTable {
    return putAll(componentsTable, payload, componentRowFactory());
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_COMPONENT = `${Components.reducerName} Fold component`;
  private static foldComponent(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    if (
      !componentsTable.byId[payload.componentId] ||
      componentsTable.byId[payload.componentId].isFolded
    ) {
      return componentsTable;
    }

    return updateById(componentsTable, payload.componentId, { isFolded: true });
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_COMPONENT = `${Components.reducerName} Unfold component`;
  private static unfoldComponent(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    if (
      !componentsTable.byId[payload.componentId] ||
      !componentsTable.byId[payload.componentId].isFolded
    ) {
      return componentsTable;
    }

    return updateById(componentsTable, payload.componentId, {
      isFolded: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_COMPONENT = `${Components.reducerName} Toggle fold component`;
  private static toggleFoldComponent(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    const component = componentsTable.byId[payload.componentId];

    if (!component) {
      return componentsTable;
    }

    if (component.isFolded) {
      return Components.unfoldComponent(componentsTable, payload);
    }

    return Components.foldComponent(componentsTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_COMPONENT = `${Components.reducerName} Set current component`;
  private static setCurrentComponent(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    const res = <IComponentsTable>{
      selectedComponentId: payload.componentId,
    };

    if (payload.componentId) {
      return {
        ...updateById(componentsTable, payload.componentId, {
          errorChangeState: '',
          errorDeployment: '',
        }),
        ...res,
      };
    }

    return {
      ...componentsTable,
      ...res,
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENT_DETAILS = `${Components.reducerName} Fetch component details`;
  private static fetchComponentDetails(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      isFetchingDetails: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENT_DETAILS_SUCCESS = `${Components.reducerName} Fetch component details success`;
  private static fetchComponentDetailsSuccess(
    componentsTable: IComponentsTable,
    payload: { componentId: string; data: IComponentBackendDetails }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENT_DETAILS_ERROR = `${Components.reducerName} Fetch component details error`;
  private static fetchComponentDetailsError(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE = `${Components.reducerName} Change state`;
  private static changeState(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      isUpdatingState: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_SUCCESS = `${Components.reducerName} Change state success`;
  private static changeStateSuccess(
    componentsTable: IComponentsTable,
    payload: {
      componentId: string;
      newState: string;
      parameters: { [key: string]: string };
    }
  ): IComponentsTable {
    // if the parameters are not given here, simply set them to an empty object as
    // it wouldn't be accurate until next get details
    const parameters = payload.parameters || {};

    return updateById(componentsTable, payload.componentId, {
      state: payload.newState,
      isUpdatingState: false,
      parameters,
      errorChangeState: '',
    });
  }

  // tslint:disable-next-line:member-ordering
  public static CHANGE_STATE_ERROR = `${Components.reducerName} Change state error`;
  private static changeStateError(
    componentsTable: IComponentsTable,
    payload: { componentId: string; errorChangeState: string }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      isUpdatingState: false,
      errorChangeState: payload.errorChangeState,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_COMPONENT = `${Components.reducerName} Remove component`;
  private static removeComponent(
    componentsTable: IComponentsTable,
    payload: IComponentRow
  ): IComponentsTable {
    return removeById(componentsTable, payload.id);
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_UNIT = `${Components.reducerName} Deploy service unit`;
  private static deployServiceUnit(
    componentsTable: IComponentsTable,
    payload: { componentId: string }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      isDeployingServiceUnit: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_UNIT_ERROR = `${Components.reducerName} Deploy service unit error`;
  private static deployServiceUnitError(
    componentsTable: IComponentsTable,
    payload: { componentId: string; errorDeployment: string }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      isDeployingServiceUnit: false,
      errorDeployment: payload.errorDeployment,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static DEPLOY_SERVICE_UNIT_SUCCESS = `${Components.reducerName} Deploy service unit success`;
  private static deployServiceUnitSuccess(
    componentsTable: IComponentsTable,
    payload: IServiceUnitBackendSSE
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      serviceUnits: [
        ...componentsTable.byId[payload.componentId].serviceUnits,
        payload.id,
      ],
      // TODO that's not totally correct, because we don't really know if this was deployed by us and from a component
      isDeployingServiceUnit: false,
      errorDeployment: '',
    });
  }

  private static removeServiceUnit(
    componentsTable: IComponentsTable,
    payload: { componentId: string; serviceUnitId: string }
  ): IComponentsTable {
    return updateById(componentsTable, payload.componentId, {
      serviceUnits: componentsTable.byId[
        payload.componentId
      ].serviceUnits.filter(
        serviceUnitId => serviceUnitId !== payload.serviceUnitId
      ),
    });
  }

  private static cleanWorkspace(
    _componentsTable: IComponentsTable,
    _payload
  ): IComponentsTable {
    return componentsTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: {
    [type: string]: (t: IComponentsTable, p: any) => IComponentsTable;
  } = {
    [Components.FETCH_COMPONENTS_SUCCESS]: Components.fetchComponentsSuccess,
    [Components.ADD_COMPONENTS_SUCCESS]: Components.addComponentsSuccess,
    [Components.FOLD_COMPONENT]: Components.foldComponent,
    [Components.UNFOLD_COMPONENT]: Components.unfoldComponent,
    [Components.TOGGLE_FOLD_COMPONENT]: Components.toggleFoldComponent,
    [Components.SET_CURRENT_COMPONENT]: Components.setCurrentComponent,
    [Components.FETCH_COMPONENT_DETAILS]: Components.fetchComponentDetails,
    [Components.FETCH_COMPONENT_DETAILS_SUCCESS]:
      Components.fetchComponentDetailsSuccess,
    [Components.FETCH_COMPONENT_DETAILS_ERROR]:
      Components.fetchComponentDetailsError,
    [Components.CHANGE_STATE]: Components.changeState,
    [Components.CHANGE_STATE_SUCCESS]: Components.changeStateSuccess,
    [Components.CHANGE_STATE_ERROR]: Components.changeStateError,
    [Components.REMOVE_COMPONENT]: Components.removeComponent,
    [Components.DEPLOY_SERVICE_UNIT]: Components.deployServiceUnit,
    [Components.DEPLOY_SERVICE_UNIT_SUCCESS]:
      Components.deployServiceUnitSuccess,
    [Components.DEPLOY_SERVICE_UNIT_ERROR]: Components.deployServiceUnitError,

    [ServiceUnits.REMOVE_SERVICE_UNIT]: Components.removeServiceUnit,
    [Workspaces.CLEAN_WORKSPACE]: Components.cleanWorkspace,
  };
}
