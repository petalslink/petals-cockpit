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

import { loadFilesContentFromZip } from 'app/shared/helpers/zip.helper';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import * as xmltojson from 'xmltojson';

export enum EServiceAssemblyState {
  Started = 'Started',
  Stopped = 'Stopped',
  Unloaded = 'Unloaded',
  Shutdown = 'Shutdown',
  Unknown = 'Unknown',
}

export type ServiceAssemblyState = keyof typeof EServiceAssemblyState;

export interface IServiceAssemblyBackendSSECommon {
  id: string;
  name: string;
  containerId: string;
  state: ServiceAssemblyState;
}

export interface IServiceAssemblyBackendDetailsCommon {}

export interface IServiceAssemblyBackendSSE
  extends IServiceAssemblyBackendSSECommon {
  serviceUnits: string[];
}

export interface IServiceAssemblyBackendDetails
  extends IServiceAssemblyBackendDetailsCommon {}

export abstract class ServiceAssembliesService {
  abstract getDetailsServiceAssembly(
    serviceAssemblyId: string
  ): Observable<IServiceAssemblyBackendDetails>;

  abstract putState(
    workspaceId: string,
    serviceAssemblyId: string,
    newState: ServiceAssemblyState
  ): Observable<{
    id: string;
    state: ServiceAssemblyState;
  }>;

  abstract getServiceAssemblyNameFromZipFile(file: File): Observable<string>;
}

@Injectable()
export class ServiceAssembliesServiceImpl extends ServiceAssembliesService {
  constructor(private http: HttpClient) {
    super();
  }

  getDetailsServiceAssembly(serviceAssemblyId: string) {
    return this.http.get<IServiceAssemblyBackendDetails>(
      `${environment.urlBackend}/serviceassemblies/${serviceAssemblyId}`
    );
  }

  putState(
    workspaceId: string,
    serviceAssemblyId: string,
    newState: ServiceAssemblyState
  ) {
    return this.http.put<{
      id: string;
      state: ServiceAssemblyState;
    }>(
      `${environment.urlBackend}/workspaces/${workspaceId}/serviceassemblies/${
        serviceAssemblyId
      }`,
      { state: newState }
    );
  }

  getServiceAssemblyNameFromZipFile(file: File) {
    return loadFilesContentFromZip(file, filePath =>
      filePath.includes('jbi.xml')
    ).pipe(map(([firstFileContent]) => this.getNameFromXml(firstFileContent)));
  }

  private getNameFromXml(xml: string): string {
    const json: any = xmltojson.parseString(xml, {});
    let name = '';

    try {
      name = json.jbi[0]['service-assembly'][0].identification[0].name[0]._text;
    } catch (err) {}

    return name;
  }
}
