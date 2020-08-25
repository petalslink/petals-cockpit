/**
 * Copyright (C) 2017-2020 Linagora
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
  IWorkspaceDetails,
  IWorkspaceRow,
  IWorkspacesTable,
  IWorkspaceUserPermissions,
  IWorkspaceUserRow,
  workspaceRowFactory,
  workspacesTableFactory,
  workspaceUserPermissionsFactory,
} from './workspaces.interface';

import {
  emptyJsTable,
  JsTable,
  mergeInto,
  mergeOnly,
  putById,
  removeById,
  toJsTable,
  updateById,
} from '@shared/helpers/jstable.helper';
import { SseActions } from '@shared/services/sse.service';
import { IUserBackend } from '@shared/services/users.service';
import {
  IWorkspaceBackend,
  IWorkspaceBackendCommon,
  IWorkspaceBackendDetails,
  IWorkspaceUserBackend,
} from '@shared/services/workspaces.service';
import { Users } from '@shared/state/users.actions';
import { Workspaces } from './workspaces.actions';

export namespace WorkspacesReducer {
  type All =
    | Workspaces.FetchAll
    | Workspaces.FetchAllError
    | Workspaces.FetchAllSuccess
    | Workspaces.Create
    | Workspaces.CreateError
    | Workspaces.CreateSuccess
    | Workspaces.Fetch
    | Workspaces.FetchError
    | Workspaces.FetchSuccess
    | Workspaces.FetchDetails
    | Workspaces.FetchDetailsError
    | Workspaces.FetchDetailsSuccess
    | Workspaces.EditWorkspaceDetails
    | Workspaces.UpdateWorkspaceDetails
    | Workspaces.UpdateWorkspaceDetailsError
    | Workspaces.UpdateWorkspaceDetailsSuccess
    | Workspaces.Delete
    | Workspaces.DeleteError
    | Workspaces.DeleteSuccess
    | Workspaces.SetPetalsSearch
    | Workspaces.SetServicesSearch
    | Workspaces.Deleted
    | Workspaces.CleanWorkspace
    | Workspaces.CleanWorkspaces
    | Workspaces.AddWorkspaceUser
    | Workspaces.AddWorkspaceUserError
    | Workspaces.AddWorkspaceUserSuccess
    | Workspaces.UpdateWorkspaceUserPermissions
    | Workspaces.UpdateWorkspaceUserPermissionsError
    | Workspaces.UpdateWorkspaceUserPermissionsSuccess
    | Workspaces.DeleteUser
    | Workspaces.DeleteUserError
    | Workspaces.DeleteUserSuccess
    | Workspaces.RefreshServices
    | SseActions.ServicesUpdated
    | Users.Disconnected;

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
      case Workspaces.CreateType: {
        return post(table);
      }
      case Workspaces.CreateErrorType: {
        return postError(table, action.payload);
      }
      case Workspaces.CreateSuccessType: {
        return postSuccess(table, action.payload);
      }
      case Workspaces.FetchType: {
        return fetch(table);
      }
      case Workspaces.FetchSuccessType: {
        return fetchSuccess(table, action.payload);
      }
      case Workspaces.FetchErrorType: {
        return fetchError(table);
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
      case Workspaces.EditWorkspaceDetailsType: {
        return editWorkspaceDetails(table, action.payload);
      }
      case Workspaces.UpdateWorkspaceDetailsType: {
        return updateWorkspaceDetails(table, action.payload);
      }
      case Workspaces.UpdateWorkspaceDetailsErrorType: {
        return updateWorkspaceDetailsError(table, action.payload);
      }
      case Workspaces.UpdateWorkspaceDetailsSuccessType: {
        return updateWorkspaceDetailsSuccess(table, action.payload);
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
      case Workspaces.SetPetalsSearchType: {
        return setPetalsSearch(table, action.payload);
      }
      case Workspaces.SetServicesSearchType: {
        return setServicesSearch(table, action.payload);
      }
      case Workspaces.DeletedType: {
        return deleted(table, action.payload);
      }
      case Workspaces.CleanWorkspaceType: {
        return cleanWorkspace(table);
      }
      case Workspaces.CleanWorkspacesType: {
        return workspacesTableFactory();
      }
      case Workspaces.AddWorkspaceUserType: {
        return addWorkspaceUser(table);
      }
      case Workspaces.AddWorkspaceUserErrorType: {
        return addWorkspaceUserError(table);
      }
      case Workspaces.AddWorkspaceUserSuccessType: {
        return addWorkspaceUserSuccess(table, action.payload);
      }
      case Workspaces.UpdateWorkspaceUserPermissionsType: {
        return updateWorkspaceUserPermissions(table, action.payload);
      }
      case Workspaces.UpdateWorkspaceUserPermissionsErrorType: {
        return updateWorkspaceUserPermissionsError(table, action.payload);
      }
      case Workspaces.UpdateWorkspaceUserPermissionsSuccessType: {
        return updateWorkspaceUserPermissionsSuccess(table, action.payload);
      }
      case Workspaces.DeleteUserType: {
        return deleteUser(table);
      }
      case Workspaces.DeleteUserErrorType: {
        return deleteUserError(table);
      }
      case Workspaces.DeleteUserSuccessType: {
        return deleteUserSuccess(table, action.payload);
      }
      case Workspaces.RefreshServicesType: {
        return refreshServices(table);
      }
      case SseActions.ServicesUpdatedType: {
        return servicesUpdated(table);
      }
      case Users.DisconnectedType: {
        return workspacesTableFactory();
      }
      default:
        return table;
    }
  }

  function fetchAll(table: IWorkspacesTable): IWorkspacesTable {
    return {
      ...table,
      isFetchingWorkspaces: true,
    };
  }

  function fetchAllSuccess(
    table: IWorkspacesTable,
    payload: {
      workspaces: { [id: string]: IWorkspaceBackend };
      users: { [id: string]: IUserBackend };
    }
  ): IWorkspacesTable {
    const wksUsersAsJsTable: JsTable<IWorkspaceDetails> = toJsTable(
      Object.values(payload.workspaces).reduce(
        (workspaces, wks) => ({
          ...workspaces,
          [wks.id]: {
            ...wks,
            users: toJsTable(
              wks.users.reduce(
                (users, user) => ({
                  ...users,
                  [user]: <IWorkspaceUserRow>{
                    name: payload.users[user].name,
                  },
                }),
                <{ [id: string]: IWorkspaceUserRow }>{}
              )
            ),
          },
        }),
        <{ [id: string]: IWorkspaceRow }>{}
      )
    );

    return {
      ...mergeOnly(table, wksUsersAsJsTable, workspaceRowFactory),
      isFetchingWorkspaces: false,
    };
  }

  function fetchAllError(table: IWorkspacesTable): IWorkspacesTable {
    return {
      ...table,
      isFetchingWorkspaces: false,
    };
  }

  function post(table: IWorkspacesTable): IWorkspacesTable {
    return {
      ...table,
      isAddingWorkspace: true,
      createWksError: '',
    };
  }

  function postSuccess(
    table: IWorkspacesTable,
    payload: IWorkspaceBackend
  ): IWorkspacesTable {
    const wksCurrentUser: IWorkspaceDetails = {
      ...payload,
      users: emptyJsTable(),
    };

    return {
      ...putById(table, wksCurrentUser.id, wksCurrentUser, workspaceRowFactory),
      isAddingWorkspace: false,
    };
  }

  function postError(
    table: IWorkspacesTable,
    payload: { createWksError: string }
  ): IWorkspacesTable {
    return {
      ...table,
      isAddingWorkspace: false,
      createWksError: payload.createWksError,
    };
  }

  function fetch(table: IWorkspacesTable): IWorkspacesTable {
    return {
      ...table,
      isFetchingWorkspace: true,
    };
  }

  function fetchSuccess(
    table: IWorkspacesTable,
    payload: IWorkspaceBackendCommon
  ): IWorkspacesTable {
    return {
      ...(table.byId[payload.id]
        ? updateById(table, payload.id, payload)
        : putById(table, payload.id, payload, workspaceRowFactory)),
      selectedWorkspaceId: payload.id,
      isFetchingWorkspace: false,
    };
  }

  function fetchError(table: IWorkspacesTable): IWorkspacesTable {
    return {
      ...table,
      isFetchingWorkspace: false,
    };
  }

  function fetchDetails(table: IWorkspacesTable, payload: { id: string }) {
    return {
      ...table,
      isFetchingDetails: true,
      byId: {
        ...table.byId,
        [table.selectedWorkspaceId]: cleanPermissionsWorkspace(
          table.byId[payload.id]
        ),
      },
    };
  }

  function fetchDetailsSuccess(
    table: IWorkspacesTable,
    payload: IWorkspaceBackendDetails
  ) {
    const wksUsersAsJsTable: JsTable<IWorkspaceDetails> = toJsTable({
      [payload.id]: {
        ...payload,
        users: toJsTable(
          payload.users.reduce(
            (users, user) => ({
              ...users,
              [user.id]: <IWorkspaceUserRow>{
                ...user,
                adminWorkspace: user.adminWorkspace,
                deployArtifact: user.deployArtifact,
                lifecycleArtifact: user.lifecycleArtifact,
              },
            }),
            <{ [id: string]: IWorkspaceUserRow }>{}
          )
        ),
      },
    });

    return {
      ...mergeInto(table, wksUsersAsJsTable, workspaceRowFactory),
      isFetchingDetails: false,
    };
  }

  function fetchDetailsError(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isFetchingDetails: false });
  }

  function editWorkspaceDetails(
    table: IWorkspacesTable,
    payload: { id: string; isEditDetailsMode: boolean }
  ) {
    return updateById(table, payload.id, {
      isEditDetailsMode: payload.isEditDetailsMode,
    });
  }

  function updateWorkspaceDetails(
    table: IWorkspacesTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, { isUpdatingDetails: true });
  }

  function updateWorkspaceDetailsSuccess(
    table: IWorkspacesTable,
    payload: {
      id: string;
      name: string;
      shortDescription: string;
      description: string;
    }
  ) {
    return updateById(table, payload.id, {
      ...payload,
      isUpdatingDetails: false,
    });
  }

  function updateWorkspaceDetailsError(
    table: IWorkspacesTable,
    payload: { id: string }
  ) {
    return updateById(table, payload.id, { isUpdatingDetails: false });
  }

  function setPetalsSearch(
    table: IWorkspacesTable,
    payload: { search: string }
  ): IWorkspacesTable {
    return {
      ...table,
      searchPetals: payload.search,
    };
  }

  function setServicesSearch(
    table: IWorkspacesTable,
    payload: { search: string }
  ): IWorkspacesTable {
    return { ...table, searchServices: payload.search };
  }

  function deletee(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isRemoving: true });
  }

  function deleteSuccess(
    table: IWorkspacesTable,
    payload: { id: string }
  ): IWorkspacesTable {
    if (table.selectedWorkspaceId !== payload.id) {
      return table;
    }

    return {
      ...table,
      isSelectedWorkspaceDeleted: true,
    };
  }

  function deleteError(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, payload.id, { isRemoving: false });
  }

  function deleted(
    table: IWorkspacesTable,
    payload: { id: string }
  ): IWorkspacesTable {
    if (table.selectedWorkspaceId !== payload.id) {
      return table;
    }

    return {
      ...table,
      isSelectedWorkspaceDeleted: true,
    };
  }

  function cleanWorkspace(table: IWorkspacesTable) {
    if (table.isSelectedWorkspaceDeleted && table.selectedWorkspaceId) {
      return {
        ...removeById(table, table.selectedWorkspaceId),
        selectedWorkspaceId: '',
        searchPetals: '',
        searchServices: '',
        isSelectedWorkspaceDeleted: false,
      };
    } else {
      return {
        ...table,
        selectedWorkspaceId: '',
        searchPetals: '',
        searchServices: '',
      };
    }
  }

  function cleanPermissionsWorkspace(workspace: IWorkspaceRow) {
    return {
      ...workspace,
      users: {
        allIds: workspace.users.allIds,
        byId: workspace.users.allIds.reduce(
          (acc: { [userId: string]: IWorkspaceUserRow }, userId: string) => ({
            ...acc,
            [userId]: {
              id: userId,
              name: workspace.users.byId[userId].name,
              adminWorkspace: undefined,
              deployArtifact: undefined,
              lifecycleArtifact: undefined,
              isSavingUserPermissions: undefined,
            },
          }),
          <{ [userId: string]: IWorkspaceUserRow }>{}
        ),
      },
    };
  }

  function addWorkspaceUser(table: IWorkspacesTable) {
    return updateById(table, table.selectedWorkspaceId, {
      isAddingUserToWorkspace: true,
    });
  }

  function addWorkspaceUserError(table: IWorkspacesTable) {
    return updateById(table, table.selectedWorkspaceId, {
      isAddingUserToWorkspace: false,
    });
  }

  function addWorkspaceUserSuccess(
    table: IWorkspacesTable,
    payload: IWorkspaceUserBackend
  ): IWorkspacesTable {
    return updateById(table, table.selectedWorkspaceId, {
      isAddingUserToWorkspace: false,
      users: {
        ...putById(
          table.byId[table.selectedWorkspaceId].users,
          payload.id,
          payload,
          workspaceUserPermissionsFactory
        ),
      },
    });
  }

  function updateWorkspaceUserPermissions(
    table: IWorkspacesTable,
    payload: {
      userId: string;
    }
  ): IWorkspacesTable {
    return updateById(table, table.selectedWorkspaceId, {
      users: {
        ...updateById(
          table.byId[table.selectedWorkspaceId].users,
          payload.userId,
          {
            ...table.byId[table.selectedWorkspaceId].users.byId[payload.userId],
            isSavingUserPermissions: true,
          }
        ),
      },
    });
  }

  function updateWorkspaceUserPermissionsError(
    table: IWorkspacesTable,
    payload: {
      userId: string;
    }
  ) {
    return updateById(table, table.selectedWorkspaceId, {
      users: {
        ...updateById(
          table.byId[table.selectedWorkspaceId].users,
          payload.userId,
          {
            ...table.byId[table.selectedWorkspaceId].users.byId[payload.userId],
            isSavingUserPermissions: false,
          }
        ),
      },
    });
  }

  function updateWorkspaceUserPermissionsSuccess(
    table: IWorkspacesTable,
    payload: { userId: string; permissions: IWorkspaceUserPermissions }
  ): IWorkspacesTable {
    return updateById(table, table.selectedWorkspaceId, {
      users: {
        ...updateById(
          table.byId[table.selectedWorkspaceId].users,
          payload.userId,
          {
            ...table.byId[table.selectedWorkspaceId].users.byId[payload.userId],
            ...payload.permissions,
            isSavingUserPermissions: false,
          }
        ),
      },
    });
  }

  function deleteUser(table: IWorkspacesTable) {
    return updateById(table, table.selectedWorkspaceId, {
      isRemovingUserFromWorkspace: true,
    });
  }

  function deleteUserError(table: IWorkspacesTable) {
    return updateById(table, table.selectedWorkspaceId, {
      isRemovingUserFromWorkspace: false,
    });
  }

  function deleteUserSuccess(table: IWorkspacesTable, payload: { id: string }) {
    return updateById(table, table.selectedWorkspaceId, {
      isRemovingUserFromWorkspace: false,
      users: {
        ...removeById(table.byId[table.selectedWorkspaceId].users, payload.id),
      },
    });
  }

  function refreshServices(table: IWorkspacesTable) {
    return { ...table, isFetchingServices: true };
  }

  function servicesUpdated(table: IWorkspacesTable) {
    return { ...table, isFetchingServices: false };
  }
}
