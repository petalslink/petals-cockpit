import { Action } from '@ngrx/store';

import { IContainersTable } from './containers.interface';
import { containersTableFactory } from './containers.initial-state';

export class Containers {
  private static reducerName = 'CONTAINERS_REDUCER';

  public static reducer(containersTable = containersTableFactory(), {type, payload}: Action) {
    if (!Containers.mapActionsToMethod[type]) {
      return containersTable;
    }

    return Containers.mapActionsToMethod[type](containersTable, payload) || containersTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_CONTAINERS_SUCCESS = `${Containers.reducerName}_FETCH_CONTAINERS_SUCCESS`;
  private static fetchContainersSuccess(containersTable: IContainersTable, payload) {
    return <IContainersTable>Object.assign({}, containersTable, payload);
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Containers.FETCH_CONTAINERS_SUCCESS]: Containers.fetchContainersSuccess,
  };
}
