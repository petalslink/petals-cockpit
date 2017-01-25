import { Action } from '@ngrx/store';

import { IWorkspacesTable } from './workspaces.interface';
import { workspacesTableFactory } from './workspaces.initial-state';
import { IWorkspaceRow } from './workspace.interface';

export class Workspaces {
  private static reducerName = 'WORKSPACES_REDUCER';

  public static reducer(workspacesTable = workspacesTableFactory(), {type, payload}: Action) {
    if (!Workspaces.mapActionsToMethod[type]) {
      return workspacesTable;
    }

    return Workspaces.mapActionsToMethod[type](workspacesTable, payload) || workspacesTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES = `${Workspaces.reducerName}_FETCH_WORKSPACES`;
  private static fetchWorkspaces(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable, <IWorkspacesTable>{ isFetchingWorkspaces: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES_SUCCESS = `${Workspaces.reducerName}_FETCH_WORKSPACES_SUCCESS`;
  private static fetchWorkspacesSuccess(workspacesTable: IWorkspacesTable, payload) {
    payload.allIds.forEach(workspaceId => {
      payload = Object.assign({}, payload, {
        byId: Object.assign({}, payload.byId, {
          [workspaceId]: Object.assign({}, payload.byId[workspaceId], {
            buses: (typeof workspacesTable.byId[workspaceId] === 'undefined' ? [] : workspacesTable.byId[workspaceId].buses)
          })
        })
      });

      return;
    });

    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      payload,
      <IWorkspacesTable>{
        isFetchingWorkspaces: false
      }
    );
  }

  // only used in effect, no point to handle that action
  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_WAIT_SSE = `${Workspaces.reducerName}_FETCH_WORKSPACE_WAIT_SSE`;

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE = `${Workspaces.reducerName}_FETCH_WORKSPACE`;
  private static fetchWorkspace(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        byId: Object.assign(
          {},
          workspacesTable.byId,
          {
            [payload]: <IWorkspaceRow>Object.assign(
              {},
              workspacesTable.byId[payload],
              <IWorkspaceRow>{
                isImporting: true
              }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_SUCCESS = `${Workspaces.reducerName}_FETCH_WORKSPACE_SUCCESS`;
  private static fetchWorkspaceSuccess(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        selectedWorkspaceId: payload.id,
        byId: Object.assign(
          {},
          workspacesTable.byId,
          {
            [payload.id]: <IWorkspaceRow>Object.assign(
              {},
              workspacesTable.byId[payload],
              payload,
              {
                isImporting: false
              }
            )
          }
        )
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static ADD_BUS = `${Workspaces.reducerName}_ADD_BUS`;
  private static addBus(workspacesTable: IWorkspacesTable, payload: { workspaceId: string, busesId: [string] }) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        selectedWorkspaceId: payload.workspaceId,
        byId: Object.assign(
          {},
          workspacesTable.byId,
          {
            [payload.workspaceId]: <IWorkspaceRow>Object.assign(
              {},
              workspacesTable.byId[payload.workspaceId],
              {
                buses: workspacesTable.byId[payload.workspaceId].buses.concat(payload.busesId)
              }
            )
          }
        )
      }
    );
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Workspaces.FETCH_WORKSPACES]: Workspaces.fetchWorkspaces,
    [Workspaces.FETCH_WORKSPACES_SUCCESS]: Workspaces.fetchWorkspacesSuccess,
    [Workspaces.FETCH_WORKSPACE]: Workspaces.fetchWorkspace,
    [Workspaces.FETCH_WORKSPACE_SUCCESS]: Workspaces.fetchWorkspaceSuccess,
    [Workspaces.ADD_BUS]: Workspaces.addBus
  };
}
