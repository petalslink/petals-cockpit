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

export abstract class BusesService {
  abstract postBus(idWorkspace: string, bus: IBusImport): Observable<Response>;

  abstract deleteBus(idWorkspace: string, id: string): Observable<Response>;

  abstract getDetailsBus(busId: string): Observable<Response>;
}

@Injectable()
export class BusesServiceImpl extends BusesService {
  constructor(private http: Http) {
    super();
  }

  postBus(idWorkspace: string, bus: IBusImport) {
    return this.http.post(
      `${environment.urlBackend}/workspaces/${idWorkspace}/buses`,
      bus
    );
  }

  deleteBus(idWorkspace: string, id: string) {
    return this.http.delete(
      `${environment.urlBackend}/workspaces/${idWorkspace}/buses/${id}`
    );
  }

  getDetailsBus(busId: string) {
    return this.http.get(`${environment.urlBackend}/buses/${busId}`);
  }
}
