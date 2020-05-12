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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, tap } from 'rxjs/operators';

import { environment } from '@env/environment';
import {
  IWorkspaceUserPermissions,
  IWorkspaceUserRow,
} from '@feat/cockpit/workspaces/state/workspaces/workspaces.interface';
import {
  ADD_WKS_HTTP_ERROR_BACKEND,
  errorBackend,
  UPDATE_WKS_HTTP_ERROR_BACKEND,
} from '@mocks/backend-mock';
import { BackendUser } from '@mocks/users-mock';
import { workspacesService } from '@mocks/workspaces-mock';
import * as helper from '@shared/helpers/mock.helper';
import { SseActions, SseService } from './sse.service';
import { SseServiceMock } from './sse.service.mock';
import { UsersService } from './users.service';
import { UsersServiceMock } from './users.service.mock';
import { WorkspacesServiceImpl } from './workspaces.service';

@Injectable()
export class WorkspacesServiceMock extends WorkspacesServiceImpl {
  constructor(
    http: HttpClient,
    private sseService: SseService,
    private usersService: UsersService
  ) {
    super(http);
  }

  fetchWorkspaces() {
    const mock = this.usersService as UsersServiceMock;
    return helper.responseBody(
      workspacesService.getWorkspacesListAndUsers(mock.getCurrentUser().id)
    );
  }

  postWorkspace(name: string, shortDescription: string) {
    // only used by the tests to verify an error coming from the backend...
    if (name === ADD_WKS_HTTP_ERROR_BACKEND) {
      return helper.errorBackend(errorBackend, 500);
    }

    const mock = this.usersService as UsersServiceMock;
    const workspace = workspacesService
      .create(
        [
          {
            id: mock.getCurrentUser().id,
            name: mock.getCurrentUser().name,
            adminWorkspace: true,
            deployArtifact: true,
            lifecycleArtifact: true,
            isSavingUserPermissions: true,
          },
        ],
        name,
        shortDescription
      )
      .getDetails();

    return helper
      .responseBody(workspace)
      .pipe(delay(environment.mock.httpDelay));
  }

  fetchWorkspace(id: string) {
    const ws = workspacesService.get(id);

    return (ws
      ? helper.responseBody(ws.getDetails())
      : helper.response(404)
    ).pipe(delay(environment.mock.httpDelay));
  }

  putWorkspaceDetails(
    id: string,
    name: string,
    shortDescription: string,
    description: string
  ) {
    // only used by the tests to verify an error coming from the backend...
    if (name === UPDATE_WKS_HTTP_ERROR_BACKEND) {
      return helper.errorBackend(errorBackend, 500);
    }

    workspacesService.get(id).name = name;
    workspacesService.get(id).shortDescription = shortDescription;
    workspacesService.get(id).description = description;
    return helper.response(204).pipe(delay(environment.mock.httpDelay));
  }

  deleteWorkspace(id: string) {
    return helper.response(204).pipe(
      delay(environment.mock.httpDelay),
      tap(_ => {
        // simulate the backend sending the answer on the SSE
        setTimeout(() => {
          workspacesService.delete(id);
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseActions.WorkspaceDeletedSse,
            { id }
          );
        }, environment.mock.sseDelay);
      })
    );
  }

  addUser(workspaceId: string, userId: string) {
    return helper.response(204).pipe(
      delay(environment.mock.httpDelay),
      tap(_ => {
        const user: BackendUser = BackendUser.get(userId);
        workspacesService.get(workspaceId).addUserWithoutPermission(user);
      })
    );
  }

  putUserPermissions(
    workspaceId: string,
    userId: string,
    permissions: IWorkspaceUserPermissions
  ) {
    const mock = this.usersService as UsersServiceMock;

    // only used by the tests to verify a 409 conflict error coming from the backend
    if (
      mock.getCurrentUser().id === userId &&
      !permissions.adminWorkspace &&
      workspacesService
        .get(workspaceId)
        .getUsers()
        .filter(user => user.adminWorkspace).length === 1
    ) {
      return helper.errorBackend(errorBackend, 409);
    }

    const userWithPermissions = {
      id: userId,
      adminWorkspace: permissions.adminWorkspace,
      deployArtifact: permissions.deployArtifact,
      lifecycleArtifact: permissions.lifecycleArtifact,
    } as IWorkspaceUserRow;

    return helper.response(204).pipe(
      delay(environment.mock.httpDelay),
      tap(_ => {
        workspacesService
          .get(workspaceId)
          .updateUserPermissions(userWithPermissions);
      })
    );
  }

  removeUser(workspaceId: string, userId: string) {
    return helper.response(204).pipe(
      delay(environment.mock.httpDelay),
      tap(_ => {
        workspacesService.get(workspaceId).removeUser(userId);
      })
    );
  }

  refreshServices(workspaceId: string) {
    const refreshedServices = workspacesService.getRefreshedServices();
    return helper.response(204).pipe(
      tap(_ => {
        setTimeout(() => {
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseActions.ServicesUpdatedSse,
            refreshedServices
          );
        }, 1000);
      })
    );
  }
}
