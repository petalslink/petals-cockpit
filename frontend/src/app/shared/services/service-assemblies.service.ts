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

// http://stackoverflow.com/a/41631732/2398593
export const EServiceAssemblyState = {
  Started: 'Started' as 'Started',
  Stopped: 'Stopped' as 'Stopped',
  Unloaded: 'Unloaded' as 'Unloaded',
  Shutdown: 'Shutdown' as 'Shutdown',
  Unknown: 'Unknown' as 'Unknown',
};

export type ServiceAssemblyState = keyof typeof EServiceAssemblyState;

export interface IServiceAssemblyBackendSSECommon {
  id: string;
  name: string;
  containerId: string;
  state: ServiceAssemblyState;
}

export interface IServiceAssemblyBackendDetailsCommon {}

export interface IServiceAssemblyBackendSSE extends IServiceAssemblyBackendSSECommon {
  serviceUnits: string[];
}

export interface IServiceAssemblyBackendDetails extends IServiceAssemblyBackendDetailsCommon {}

export abstract class ServiceAssembliesService {
  abstract getDetailsServiceAssembly(
    serviceAssemblyId: string
  ): Observable<Response>;

  abstract putState(
    workspaceId: string,
    serviceAssemblyId: string,
    newState: ServiceAssemblyState
  ): Observable<Response>;
}

@Injectable()
export class ServiceAssembliesServiceImpl extends ServiceAssembliesService {
  constructor(private http: Http) {
    super();
  }

  getDetailsServiceAssembly(serviceAssemblyId: string) {
    return this.http.get(
      `${environment.urlBackend}/serviceassemblies/${serviceAssemblyId}`
    );
  }

  putState(
    workspaceId: string,
    serviceAssemblyId: string,
    newState: ServiceAssemblyState
  ) {
    return this.http.put(
      `${environment.urlBackend}/workspaces/${workspaceId}/serviceassemblies/${serviceAssemblyId}`,
      { state: newState }
    );
  }
}
