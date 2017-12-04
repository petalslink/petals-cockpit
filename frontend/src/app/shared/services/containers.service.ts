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

import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { JsTable, toJsTable } from 'app/shared/helpers/jstable.helper';
import { streamHttpProgressAndSuccess } from 'app/shared/helpers/shared.helper';
import { IComponentBackendSSE } from 'app/shared/services/components.service';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';
import { environment } from 'environments/environment';

export interface IContainerBackendSSECommon {
  id: string;
  name: string;
  busId: string;
  isReachable: boolean;
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
  isReachable: boolean;
}

export abstract class ContainersService {
  abstract getDetailsContainer(
    containerId: string
  ): Observable<IContainerBackendDetails>;

  abstract deployComponent(
    workspaceId: string,
    containerId: string,
    file: File,
    name: string
  ): {
    progress$: Observable<number>;
    result$: Observable<JsTable<IComponentBackendSSE>>;
  };

  abstract deployServiceAssembly(
    workspaceId: string,
    containerId: string,
    file: File,
    name: string
  ): {
    progress$: Observable<number>;
    result$: Observable<{
      serviceAssemblies: JsTable<IServiceAssemblyBackendSSE>;
      serviceUnits: JsTable<IServiceUnitBackendSSE>;
    }>;
  };

  abstract deploySharedLibrary(
    workspaceId: string,
    containerId: string,
    file: File,
    name: string,
    version: string
  ): {
    progress$: Observable<number>;
    result$: Observable<JsTable<ISharedLibraryBackendSSE>>;
  };
}

@Injectable()
export class ContainersServiceImpl extends ContainersService {
  constructor(private http: HttpClient) {
    super();
  }

  getDetailsContainer(containerId: string) {
    return this.http.get<IContainerBackendDetails>(
      `${environment.urlBackend}/containers/${containerId}`
    );
  }

  deployComponent(
    workspaceId: string,
    containerId: string,
    file: File,
    name: string
  ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('overrides', name);

    const req = new HttpRequest(
      'POST',
      `${environment.urlBackend}/workspaces/${workspaceId}/containers/${
        containerId
      }/components`,
      formData,
      {
        reportProgress: true,
      }
    );

    return streamHttpProgressAndSuccess<
      { components: { [id: string]: IComponentBackendSSE } },
      JsTable<IComponentBackendSSE>
    >(this.http.request(req), result => toJsTable(result.components));
  }

  deployServiceAssembly(
    workspaceId: string,
    containerId: string,
    file: File,
    name: string
  ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('overrides', name);

    const req = new HttpRequest(
      'POST',
      `${environment.urlBackend}/workspaces/${workspaceId}/containers/${
        containerId
      }/serviceassemblies`,
      formData,
      {
        reportProgress: true,
      }
    );

    return streamHttpProgressAndSuccess<
      {
        serviceAssemblies: { [id: string]: IServiceAssemblyBackendSSE };
        serviceUnits: { [id: string]: IServiceUnitBackendSSE };
      },
      {
        serviceAssemblies: JsTable<IServiceAssemblyBackendSSE>;
        serviceUnits: JsTable<IServiceUnitBackendSSE>;
      }
    >(this.http.request(req), result => ({
      serviceAssemblies: toJsTable(result.serviceAssemblies),
      serviceUnits: toJsTable(result.serviceUnits),
    }));
  }

  deploySharedLibrary(
    workspaceId: string,
    containerId: string,
    file: File,
    name: string,
    version: string
  ) {
    const formData: FormData = new FormData();
    const overrides = { sharedLibrary: { name, version } };
    const blob = new Blob([JSON.stringify(overrides)], {
      type: 'application/json',
    });
    formData.append('file', file, file.name);
    formData.append('overrides', blob);

    const req = new HttpRequest(
      'POST',
      `${environment.urlBackend}/workspaces/${workspaceId}/containers/${
        containerId
      }/sharedlibraries`,
      formData,
      {
        reportProgress: true,
      }
    );

    return streamHttpProgressAndSuccess<
      { sharedLibraries: { [id: string]: ISharedLibraryBackendSSE } },
      JsTable<ISharedLibraryBackendSSE>
    >(this.http.request(req), result => toJsTable(result.sharedLibraries));
  }
}
