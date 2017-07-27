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

import { environment } from './../../../environments/environment';

export enum ESharedLibraryState {
  Loaded = 'Loaded',
  Unloaded =  'Unloaded',
};

export type SharedLibraryState = keyof typeof ESharedLibraryState;

export interface ISharedLibraryBackendSSECommon {
  id: string;
  name: string;
  version: string;
  containerId: string;
}

export interface ISharedLibraryBackendDetailsCommon {}

export interface ISharedLibraryBackendSSE
  extends ISharedLibraryBackendSSECommon {
  components: string[];
}

export interface ISharedLibraryBackendDetails
  extends ISharedLibraryBackendDetailsCommon {}

export abstract class SharedLibrariesService {
  abstract getDetails(id: string): Observable<ISharedLibraryBackendDetails>;

  abstract putState(
    workspaceId: string,
    id: string,
    state: SharedLibraryState
  ): Observable<Response>;
}

@Injectable()
export class SharedLibrariesServiceImpl extends SharedLibrariesService {
  constructor(private http: Http) {
    super();
  }

  getDetails(id: string) {
    return this.http
      .get(`${environment.urlBackend}/sharedlibraries/${id}`)
      .map(res => res.json() as ISharedLibraryBackendDetails);
  }

  putState(workspaceId: string, id: string, state: SharedLibraryState) {
    return this.http.put(
      `${environment.urlBackend}/workspaces/${workspaceId}/sharedlibraries/${id}`,
      { state }
    );
  }
}
