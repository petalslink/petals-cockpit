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

    return Workspaces.mapActionsToMethod[type](workspacesTable, type, payload) || workspacesTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES = `${Workspaces.reducerName}_FETCH_WORKSPACES`;
  private static fetchWorkspaces(workspacesTable: IWorkspacesTable, type, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable, <IWorkspacesTable>{ isFetchingWorkspaces: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES_SUCCESS = `${Workspaces.reducerName}_FETCH_WORKSPACES_SUCCESS`;
  private static fetchWorkspacesSuccess(workspacesTable: IWorkspacesTable, type, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      payload,
      <IWorkspacesTable>{
        isFetchingWorkspaces: false
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE = `${Workspaces.reducerName}_FETCH_WORKSPACE`;
  private static fetchWorkspace(workspacesTable: IWorkspacesTable, type, payload) {
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
  private static fetchWorkspaceSuccess(workspacesTable: IWorkspacesTable, type, payload) {
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

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Workspaces.FETCH_WORKSPACES]: Workspaces.fetchWorkspaces,
    [Workspaces.FETCH_WORKSPACES_SUCCESS]: Workspaces.fetchWorkspacesSuccess,
    [Workspaces.FETCH_WORKSPACE]: Workspaces.fetchWorkspace,
    [Workspaces.FETCH_WORKSPACE_SUCCESS]: Workspaces.fetchWorkspaceSuccess,
    // [Workspaces.]: Workspaces.,
  };
}
