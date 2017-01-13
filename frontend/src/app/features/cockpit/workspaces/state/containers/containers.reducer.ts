import { IContainerRow } from './container.interface';
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

  // tslint:disable-next-line:member-ordering
  public static FOLD_CONTAINER = `${Containers.reducerName}_FOLD_CONTAINER`;
  private static foldContainers(containersTable: IContainersTable, payload: { containerId: string }) {
    return <IContainersTable>Object.assign(
      {},
      containersTable,
      {
        byId: Object.assign(
          {},
          containersTable.byId,
          {
            [payload.containerId]: <IContainerRow>Object.assign(
              {},
              containersTable.byId[payload.containerId],
              { isFolded: true }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static UNFOLD_CONTAINER = `${Containers.reducerName}_UNFOLD_CONTAINER`;
  private static unfoldContainer(containersTable: IContainersTable, payload: { containerId: string }) {
    return <IContainersTable>Object.assign(
      {},
      containersTable,
      {
        byId: Object.assign(
          {},
          containersTable.byId,
          {
            [payload.containerId]: <IContainerRow>Object.assign(
              {},
              containersTable.byId[payload.containerId],
              { isFolded: false }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_FOLD_CONTAINER = `${Containers.reducerName}_TOGGLE_FOLD_CONTAINER`;
  private static toggleFoldContainer(containersTable: IContainersTable, payload: { containerId: string }) {
    let container = containersTable.byId[payload.containerId];

    if (container.isFolded) {
      return Containers.unfoldContainer(containersTable, payload);
    }

    return Containers.foldContainers(containersTable, payload);
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Containers.FETCH_CONTAINERS_SUCCESS]: Containers.fetchContainersSuccess,
    [Containers.FOLD_CONTAINER]: Containers.foldContainers,
    [Containers.UNFOLD_CONTAINER]: Containers.unfoldContainer,
    [Containers.TOGGLE_FOLD_CONTAINER]: Containers.toggleFoldContainer,
  };
}
