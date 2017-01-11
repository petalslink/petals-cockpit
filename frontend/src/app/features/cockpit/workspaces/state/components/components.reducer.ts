import { Action } from '@ngrx/store';

import { IComponentsTable } from './components.interface';
import { componentsTableFactory } from './components.initial-state';

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
    return <IComponentsTable>Object.assign({}, componentsTable, payload);
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Components.FETCH_COMPONENTS_SUCCESS]: Components.fetchComponentsSuccess,
  };
}
