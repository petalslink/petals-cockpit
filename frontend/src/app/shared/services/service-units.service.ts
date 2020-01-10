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

export interface IServiceUnitBackendSSECommon {
  id: string;
  name: string;
  containerId: string;
  componentId: string;
  serviceAssemblyId: string;
}

export interface IServiceUnitBackendDetailsCommon {}

export interface IServiceUnitBackendSSE extends IServiceUnitBackendSSECommon {}

export interface IServiceUnitBackendDetails
  extends IServiceUnitBackendDetailsCommon {}

export abstract class ServiceUnitsService {
  abstract getDetailsServiceUnit(
    serviceUnitId: string
  ): Observable<IServiceUnitBackendDetails>;
}

@Injectable()
export class ServiceUnitsServiceImpl extends ServiceUnitsService {
  constructor(private http: HttpClient) {
    super();
  }

  getDetailsServiceUnit(serviceUnitId: string) {
    return this.http.get<IServiceUnitBackendDetails>(
      `${environment.urlBackend}/serviceunits/${serviceUnitId}`
    );
  }
}
