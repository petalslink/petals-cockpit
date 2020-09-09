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
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

export enum ESharedLibraryState {
  Loaded = 'Loaded',
  Unloaded = 'Unloaded',
}

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
    state: ESharedLibraryState
  ): Observable<{
    id: string;
    state: ESharedLibraryState;
  }>;
}

@Injectable()
export class SharedLibrariesServiceImpl extends SharedLibrariesService {
  constructor(private http: HttpClient) {
    super();
  }

  getDetails(id: string) {
    return this.http.get<ISharedLibraryBackendDetails>(
      `${environment.urlBackend}/sharedlibraries/${id}`
    );
  }

  putState(workspaceId: string, id: string, state: ESharedLibraryState) {
    return this.http.put<{
      id: string;
      state: ESharedLibraryState;
    }>(
      `${
        environment.urlBackend
      }/workspaces/${workspaceId}/sharedlibraries/${id}`,
      { state }
    );
  }
}
