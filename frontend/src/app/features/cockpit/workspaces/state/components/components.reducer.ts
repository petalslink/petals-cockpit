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

import { IComponentsTable } from './components.interface';
import { IComponentRow } from './component.interface';
import { componentsTableFactory } from './components.initial-state';
import { Users } from './../../../../../shared/state/users.reducer';

export class Components {
  private static reducerName = 'COMPONENTS_REDUCER';

  public static reducer(componentsTable = componentsTableFactory(), {type, payload}: Action) {
    if (!Components.mapActionsToMethod[type]) {
      return componentsTable;
    }

    return Components.mapActionsToMethod[type](componentsTable, payload) || componentsTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_COMPONENTS_SUCCESS = `${Components.reducerName}_FETCH_COMPONENTS_SUCCESS`;
  private static fetchComponentsSuccess(componentsTable: IComponentsTable, payload) {
    let allIds = componentsTable.allIds;

    payload.allIds.forEach(containerId => {
      if (!componentsTable.byId[containerId]) {
        allIds = [...allIds, containerId];
      }
    });

    return <IComponentsTable>Object.assign({},
      componentsTable,
      {
        byId: Object.assign({}, componentsTable.byId, payload.byId),
        allIds
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FOLD_COMPONENT = `${Components.reducerName}_FOLD_COMPONENT`;
  private static foldComponent(componentsTable: IComponentsTable, payload: { componentId: string }) {
    return <IComponentsTable>Object.assign(
      {},
      componentsTable,
      {
        byId: Object.assign(
          {},
          componentsTable.byId,
          {
            [payload.componentId]: <IComponentRow>Object.assign(
              {},
              componentsTable.byId[payload.componentId],
              { isFolded: true }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_COMPONENT = `${Components.reducerName}_UNFOLD_COMPONENT`;
  private static unfoldComponent(componentsTable: IComponentsTable, payload: { componentId: string }) {
    return <IComponentsTable>Object.assign(
      {},
      componentsTable,
      {
        byId: Object.assign(
          {},
          componentsTable.byId,
          {
            [payload.componentId]: <IComponentRow>Object.assign(
              {},
              componentsTable.byId[payload.componentId],
              { isFolded: false }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_COMPONENT = `${Components.reducerName}_TOGGLE_FOLD_COMPONENT`;
  private static toggleFoldComponent(componentsTable: IComponentsTable, payload: { componentId: string }) {
    const component = componentsTable.byId[payload.componentId];

    if (component.isFolded) {
      return Components.unfoldComponent(componentsTable, payload);
    }

    return Components.foldComponent(componentsTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_COMPONENT = `${Components.reducerName}_SET_CURRENT_COMPONENT`;
  private static setCurrentComponent(componentsTable: IComponentsTable, payload: { componentId: string }) {
    return Object.assign({}, componentsTable, <IComponentsTable>{
      selectedComponentId: payload.componentId
    });
  }

  private static disconnectUserSuccess(componentsTable: IComponentsTable, payload) {
    return componentsTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Components.FETCH_COMPONENTS_SUCCESS]: Components.fetchComponentsSuccess,
    [Components.FOLD_COMPONENT]: Components.foldComponent,
    [Components.UNFOLD_COMPONENT]: Components.unfoldComponent,
    [Components.TOGGLE_FOLD_COMPONENT]: Components.toggleFoldComponent,
    [Components.SET_CURRENT_COMPONENT]: Components.setCurrentComponent,

    [Users.DISCONNECT_USER_SUCCESS]: Components.disconnectUserSuccess
  };
}
