/**
 * Copyright (C) 2017-2020 Linagora
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

import {
  JsTable,
  mergeOnly,
  putAll,
  removeById,
  updateById,
} from '@shared/helpers/jstable.helper';
import { fold, toggleFold, unfold } from '@shared/helpers/reducers.helper';
import {
  ComponentState,
  IComponentBackendDetails,
  IComponentBackendSSE,
} from '@shared/services/components.service';
import { IServiceUnitBackendSSE } from '@shared/services/service-units.service';
import { Components } from '@wks/state/components/components.actions';
import { ServiceUnits } from '@wks/state/service-units/service-units.actions';
import { IServiceUnitRow } from '@wks/state/service-units/service-units.interface';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import {
  componentRowFactory,
  componentsTableFactory,
  IComponentRow,
  IComponentsTable,
} from './components.interface';

export namespace ComponentsReducer {
  type All =
    | Components.Fetched
    | Components.Added
    | Components.SetCurrent
    | Components.FetchDetails
    | Components.FetchDetailsError
    | Components.FetchDetailsSuccess
    | Components.ChangeState
    | Components.ChangeStateError
    | Components.ChangeStateSuccess
    | Components.SetParameters
    | Components.SetParametersError
    | Components.SetParametersSuccess
    | Components.Removed
    | Components.Fold
    | Components.Unfold
    | Components.ToggleFold
    | Components.DeployServiceUnit
    | Components.DeployServiceUnitError
    | Components.DeployServiceUnitSuccess
    | Components.CleanServiceUnitDeploymentError
    | ServiceUnits.Added
    | ServiceUnits.Removed
    | Workspaces.CleanWorkspace;

  export function reducer(
    table = componentsTableFactory(),
    action: All
  ): IComponentsTable {
    switch (action.type) {
      case Components.FetchedType: {
        return fetched(table, action.payload);
      }
      case Components.AddedType: {
        return added(table, action.payload);
      }
      case Components.SetCurrentType: {
        return setCurrent(table, action.payload);
      }
      case Components.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case Components.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case Components.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case Components.RemovedType: {
        return removed(table, action.payload);
      }
      case Components.ChangeStateType: {
        return changeState(table, action.payload);
      }
      case Components.ChangeStateErrorType: {
        return changeStateError(table, action.payload);
      }
      case Components.ChangeStateSuccessType: {
        return changeStateSuccess(table, action.payload);
      }
      case Components.SetParametersType: {
        return setParameters(table, action.payload);
      }
      case Components.SetParametersErrorType: {
        return setParametersError(table, action.payload);
      }
      case Components.SetParametersSuccessType: {
        return setParametersSuccess(table, action.payload);
      }
      case Components.FoldType: {
        return fold(table, action.payload);
      }
      case Components.UnfoldType: {
        return unfold(table, action.payload);
      }
      case Components.ToggleFoldType: {
        return toggleFold(table, action.payload);
      }
      case Components.DeployServiceUnitType: {
        return deployServiceUnit(table, action.payload);
      }
      case Components.DeployServiceUnitErrorType: {
        return deployServiceUnitError(table, action.payload);
      }
      case Components.DeployServiceUnitSuccessType: {
        return deployServiceUnitSuccess(table, action.payload);
      }
      case Components.CleanServiceUnitDeploymentErrorType: {
        return cleanServiceUnitDeploymentError(table, action.payload);
      }
      case ServiceUnits.AddedType: {
        return addedServiceUnits(table, action.payload);
      }
      case ServiceUnits.RemovedType: {
        return removeServiceUnit(table, action.payload);
      }
      case Workspaces.CleanWorkspaceType: {
        return componentsTableFactory();
      }
      default:
        return table;
    }
  }

  function fetched(
    table: IComponentsTable,
    payload: JsTable<IComponentBackendSSE>
  ) {
    return mergeOnly(table, payload, componentRowFactory);
  }

  function added(
    table: IComponentsTable,
    payload: JsTable<IComponentBackendSSE>
  ) {
    return putAll(table, payload, componentRowFactory);
  }

  function setCurrent(
    table: IComponentsTable,
    payload: { id: string }
  ): IComponentsTable {
    const res = {
      selectedComponentId: payload.id,
    };

    if (payload.id) {
      return {
        ...updateById(table, payload.id, {
          updateError: '',
          errorDeploymentServiceUnit: '',
        }),
        ...res,
      };
    }

    return {
      ...table,
      ...res,
    };
  }

  function fetchDetails(table: IComponentsTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isUpdating: true,
    });
  }

  function fetchDetailsSuccess(
    table: IComponentsTable,
    payload: { id: string; data: IComponentBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isUpdating: false,
    });
  }

  function fetchDetailsError(table: IComponentsTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isUpdating: false,
    });
  }

  function changeState(
    table: IComponentsTable,
    payload: {
      id: string;
    }
  ) {
    return updateById(table, payload.id, {
      isUpdating: true,
    });
  }

  function changeStateSuccess(
    table: IComponentsTable,
    payload: {
      id: string;
      state: ComponentState;
    }
  ) {
    return updateById(table, payload.id, {
      state: payload.state,
      isUpdating: false,
      updateError: '',
    });
  }

  function changeStateError(
    table: IComponentsTable,
    payload: { id: string; error: string }
  ) {
    return updateById(table, payload.id, {
      isUpdating: false,
      updateError: payload.error,
    });
  }

  function setParameters(
    table: IComponentsTable,
    payload: {
      id: string;
    }
  ) {
    return updateById(table, payload.id, {
      isUpdating: true,
    });
  }

  function setParametersSuccess(
    table: IComponentsTable,
    payload: {
      id: string;
    }
  ) {
    return updateById(table, payload.id, {
      isUpdating: false,
      updateError: '',
    });
  }

  function setParametersError(
    table: IComponentsTable,
    payload: { id: string; error: string }
  ) {
    return updateById(table, payload.id, {
      isUpdating: false,
      updateError: payload.error,
    });
  }

  function removed(table: IComponentsTable, payload: IComponentRow) {
    return removeById(table, payload.id);
  }

  function deployServiceUnit(table: IComponentsTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isUpdating: true,
    });
  }

  function deployServiceUnitError(
    table: IComponentsTable,
    payload: { id: string; errorDeployment: string }
  ) {
    return updateById(table, payload.id, {
      isUpdating: false,
      errorDeploymentServiceUnit: payload.errorDeployment,
    });
  }

  function deployServiceUnitSuccess(
    table: IComponentsTable,
    payload: IServiceUnitBackendSSE
  ) {
    return updateById(table, payload.componentId, {
      isUpdating: false,
      errorDeploymentServiceUnit: '',
    });
  }

  function cleanServiceUnitDeploymentError(
    table: IComponentsTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      errorDeploymentServiceUnit: '',
    });
  }

  function addedServiceUnits(
    table: IComponentsTable,
    payload: JsTable<IServiceUnitBackendSSE>
  ) {
    return payload.allIds.reduce((t, c) => {
      const su = payload.byId[c];
      const component = t.byId[su.componentId];
      return updateById(t, component.id, {
        serviceUnits: Array.from(new Set([...component.serviceUnits, su.id])),
      });
    }, table);
  }

  function removeServiceUnit(
    table: IComponentsTable,
    payload: IServiceUnitRow
  ) {
    return updateById(table, payload.componentId, {
      serviceUnits: table.byId[payload.componentId].serviceUnits.filter(
        serviceUnitId => serviceUnitId !== payload.id
      ),
    });
  }
}
