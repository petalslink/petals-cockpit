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

import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { flatMap, last, map } from 'rxjs/operators';
import * as xmltojson from 'xmltojson';

import { JsTable, toJsTable } from 'app/shared/helpers/jstable.helper';
import { loadFilesContentFromZip } from 'app/shared/helpers/zip.helper';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { environment } from 'environments/environment';

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
    state: ComponentState
  ): Observable<{
    id: string;
    state: ComponentState;
  }>;

  abstract setParameters(
    workspaceId: string,
    componentId: string,
    parameters: { [key: string]: string }
  ): Observable<void>;

  abstract getComponentNameFromZipFile(file: File): Observable<string>;

  abstract deploySu(
    workspaceId: string,
    componentId: string,
    file: File,
    serviceUnitName: string
  ): {
    progress$: Observable<number>;
    result$: Observable<{
      serviceAssemblies: JsTable<IServiceAssemblyBackendSSE>;
      serviceUnits: JsTable<IServiceUnitBackendSSE>;
    }>;
  };
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

  putState(workspaceId: string, componentId: string, state: ComponentState) {
    return this.http.put<{
      id: string;
      state: ComponentState;
    }>(
      `${environment.urlBackend}/workspaces/${workspaceId}/components/${
        componentId
      }`,
      { state }
    );
  }

  setParameters(
    workspaceId: string,
    componentId: string,
    parameters: { [key: string]: string }
  ) {
    return this.http.put<void>(
      `${environment.urlBackend}/workspaces/${workspaceId}/components/${
        componentId
      }/parameters`,
      { parameters }
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

    const req = new HttpRequest(
      'POST',
      `${environment.urlBackend}/workspaces/${workspaceId}/components/${
        componentId
      }/serviceunits`,
      formData,
      {
        reportProgress: true,
      }
    );

    const progress$ = new BehaviorSubject<number>(0);

    return {
      progress$: progress$.asObservable(),
      result$: this.http.request(req).pipe(
        flatMap(event => {
          if (event.type === HttpEventType.UploadProgress) {
            const percentDone = Math.round(100 * event.loaded / event.total);

            progress$.next(percentDone);
            return empty<{
              serviceAssemblies: JsTable<IServiceAssemblyBackendSSE>;
              serviceUnits: JsTable<IServiceUnitBackendSSE>;
            }>();
          } else if (event.type === HttpEventType.Response) {
            const body = event.body as {
              serviceAssemblies: {
                [id: string]: IServiceAssemblyBackendSSE;
              };
              serviceUnits: {
                [id: string]: IServiceUnitBackendSSE;
              };
            };

            progress$.next(100);
            progress$.complete();

            return of({
              serviceAssemblies: toJsTable(body.serviceAssemblies),
              serviceUnits: toJsTable(body.serviceUnits),
            });
          } else {
            return empty<JsTable<IServiceUnitBackendSSE>>();
          }
        }),
        last()
      ),
    };
  }

  getComponentNameFromZipFile(file: File) {
    return loadFilesContentFromZip(file, filePath =>
      filePath.includes('jbi.xml')
    ).pipe(map(([firstFileContent]) => this.getNameFromXml(firstFileContent)));
  }

  private getNameFromXml(xml: string): string {
    const json: any = xmltojson.parseString(xml, {});
    let name = '';

    try {
      name = json.jbi[0].component[0].identification[0].name[0]._text;
    } catch (err) {}

    return name;
  }
}
