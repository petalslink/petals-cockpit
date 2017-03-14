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

import { WorkspacesService } from './workspaces.service';
import { UsersService } from './users.service';
import { UsersMockService } from './users.service.mock';
import { environment } from '../../../environments/environment';
import * as helper from './../helpers/mock.helper';
import { workspacesService } from './../../../mocks/workspaces-mock';

@Injectable()
export class WorkspacesMockService extends WorkspacesService {

  constructor(private usersService: UsersService) {
    super();
  }

  fetchWorkspaces() {
    const mock = (this.usersService as UsersMockService);
    return helper.responseBody(workspacesService.getWorkspacesListAndUsers(mock.getCurrentUser().id));
  }

  postWorkspace(workspaceName: string) {
    const workspace = workspacesService.getNewWorkspace(workspaceName);

    return helper
      .responseBody(workspace)
      .delay(environment.httpDelay);
  }
}
