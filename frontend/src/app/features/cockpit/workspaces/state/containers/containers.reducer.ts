import { Action } from '@ngrx/store';

import { IContainersTable } from './containers.interface';
import { containersTableFactory } from './containers.initial-state';
import { IContainerRow } from './container.interface';
import { Users } from './../../../../../shared/state/users.reducer';

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
    let allIds = containersTable.allIds;

    payload.allIds.forEach(containerId => {
      if (!containersTable.byId[containerId]) {
        allIds = [...allIds, containerId];
      }
    });

    return <IContainersTable>Object.assign({},
      containersTable,
      {
        byId: Object.assign({}, containersTable.byId, payload.byId),
        allIds
      }
    );
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
    const container = containersTable.byId[payload.containerId];

    if (container.isFolded) {
      return Containers.unfoldContainer(containersTable, payload);
    }

    return Containers.foldContainers(containersTable, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_CURRENT_CONTAINER = `${Containers.reducerName}_SET_CURRENT_CONTAINER`;
  private static setCurrentContainer(containersTable: IContainersTable, payload: { containerId: string }) {
    return Object.assign({}, containersTable, <IContainersTable>{
      selectedContainerId: payload.containerId
    });
  }

  private static disconnectUserSuccess(containersTable: IContainersTable, payload) {
    return containersTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Containers.FETCH_CONTAINERS_SUCCESS]: Containers.fetchContainersSuccess,
    [Containers.FOLD_CONTAINER]: Containers.foldContainers,
    [Containers.UNFOLD_CONTAINER]: Containers.unfoldContainer,
    [Containers.TOGGLE_FOLD_CONTAINER]: Containers.toggleFoldContainer,
    [Containers.SET_CURRENT_CONTAINER]: Containers.setCurrentContainer,

    [Users.DISCONNECT_USER_SUCCESS]: Containers.disconnectUserSuccess
  };
}
