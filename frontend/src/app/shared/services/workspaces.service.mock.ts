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

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Store } from '@ngrx/store';

import { WorkspacesServiceImpl } from './workspaces.service';
import { UsersService } from './users.service';
import { UsersMockService } from './users.service.mock';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { SseServiceMock } from './sse.service.mock';
import { workspacesService } from '../../../mocks/workspaces-mock';
import * as helper from './../helpers/mock.helper';
import { environment } from '../../../environments/environment';
import { IStore } from '../interfaces/store.interface';

@Injectable()
export class WorkspacesMockService extends WorkspacesServiceImpl {

  constructor(http: Http, store$: Store<IStore>, private pSseService: SseService, private usersService: UsersService) {
    super(http, store$, pSseService);
  }

  fetchWorkspaces() {
    const mock = (this.usersService as UsersMockService);
    return helper.responseBody(workspacesService.getWorkspacesListAndUsers(mock.getCurrentUser().id));
  }

  postWorkspace(name: string) {
    const workspace = workspacesService.getNewWorkspace(name);

    return helper
      .responseBody(workspace)
      .delay(environment.httpDelay);
  }

  fetchWorkspace(id: string) {
    return helper
      .responseBody(workspacesService.getWorkspaceOverview(id))
      .delay(environment.httpDelay);
  }

  setDescription(id: string, description: string) {
    workspacesService.getWorkspace(id).description = description;
    return helper
      .response(204)
      .delay(environment.httpDelay);
  }

  deleteWorkspace(id: string) {
    return helper
      .response(204)
      .do(_ => {
        // simulate the backend sending the answer on the SSE
        setTimeout(() => {
          workspacesService.deleteWorkspace(id);
          (this.pSseService as SseServiceMock).triggerSseEvent(SseWorkspaceEvent.WORKSPACE_DELETED, { id });
        }, environment.sseDelay);
      });
  }
}
