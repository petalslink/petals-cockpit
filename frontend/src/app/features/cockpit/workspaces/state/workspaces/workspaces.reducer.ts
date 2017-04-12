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
import { Users } from './../../../../../shared/state/users.reducer';
import { putAll, updateById, removeById } from 'app/shared/helpers/shared.helper';
import { IWorkspaceRow } from 'app/features/cockpit/workspaces/state/workspaces/workspace.interface';

export class Workspaces {
  private static reducerName = 'WORKSPACES_REDUCER';

  public static reducer(workspacesTable = workspacesTableFactory(), { type, payload }: Action): IWorkspacesTable {
    if (!Workspaces.mapActionsToMethod[type]) {
      return workspacesTable;
    }

    return Workspaces.mapActionsToMethod[type](workspacesTable, payload) || workspacesTable;
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES = `${Workspaces.reducerName}_FETCH_WORKSPACES`;
  private static fetchWorkspaces(workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: true
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES_SUCCESS = `${Workspaces.reducerName}_FETCH_WORKSPACES_SUCCESS`;
  private static fetchWorkspacesSuccess(workspacesTable: IWorkspacesTable, payload): IWorkspacesTable {
    return {
      ...putAll(workspacesTable, payload),
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: false
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES_FAILED = `${Workspaces.reducerName}_FETCH_WORKSPACES_FAILED`;
  private static fetchWorkspacesFailed(workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: false
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE = `${Workspaces.reducerName}_POST_WORKSPACE`;
  private static postWorkspace(workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isAddingWorkspace: true
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE_SUCCESS = `${Workspaces.reducerName}_POST_WORKSPACE_SUCCESS`;
  private static postWorkspaceSuccess(
    workspacesTable: IWorkspacesTable,
    payload: { id: string, name: string, users: string[] }): IWorkspacesTable {
    return {
      ...updateById(workspacesTable, payload.id, payload),
      ...<IWorkspacesTable>{
        isAddingWorkspace: false
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE_FAILED = `${Workspaces.reducerName}_POST_WORKSPACE_FAILED`;
  private static postWorkspaceFailed(workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isAddingWorkspace: false
      }
    };
  }

  // only used in effect, no point to handle that action
  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_SSE_SUCCESS = `${Workspaces.reducerName}_FETCH_WORKSPACE_SSE_SUCCESS`;

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE = `${Workspaces.reducerName}_FETCH_WORKSPACE`;
  private static fetchWorkspace(workspacesTable: IWorkspacesTable, payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        byId: {
          ...workspacesTable.byId,
          [payload]: {
            ...workspacesTable.byId[payload],
            ...<IWorkspaceRow>{ isFetched: false }
          }
        }
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_SUCCESS = `${Workspaces.reducerName}_FETCH_WORKSPACE_SUCCESS`;
  private static fetchWorkspaceSuccess(workspacesTable: IWorkspacesTable, payload): IWorkspacesTable {
    return {
      ...updateById(workspacesTable, payload.id, { ...payload, isFetched: true }),
      ...<IWorkspacesTable>{
        selectedWorkspaceId: payload.id
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static SET_SEARCH = `${Workspaces.reducerName}_SET_SEARCH`;
  private static setSearch(workspacesTable: IWorkspacesTable, payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        searchPetals: payload.trim()
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_WORKSPACE = `${Workspaces.reducerName}_DELETE_WORKSPACE`;
  private static deleteWorkspace(workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isRemovingWorkspace: true
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_WORKSPACE_SUCCESS = `${Workspaces.reducerName}_DELETE_WORKSPACE_SUCCESS`;
  private static deleteWorkspaceSuccess(workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        deletedWorkspace: true
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_WORKSPACE_FAILED = `${Workspaces.reducerName}_DELETE_WORKSPACE_FAILED`;
  private static deleteWorkspaceFailed(workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isRemovingWorkspace: false
      }
    };
  }

  // tslint:disable-next-line:member-ordering
  public static REMOVE_WORKSPACE = `${Workspaces.reducerName}_REMOVE_WORKSPACE`;
  private static removeWorkspace(workspacesTable: IWorkspacesTable, payload): IWorkspacesTable {
    if (workspacesTable.selectedWorkspaceId === payload.workspaceId) {
      return {
        ...workspacesTable,
        ...<IWorkspacesTable>{
          deletedWorkspace: true
        }
      };
    } else {
      return workspacesTable;
    }
  }

  // tslint:disable-next-line:member-ordering
  public static CLEAN_WORKSPACE = `${Workspaces.reducerName}_CLEAN_WORKSPACE`;

  // tslint:disable-next-line:member-ordering
  public static CLOSE_WORKSPACE = `${Workspaces.reducerName}_CLOSE_WORKSPACE`;
  private static closeWorkspace(workspacesTable: IWorkspacesTable, payload): IWorkspacesTable {
    if (workspacesTable.selectedWorkspaceId && payload && payload.delete) {
      return {
        ...removeById(workspacesTable, workspacesTable.selectedWorkspaceId),
        selectedWorkspaceId: '',
        deletedWorkspace: false,
        isRemovingWorkspace: false
      };
    } else {
      return {
        ...workspacesTable,
        selectedWorkspaceId: ''
      };
    }
  }

  // tslint:disable-next-line:member-ordering
  private static disconnectUserSuccess(_workspacesTable: IWorkspacesTable, _payload): IWorkspacesTable {
    return workspacesTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: { [type: string]: (t: IWorkspacesTable, p: any) => IWorkspacesTable } = {
    // Workspaces
    [Workspaces.FETCH_WORKSPACES]: Workspaces.fetchWorkspaces,
    [Workspaces.FETCH_WORKSPACES_SUCCESS]: Workspaces.fetchWorkspacesSuccess,
    [Workspaces.FETCH_WORKSPACES_FAILED]: Workspaces.fetchWorkspacesFailed,
    // Workspace
    [Workspaces.FETCH_WORKSPACE]: Workspaces.fetchWorkspace,
    [Workspaces.FETCH_WORKSPACE_SUCCESS]: Workspaces.fetchWorkspaceSuccess,
    [Workspaces.POST_WORKSPACE]: Workspaces.postWorkspace,
    [Workspaces.POST_WORKSPACE_SUCCESS]: Workspaces.postWorkspaceSuccess,
    [Workspaces.POST_WORKSPACE_FAILED]: Workspaces.postWorkspaceFailed,
    [Workspaces.DELETE_WORKSPACE]: Workspaces.deleteWorkspace,
    [Workspaces.DELETE_WORKSPACE_SUCCESS]: Workspaces.deleteWorkspaceSuccess,
    [Workspaces.DELETE_WORKSPACE_FAILED]: Workspaces.deleteWorkspaceFailed,
    [Workspaces.REMOVE_WORKSPACE]: Workspaces.removeWorkspace,
    [Workspaces.CLOSE_WORKSPACE]: Workspaces.closeWorkspace,
    // Search
    [Workspaces.SET_SEARCH]: Workspaces.setSearch,
    // Disconnect
    [Users.DISCONNECT_USER_SUCCESS]: Workspaces.disconnectUserSuccess
  };
}
