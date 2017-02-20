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

import { IWorkspacesTable } from './workspaces.interface';
import { workspacesTableFactory } from './workspaces.initial-state';
import { workspaceRowFactory } from './workspace.initial-state';
import { IWorkspaceRow } from './workspace.interface';
import { Users } from './../../../../../shared/state/users.reducer';

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

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES_FAILED = `${Workspaces.reducerName}_FETCH_WORKSPACES_FAILED`;
  private static fetchWorkspacesFailed(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        isFetchingWorkspaces: false
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE = `${Workspaces.reducerName}_POST_WORKSPACE`;
  private static postWorkspace(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        isAddingWorkspace: true
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE_SUCCESS = `${Workspaces.reducerName}_POST_WORKSPACE_SUCCESS`;
  private static postWorkspaceSuccess(workspacesTable: IWorkspacesTable, payload: { id: string, name: string, users: string[] }) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        isAddingWorkspace: false,
        byId: Object.assign({}, workspacesTable.byId, {
          [payload.id]: Object.assign({}, workspacesTable.byId[payload.id], <IWorkspaceRow>payload)
        }),
        allIds: [...Array.from(new Set([...workspacesTable.allIds, payload.id]))]
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE_FAILED = `${Workspaces.reducerName}_POST_WORKSPACE_FAILED`;
  private static postWorkspaceFailed(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        isAddingWorkspace: false
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
            [payload.id]: <IWorkspaceRow>Object.assign(
              {},
              workspacesTable.byId[payload.id],
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
    const cleanWorkspaces = workspacesTable
      .allIds
      .reduce((acc, workspaceId) =>
        Object.assign(acc, {
          byId: Object.assign(acc.byId, {
            [workspaceId]: Object.assign({},
              workspacesTable.byId[workspaceId],
              workspaceRowFactory(
                workspacesTable.byId[workspaceId].id,
                workspacesTable.byId[workspaceId].name
              )
            )
          }),
          allIds: [...acc.allIds, workspaceId]
        }), { byId: {}, allIds: [] }
      )

    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        firstWorkspaceFetched: true,
        selectedWorkspaceId: payload.id,
        byId: Object.assign(
          {},
          cleanWorkspaces.byId,
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
        ),
        allIds: cleanWorkspaces.allIds
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_FAILED = `${Workspaces.reducerName}_FETCH_WORKSPACE_FAILED`;
  private static fetchWorkspaceFailed(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        fetchingWorkspaceWithId: null
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  public static SET_SEARCH = `${Workspaces.reducerName}_SET_SEARCH`;
  private static setSearch(workspacesTable: IWorkspacesTable, payload) {
    return <IWorkspacesTable>Object.assign({}, workspacesTable,
      <IWorkspacesTable>{
        searchPetals: payload
      }
    );
  }

  private static disconnectUserSuccess(workspacesTable: IWorkspacesTable, payload) {
    return workspacesTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    // Workspaces
    [Workspaces.FETCH_WORKSPACES]: Workspaces.fetchWorkspaces,
    [Workspaces.FETCH_WORKSPACES_SUCCESS]: Workspaces.fetchWorkspacesSuccess,
    [Workspaces.FETCH_WORKSPACES_FAILED]: Workspaces.fetchWorkspacesFailed,
    // Workspace
    [Workspaces.FETCH_WORKSPACE]: Workspaces.fetchWorkspace,
    [Workspaces.FETCH_WORKSPACE_SUCCESS]: Workspaces.fetchWorkspaceSuccess,
    [Workspaces.FETCH_WORKSPACE_FAILED]: Workspaces.fetchWorkspaceFailed,
    [Workspaces.POST_WORKSPACE]: Workspaces.postWorkspace,
    [Workspaces.POST_WORKSPACE_SUCCESS]: Workspaces.postWorkspaceSuccess,
    [Workspaces.POST_WORKSPACE_FAILED]: Workspaces.postWorkspaceFailed,
    // Search
    [Workspaces.SET_SEARCH]: Workspaces.setSearch,
    // Disconnect
    [Users.DISCONNECT_USER_SUCCESS]: Workspaces.disconnectUserSuccess
  };
}
