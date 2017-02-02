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
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { fetchWorkspaces } from '../../../mocks/workspaces';
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkspacesMockService {
  constructor() { }

  fetchWorkspaces(): Observable<Response> {
    return Observable.of(fetchWorkspaces())
      .delay(environment.httpDelay)
      .map(workspaces => {
        return <Response>{
          ok: true,
          json: () => {
            return workspaces;
          }
        };
      });
  }
}
