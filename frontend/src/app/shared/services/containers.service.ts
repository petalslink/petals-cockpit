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

export interface IContainerBackendSSECommon {
  id: string;
  name: string;
  busId: string;
}

export interface IContainerBackendDetailsCommon {
  ip: string;
  port: number;
  systemInfo: string;
}

export interface IContainerBackendSSE extends IContainerBackendSSECommon {
  components: string[];
  serviceAssemblies: string[];
  sharedLibraries: string[];
}

export interface IContainerBackendDetails
  extends IContainerBackendDetailsCommon {
  reachabilities: string[];
}

export abstract class ContainersService {
  abstract getDetailsContainer(containerId: string): Observable<Response>;

  abstract deployComponent(
    workspaceId: string,
    containerId: string,
    file: File
  ): Observable<Response>;

  abstract deployServiceAssembly(
    workspaceId: string,
    containerId: string,
    file: File
  ): Observable<Response>;

  abstract deploySharedLibrary(
    workspaceId: string,
    containerId: string,
    file: File
  ): Observable<Response>;
}

@Injectable()
export class ContainersServiceImpl extends ContainersService {
  constructor(private http: Http) {
    super();
  }

  getDetailsContainer(containerId: string) {
    return this.http.get(`${environment.urlBackend}/containers/${containerId}`);
  }

  deployComponent(workspaceId: string, containerId: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      `${environment.urlBackend}/workspaces/${workspaceId}/containers/${containerId}/components`,
      formData
    );
  }

  deployServiceAssembly(workspaceId: string, containerId: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      `${environment.urlBackend}/workspaces/${workspaceId}/containers/${containerId}/serviceassemblies`,
      formData
    );
  }

  deploySharedLibrary(workspaceId: string, containerId: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(
      `${environment.urlBackend}/workspaces/${workspaceId}/containers/${containerId}/sharedlibraries`,
      formData
    );
  }
}
