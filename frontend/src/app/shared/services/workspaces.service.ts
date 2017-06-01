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
import { Store } from '@ngrx/store';

import { IStore } from './../interfaces/store.interface';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { Workspaces } from './../../features/cockpit/workspaces/state/workspaces/workspaces.reducer';
import { environment } from './../../../environments/environment';

export interface IWorkspaceBackendCommon {
  id: string;
  name: string;
}

export interface IWorkspaceBackendDetailsCommon {
  description: string;
}

export interface IWorkspaceBackend extends IWorkspaceBackendCommon {
  // from server (sse)
  users: Array<string>;
}

export interface IWorkspaceBackendDetails extends IWorkspaceBackendDetailsCommon { }

export abstract class WorkspacesService {
  abstract fetchWorkspaces(): Observable<Response>;

  abstract postWorkspace(name: string): Observable<Response>;

  abstract fetchWorkspace(id: string): Observable<Response>;

  abstract deleteWorkspace(id: string): Observable<Response>;

  abstract setDescription(id: string, description: string): Observable<Response>;

  abstract watchEventWorkspaceDeleted(): Observable<void>;
}

@Injectable()
export class WorkspacesServiceImpl extends WorkspacesService {
  constructor(
    private http: Http,
    private store$: Store<IStore>,
    private sseService: SseService
  ) {
    super();
  }

  fetchWorkspaces() {
    return this.http.get(`${environment.urlBackend}/workspaces`);
  }

  postWorkspace(name: string) {
    return this.http.post(`${environment.urlBackend}/workspaces`, { name: name });
  }

  fetchWorkspace(id: string) {
    return this.http.get(`${environment.urlBackend}/workspaces/${id}`);
  }

  deleteWorkspace(id: string) {
    return this.http.delete(`${environment.urlBackend}/workspaces/${id}`);
  }

  setDescription(id: string, description: string) {
    return this.http.put(`${environment.urlBackend}/workspaces/${id}`, { description });
  }

  watchEventWorkspaceDeleted() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.WORKSPACE_DELETED)
      .do((data: { id: string }) => {
        this.sseService.stopWatchingWorkspace();
        this.store$.dispatch({
          type: Workspaces.REMOVE_WORKSPACE, payload: data.id
        });
      });
  }
}
