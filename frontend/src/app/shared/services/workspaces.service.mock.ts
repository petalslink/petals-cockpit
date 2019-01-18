/**
 * Copyright (C) 2017-2019 Linagora
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

  postWorkspace(name: string) {
    const mock = this.usersService as UsersServiceMock;
    const workspace = workspacesService
      .create([mock.getCurrentUser().id], name)
      .getDetails().workspace;

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

  setDescription(id: string, description: string) {
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
        workspacesService.get(workspaceId).addUser(user);
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
