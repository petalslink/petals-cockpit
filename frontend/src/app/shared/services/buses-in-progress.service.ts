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

import { IBusInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { environment } from './../../../environments/environment';

export abstract class BusesInProgressService {
  abstract postBus(idWorkspace: string, bus: IBusInProgress): Observable<Response>;

  abstract deleteBus(idWorkspace: string, id: string): Observable<Response>;
}

@Injectable()
export class BusesInProgressServiceImpl extends BusesInProgressService {
  constructor(private _http: Http) {
    super();
  }

  postBus(idWorkspace: string, bus: IBusInProgress) {
    return this._http.post(`${environment.urlBackend}/workspaces/${idWorkspace}/buses`, bus);
  }

  deleteBus(idWorkspace: string, id: string) {
    return this._http.delete(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${id}`);
  }
}
