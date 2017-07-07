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

import {
  IWorkspacesTable,
  workspacesTableFactory,
  workspaceRowFactory,
} from './workspaces.interface';

import {
  updateById,
  removeById,
  mergeInto,
  putById,
  JsTable,
} from 'app/shared/helpers/jstable.helper';
import {
  IWorkspaceBackend,
  IWorkspaceBackendDetails,
} from 'app/shared/services/workspaces.service';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { Users } from 'app/shared/state/users.actions';

export namespace WorkspacesReducer {
  type All =
    | Workspaces.FetchAll
    | Workspaces.FetchAllError
    | Workspaces.FetchAllSuccess
    | Workspaces.Post
    | Workspaces.PostError
    | Workspaces.PostSuccess
    | Workspaces.Fetch
    | Workspaces.FetchError
    | Workspaces.FetchSuccess
    | Workspaces.FetchDetails
    | Workspaces.FetchDetailsError
    | Workspaces.FetchDetailsSuccess
    | Workspaces.SetDescription
    | Workspaces.SetDescriptionError
    | Workspaces.SetDescriptionSuccess
    | Workspaces.Delete
    | Workspaces.DeleteError
    | Workspaces.DeleteSuccess
    | Workspaces.SetSearch
    | Workspaces.Removed
    | Workspaces.Close
    | Workspaces.AddUser
    | Workspaces.AddUserError
    | Workspaces.AddUserSuccess
    | Workspaces.DeleteUserSuccess
    | Users.DisconnectSuccess;

  export function reducer(
    table = workspacesTableFactory(),
    action: All
  ): IWorkspacesTable {
    switch (action.type) {
      case Workspaces.FetchAllType: {
        return fetchAll(table);
      }
      case Workspaces.FetchAllErrorType: {
        return fetchAllError(table);
      }
      case Workspaces.FetchAllSuccessType: {
        return fetchAllSuccess(table, action.payload);
      }
      case Workspaces.PostType: {
        return post(table);
      }
      case Workspaces.PostErrorType: {
        return postError(table);
      }
      case Workspaces.PostSuccessType: {
        return postSuccess(table, action.payload);
      }
      case Workspaces.FetchType: {
        return fetch(table, action.payload);
      }
      case Workspaces.FetchErrorType: {
        return fetchError(table);
      }
      case Workspaces.FetchSuccessType: {
        return fetchSuccess(table, action.payload);
      }
      case Workspaces.FetchDetailsType: {
        return fetchDetails(table, action.payload);
      }
      case Workspaces.FetchDetailsErrorType: {
        return fetchDetailsError(table, action.payload);
      }
      case Workspaces.FetchDetailsSuccessType: {
        return fetchDetailsSuccess(table, action.payload);
      }
      case Workspaces.SetDescriptionType: {
        return setDescription(table, action.payload);
      }
      case Workspaces.SetDescriptionErrorType: {
        return setDescriptionError(table, action.payload);
      }
      case Workspaces.SetDescriptionSuccessType: {
        return setDescriptionSuccess(table, action.payload);
      }
      case Workspaces.DeleteType: {
        return deletee(table, action.payload);
      }
      case Workspaces.DeleteErrorType: {
        return deleteError(table, action.payload);
      }
      case Workspaces.DeleteSuccessType: {
        return deleteSuccess(table, action.payload);
      }
      case Workspaces.SetSearchType: {
        return setSearch(table, action.payload);
      }
      case Workspaces.RemovedType: {
        return removed(table, action.payload);
      }
      case Workspaces.CloseType: {
        return close(table, action.payload);
      }
      case Workspaces.AddUserType: {
        return addUser(table, action.payload);
      }
      case Workspaces.AddUserErrorType: {
        return addUserError(table, action.payload);
      }
      case Workspaces.AddUserSuccessType: {
        return addUserSuccess(table, action.payload);
      }
      case Workspaces.DeleteUserSuccessType: {
        return deleteUserSuccess(table, action.payload);
      }
      case Users.DisconnectSuccessType: {
        return workspacesTableFactory();
      }
      default:
        return table;
    }
  }

  function fetchAll(table: IWorkspacesTable) {
    return {
      ...table,
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: true,
      },
    };
  }

  function fetchAllSuccess(
    table: IWorkspacesTable,
    payload: JsTable<IWorkspaceBackend>
  ) {
    return {
      ...mergeInto(table, payload, workspaceRowFactory),
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: false,
      },
    };
  }

  function fetchAllError(table: IWorkspacesTable) {
    return {
      ...table,
      ...<IWorkspacesTable>{
        isFetchingWorkspaces: false,
      },
    };
  }

  function post(table: IWorkspacesTable) {
    return {
      ...table,
      ...<IWorkspacesTable>{
        isAddingWorkspace: true,
      },
    };
  }

  function postSuccess(table: IWorkspacesTable, payload: IWorkspaceBackend) {
    return {
      ...putById(table, payload.id, payload, workspaceRowFactory),
      ...<IWorkspacesTable>{
        isAddingWorkspace: false,
      },
    };
  }

  function postError(table: IWorkspacesTable) {
    return {
      ...table,
      ...<IWorkspacesTable>{
        isAddingWorkspace: false,
      },
    };
  }

  function fetch(table: IWorkspacesTable, payload: { id: string }) {
    return {
      ...table,
      ...<IWorkspacesTable>{
        selectedWorkspaceId: payload.id,
        isSelectedWorkspaceFetchError: false,
        isSelectedWorkspaceFetched: false,
      },
    };
  }

  function fetchSuccess(table: IWorkspacesTable, payload: IWorkspaceBackend) {
    return {
      ...table.byId[payload.id]
        ? updateById(table, payload.id, payload)
        : putById(table, payload.id, payload, workspaceRowFactory),
      ...<IWorkspacesTable>{
        isSelectedWorkspaceFetched: true,
      },
    };
  }

  function fetchError(table: IWorkspacesTable) {
    return {
      ...table,
      ...<IWorkspacesTable>{
        isSelectedWorkspaceFetchError: true,
      },
    };
  }

  function fetchDetails(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isFetchingDetails: true });
  }

  function fetchDetailsSuccess(
    table: IWorkspacesTable,
    payload: { id: string; data: IWorkspaceBackendDetails }
  ) {
    return updateById(table, payload.id, {
      ...payload.data,
      isFetchingDetails: false,
    });
  }

  function fetchDetailsError(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isFetchingDetails: false });
  }

  function setDescription(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, {
      isSettingDescription: true,
    });
  }

  function setDescriptionSuccess(
    table: IWorkspacesTable,
    payload: { id: string; description: string }
  ) {
    return updateById(table, payload.id, {
      description: payload.description,
      isSettingDescription: false,
    });
  }

  function setDescriptionError(
    table: IWorkspacesTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, {
      isSettingDescription: false,
    });
  }

  function setSearch(table: IWorkspacesTable, payload: { search: string }) {
    return {
      ...table,
      ...<IWorkspacesTable>{
        searchPetals: payload.search,
      },
    };
  }

  function deletee(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isRemoving: true });
  }

  function deleteSuccess(table: IWorkspacesTable, payload: { id: string }) {
    if (table.selectedWorkspaceId !== payload.id) {
      return table;
    }

    return {
      ...table,
      ...<IWorkspacesTable>{
        isSelectedWorkspaceDeleted: true,
      },
    };
  }

  function deleteError(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isRemoving: false });
  }

  /**
   * Note: while DELETE_WORKSPACE concerns the HTTP action of deleting a workspace,
   * REMOVE_WORKSPACE concerns the event coming from the SSE that a workspace has been deleted.
   */
  function removed(table: IWorkspacesTable, payload: { id: string }) {
    if (table.selectedWorkspaceId !== payload.id) {
      return table;
    }

    return {
      ...table,
      ...<IWorkspacesTable>{
        isSelectedWorkspaceDeleted: true,
      },
    };
  }

  function close(table: IWorkspacesTable, payload: { deleted?: boolean }) {
    if (table.selectedWorkspaceId && payload && payload.deleted) {
      return {
        ...removeById(table, table.selectedWorkspaceId),
        selectedWorkspaceId: '',
        isSelectedWorkspaceDeleted: false,
      };
    } else {
      return {
        ...table,
        selectedWorkspaceId: '',
      };
    }
  }

  function addUser(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, table.selectedWorkspaceId, {
      isAddingUserToWorkspace: true,
    });
  }

  function addUserError(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, table.selectedWorkspaceId, {
      isAddingUserToWorkspace: false,
    });
  }

  function addUserSuccess(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, table.selectedWorkspaceId, {
      isAddingUserToWorkspace: false,
      users: [
        ...Array.from(
          new Set([...table.byId[table.selectedWorkspaceId].users, payload.id])
        ),
      ],
    });
  }

  function deleteUserSuccess(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, table.selectedWorkspaceId, {
      users: table.byId[table.selectedWorkspaceId].users.filter(
        userId => userId !== payload.id
      ),
    });
  }
}
