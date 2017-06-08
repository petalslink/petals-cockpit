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

import {
  IWorkspacesTable,
  workspacesTableFactory,
  workspaceRowFactory,
} from './workspaces.interface';
import { Users } from './../../../../../shared/state/users.reducer';
import {
  updateById,
  removeById,
  mergeInto,
  putById,
  JsMap,
} from 'app/shared/helpers/map.helper';
import {
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
} from 'app/shared/services/workspaces.service';

export class Workspaces {
  private static reducerName = '[Workspaces]';

  public static reducer(
    workspacesTable = workspacesTableFactory(),
    { type, payload }: Action
  ): IWorkspacesTable {
    if (!Workspaces.mapActionsToMethod[type]) {
      return workspacesTable;
    }

    return (
      Workspaces.mapActionsToMethod[type](workspacesTable, payload) ||
      workspacesTable
    );
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES = `${Workspaces.reducerName} Fetch workspaces`;
  private static fetchWorkspaces(
    workspacesTable: IWorkspacesTable,
    _payload
  ): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: true,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES_SUCCESS = `${Workspaces.reducerName} Fetch workspaces success`;
  private static fetchWorkspacesSuccess(
    workspacesTable: IWorkspacesTable,
    payload: JsMap<IWorkspaceBackend>
  ): IWorkspacesTable {
    return {
      ...mergeInto(workspacesTable, payload, workspaceRowFactory()),
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: false,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACES_FAILED = `${Workspaces.reducerName} Fetch workspaces failed`;
  private static fetchWorkspacesFailed(
    workspacesTable: IWorkspacesTable,
    _payload
  ): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: false,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE = `${Workspaces.reducerName} Post workspace`;
  private static postWorkspace(
    workspacesTable: IWorkspacesTable,
    _payload
  ): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isAddingWorkspace: true,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE_SUCCESS = `${Workspaces.reducerName} Post workspace success`;
  private static postWorkspaceSuccess(
    workspacesTable: IWorkspacesTable,
    payload: IWorkspaceBackend
  ): IWorkspacesTable {
    return {
      ...putById(workspacesTable, payload.id, payload, workspaceRowFactory()),
      ...<IWorkspacesTable>{
        isAddingWorkspace: false,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static POST_WORKSPACE_FAILED = `${Workspaces.reducerName} Post workspace failed`;
  private static postWorkspaceFailed(
    workspacesTable: IWorkspacesTable,
    _payload
  ): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isAddingWorkspace: false,
      },
    };
  }

  // only used in effect, no point to handle that action
  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_SSE_SUCCESS = `${Workspaces.reducerName} Fetch workspace sse success`;

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE = `${Workspaces.reducerName} Fetch workspace`;
  private static fetchWorkspace(
    workspacesTable: IWorkspacesTable,
    payload
  ): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        selectedWorkspaceId: payload,
        isSelectedWorkspaceFetched: false,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_SUCCESS = `${Workspaces.reducerName} Fetch workspace success`;
  private static fetchWorkspaceSuccess(
    workspacesTable: IWorkspacesTable,
    payload: IWorkspaceBackend
  ): IWorkspacesTable {
    return {
      ...workspacesTable.byId[payload.id]
        ? updateById(workspacesTable, payload.id, payload)
        : putById(workspacesTable, payload.id, payload, workspaceRowFactory()),
      ...<IWorkspacesTable>{
        isSelectedWorkspaceFetched: true,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_DETAILS = `${Workspaces.reducerName} Fetch workspace details`;
  private static fetchWorkspaceDetails(
    workspacesTable: IWorkspacesTable,
    payload: string
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload, { isFetchingDetails: true });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_DETAILS_SUCCESS = `${Workspaces.reducerName} Fetch workspace details success`;
  private static fetchWorkspaceDetailsSuccess(
    workspacesTable: IWorkspacesTable,
    payload: { id: string; data: IWorkspaceBackendDetails }
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static FETCH_WORKSPACE_DETAILS_FAILED = `${Workspaces.reducerName} Fetch workspace details failed`;
  private static fetchWorkspaceDetailsFailed(
    workspacesTable: IWorkspacesTable,
    payload: string
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload, { isFetchingDetails: false });
  }

  // tslint:disable-next-line:member-ordering
  public static SET_DESCRIPTION = `${Workspaces.reducerName} Set description`;
  private static setDescription(
    workspacesTable: IWorkspacesTable,
    payload: { id: string }
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload.id, {
      isSettingDescription: true,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static SET_DESCRIPTION_SUCCESS = `${Workspaces.reducerName} Set description success`;
  private static setDescriptionSuccess(
    workspacesTable: IWorkspacesTable,
    payload: { id: string; description: string }
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload.id, {
      description: payload.description,
      isSettingDescription: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static SET_DESCRIPTION_FAILED = `${Workspaces.reducerName} Set description failed`;
  private static setDescriptionFailed(
    workspacesTable: IWorkspacesTable,
    payload: string
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload, {
      isSettingDescription: false,
    });
  }

  // tslint:disable-next-line:member-ordering
  public static SET_SEARCH = `${Workspaces.reducerName} Set search`;
  private static setSearch(
    workspacesTable: IWorkspacesTable,
    payload
  ): IWorkspacesTable {
    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        searchPetals: payload.trim(),
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_WORKSPACE = `${Workspaces.reducerName} Delete workspace`;
  private static deleteWorkspace(
    workspacesTable: IWorkspacesTable,
    payload: string
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload, { isRemoving: true });
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_WORKSPACE_SUCCESS = `${Workspaces.reducerName} Delete workspace success`;
  private static deleteWorkspaceSuccess(
    workspacesTable: IWorkspacesTable,
    payload: string
  ): IWorkspacesTable {
    if (workspacesTable.selectedWorkspaceId !== payload) {
      return workspacesTable;
    }

    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isSelectedWorkspaceDeleted: true,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static DELETE_WORKSPACE_FAILED = `${Workspaces.reducerName} Delete workspace failed`;
  private static deleteWorkspaceFailed(
    workspacesTable: IWorkspacesTable,
    payload: string
  ): IWorkspacesTable {
    return updateById(workspacesTable, payload, { isRemoving: false });
  }

  /**
   * Note: while DELETE_WORKSPACE concerns the HTTP action of deleting a workspace,
   * REMOVE_WORKSPACE concerns the event coming from the SSE that a workspace has been deleted.
   */
  // tslint:disable-next-line:member-ordering
  public static REMOVE_WORKSPACE = `${Workspaces.reducerName} Remove workspace`;
  private static removeWorkspace(
    workspacesTable: IWorkspacesTable,
    payload: string
  ): IWorkspacesTable {
    if (workspacesTable.selectedWorkspaceId !== payload) {
      return workspacesTable;
    }

    return {
      ...workspacesTable,
      ...<IWorkspacesTable>{
        isSelectedWorkspaceDeleted: true,
      },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CLEAN_WORKSPACE = `${Workspaces.reducerName} Clean workspace`;

  // tslint:disable-next-line:member-ordering
  public static CLOSE_WORKSPACE = `${Workspaces.reducerName} Close workspace`;
  private static closeWorkspace(
    workspacesTable: IWorkspacesTable,
    payload
  ): IWorkspacesTable {
    if (workspacesTable.selectedWorkspaceId && payload && payload.delete) {
      return {
        ...removeById(workspacesTable, workspacesTable.selectedWorkspaceId),
        selectedWorkspaceId: '',
        isSelectedWorkspaceDeleted: false,
      };
    } else {
      return {
        ...workspacesTable,
        selectedWorkspaceId: '',
      };
    }
  }

  // tslint:disable-next-line:member-ordering
  private static disconnectUserSuccess(
    _workspacesTable: IWorkspacesTable,
    _payload
  ): IWorkspacesTable {
    return workspacesTableFactory();
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: {
    [type: string]: (t: IWorkspacesTable, p: any) => IWorkspacesTable;
  } = {
    // Workspaces
    [Workspaces.FETCH_WORKSPACES]: Workspaces.fetchWorkspaces,
    [Workspaces.FETCH_WORKSPACES_SUCCESS]: Workspaces.fetchWorkspacesSuccess,
    [Workspaces.FETCH_WORKSPACES_FAILED]: Workspaces.fetchWorkspacesFailed,
    // Workspace
    [Workspaces.FETCH_WORKSPACE]: Workspaces.fetchWorkspace,
    [Workspaces.FETCH_WORKSPACE_SUCCESS]: Workspaces.fetchWorkspaceSuccess,
    [Workspaces.FETCH_WORKSPACE_DETAILS]: Workspaces.fetchWorkspaceDetails,
    [Workspaces.FETCH_WORKSPACE_DETAILS_SUCCESS]:
      Workspaces.fetchWorkspaceDetailsSuccess,
    [Workspaces.FETCH_WORKSPACE_DETAILS_FAILED]:
      Workspaces.fetchWorkspaceDetailsFailed,
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
    // Workspace description
    [Workspaces.SET_DESCRIPTION]: Workspaces.setDescription,
    [Workspaces.SET_DESCRIPTION_FAILED]: Workspaces.setDescriptionFailed,
    [Workspaces.SET_DESCRIPTION_SUCCESS]: Workspaces.setDescriptionSuccess,
    // Disconnect
    [Users.DISCONNECT_USER_SUCCESS]: Workspaces.disconnectUserSuccess,
  };
}
