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
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { IUserBackend } from '@shared/services/users.service';

export interface IWorkspaceBackendCommon {
  id: string;
  name: string;
}

export interface IWorkspaceBackendDetailsCommon {
  shortDescription: string;
  description: string;
}

export interface IWorkspaceBackend
  extends IWorkspaceBackendCommon,
    IWorkspaceBackendDetailsCommon {
  // from server (sse)
  users: string[];
}

export interface IWorkspaceBackendDetails
  extends IWorkspaceBackend,
    IWorkspaceBackendDetailsCommon {}

export abstract class WorkspacesService {
  abstract fetchWorkspaces(): Observable<{
    workspaces: {
      [id: string]: IWorkspaceBackend;
    };
    users: {
      [id: string]: IUserBackend;
    };
  }>;

  abstract postWorkspace(
    name: string,
    shortDescription: string
  ): Observable<IWorkspaceBackendDetails>;

  abstract fetchWorkspace(
    id: string
  ): Observable<{
    workspace: IWorkspaceBackendDetails;
    users: {
      [id: string]: IUserBackend;
    };
  }>;

  abstract deleteWorkspace(id: string): Observable<void>;

  abstract setShortDescription(
    id: string,
    shortDescription: string
  ): Observable<void>;

  abstract setDescription(id: string, description: string): Observable<void>;

  abstract addUser(workspaceId: string, userId: string): Observable<void>;

  abstract removeUser(workspaceId: string, userId: string): Observable<void>;

  abstract refreshServices(workspaceId: string): Observable<void>;
}

@Injectable()
export class WorkspacesServiceImpl extends WorkspacesService {
  constructor(private http: HttpClient) {
    super();
  }

  fetchWorkspaces() {
    return this.http.get<{
      workspaces: {
        [id: string]: IWorkspaceBackend;
      };
      users: {
        [id: string]: IUserBackend;
      };
    }>(`${environment.urlBackend}/workspaces`);
  }

  postWorkspace(name: string, shortDescription: string) {
    return this.http.post<IWorkspaceBackendDetails>(
      `${environment.urlBackend}/workspaces`,
      {
        name: name,
        shortDescription: shortDescription,
      }
    );
  }

  fetchWorkspace(id: string) {
    return this.http.get<{
      workspace: IWorkspaceBackendDetails;
      users: {
        [id: string]: IUserBackend;
      };
    }>(`${environment.urlBackend}/workspaces/${id}`);
  }

  deleteWorkspace(id: string) {
    return this.http.delete<void>(`${environment.urlBackend}/workspaces/${id}`);
  }

  setShortDescription(id: string, shortDescription: string) {
    return this.http.put<void>(`${environment.urlBackend}/workspaces/${id}`, {
      shortDescription,
    });
  }

  setDescription(id: string, description: string) {
    return this.http.put<void>(`${environment.urlBackend}/workspaces/${id}`, {
      description,
    });
  }

  addUser(workspaceId: string, id: string) {
    return this.http.post<void>(
      `${environment.urlBackend}/workspaces/${workspaceId}/users`,
      { id }
    );
  }

  removeUser(workspaceId: string, userId: string) {
    return this.http.delete<void>(
      `${environment.urlBackend}/workspaces/${workspaceId}/users/${userId}`
    );
  }

  refreshServices(workspaceId: string) {
    return this.http.post<void>(
      `${environment.urlBackend}/workspaces/${workspaceId}/servicesrefresh`,
      {}
    );
  }
}
