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

export interface IBusBackendSSECommon {
  id: string;
  name: string;
  workspaceId: string;
}

export interface IBusBackendDetailsCommon {}

export interface IBusBackendSSE extends IBusBackendSSECommon {
  containers: string[];
}

export interface IBusInProgressBackendCommon {
  id: string;
  username: string;
  port: number;
  ip: string;
  importError: string;
}

// used when we import a bus
export interface IBusImport {
  port: number;
  ip: string;
  username: string;
  password: string;
  passphrase: string;
}

export interface IBusInProgressBackend extends IBusInProgressBackendCommon {}

export interface IBusBackendDetails extends IBusBackendDetailsCommon {}

interface IImportBusFormSecureParts {
  ip: string;
  port: string;
  username: string;
}

export abstract class BusesService {
  /**
   * the 2 following methods are useful to discard and retry a bus import
   * before discarding, just backup the data
   * then discard
   * and finally navigate to buses-in-progress URL where
   * you can get getImportBusFormSecureParts
   */
  abstract setImportBusFormSecureParts(
    importBusFormSecureParts: IImportBusFormSecureParts
  ): void;
  abstract getImportBusFormSecureParts(): IImportBusFormSecureParts;

  abstract postBus(
    idWorkspace: string,
    bus: IBusImport
  ): Observable<IBusInProgressBackend>;

  abstract deleteBus(
    idWorkspace: string,
    id: string
  ): Observable<{ id: string; reason: string }>;

  abstract getDetailsBus(busId: string): Observable<IBusBackendDetails>;
}

@Injectable()
export class BusesServiceImpl extends BusesService {
  private importBusFormSecureParts: IImportBusFormSecureParts;

  constructor(private http: HttpClient) {
    super();
  }

  setImportBusFormSecureParts(
    importBusFormSecureParts: IImportBusFormSecureParts
  ): void {
    this.importBusFormSecureParts = importBusFormSecureParts;
  }

  getImportBusFormSecureParts(): IImportBusFormSecureParts {
    const importBusFormSecureParts = this.importBusFormSecureParts;

    if (!importBusFormSecureParts) {
      return { ip: '', port: '', username: '' };
    }

    this.importBusFormSecureParts = undefined;

    return importBusFormSecureParts;
  }

  postBus(idWorkspace: string, bus: IBusImport) {
    return this.http.post<IBusInProgressBackend>(
      `${environment.urlBackend}/workspaces/${idWorkspace}/buses`,
      bus
    );
  }

  deleteBus(idWorkspace: string, id: string) {
    return this.http.delete<{ id: string; reason: string }>(
      `${environment.urlBackend}/workspaces/${idWorkspace}/buses/${id}`
    );
  }

  getDetailsBus(busId: string) {
    return this.http.get<IBusBackendDetails>(
      `${environment.urlBackend}/buses/${busId}`
    );
  }
}
