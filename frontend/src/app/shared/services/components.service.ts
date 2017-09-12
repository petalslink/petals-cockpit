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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { JsTable, toJsTable } from 'app/shared/helpers/jstable.helper';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { environment } from './../../../environments/environment';

export enum EComponentState {
  Started = 'Started',
  Stopped = 'Stopped',
  Loaded = 'Loaded',
  Unloaded = 'Unloaded',
  Shutdown = 'Shutdown',
  Unknown = 'Unknown',
}

export type ComponentState = keyof typeof EComponentState;

export enum EComponentType {
  BC = 'BC',
  SE = 'SE',
}

export type ComponentType = keyof typeof EComponentType;

export interface IComponentBackendSSECommon {
  id: string;
  name: string;
  state: ComponentState;
  type: ComponentType;
  containerId: string;
}

export interface IComponentBackendDetailsCommon {
  parameters: { [key: string]: string };
}

export interface IComponentBackendSSE extends IComponentBackendSSECommon {
  // from server (sse)
  serviceUnits: string[];
  sharedLibraries: string[];
}

export interface IComponentBackendDetails
  extends IComponentBackendDetailsCommon {}

export abstract class ComponentsService {
  abstract getDetailsComponent(
    componentId: string
  ): Observable<IComponentBackendDetails>;

  abstract putState(
    workspaceId: string,
    componentId: string,
    newState: ComponentState,
    parameters: { [key: string]: string }
  ): Observable<{
    id: string;
    state: ComponentState;
  }>;

  abstract deploySu(
    workspaceId: string,
    componentId: string,
    file: File,
    serviceUnitName: string
  ): Observable<{
    serviceAssemblies: JsTable<IServiceAssemblyBackendSSE>;
    serviceUnits: JsTable<IServiceUnitBackendSSE>;
  }>;
}

@Injectable()
export class ComponentsServiceImpl extends ComponentsService {
  constructor(private http: HttpClient) {
    super();
  }

  getDetailsComponent(componentId: string) {
    return this.http.get<IComponentBackendDetails>(
      `${environment.urlBackend}/components/${componentId}`
    );
  }

  putState(
    workspaceId: string,
    componentId: string,
    newState: ComponentState,
    parameters: { [key: string]: string }
  ) {
    return this.http.put<{
      id: string;
      state: ComponentState;
    }>(
      `${environment.urlBackend}/workspaces/${workspaceId}/components/${componentId}`,
      { state: newState, parameters }
    );
  }

  deploySu(
    workspaceId: string,
    componentId: string,
    file: File,
    serviceUnitName: string
  ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', serviceUnitName);

    return this.http
      .post<{
        serviceAssemblies: { [id: string]: IServiceAssemblyBackendSSE };
        serviceUnits: { [id: string]: IServiceUnitBackendSSE };
      }>(
        `${environment.urlBackend}/workspaces/${workspaceId}/components/${componentId}/serviceunits`,
        formData
      )
      .map(res => ({
        serviceAssemblies: toJsTable(res.serviceAssemblies),
        serviceUnits: toJsTable(res.serviceUnits),
      }));
  }
}
