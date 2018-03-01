/**
 * Copyright (C) 2017-2018 Linagora
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

import { environment } from 'environments/environment';

export interface IInterfaceBackendSSECommon {
  id: string;
  name: string;
  components: string[];
}

export interface IInterfaceBackendDetailsCommon {}

export interface IInterfaceBackendSSE extends IInterfaceBackendSSECommon {}

export interface IInterfaceBackendDetails
  extends IInterfaceBackendSSE,
    IInterfaceBackendDetailsCommon {}

export abstract class InterfacesService {
  abstract getDetailsInterface(
    interfaceId: string
  ): Observable<IInterfaceBackendDetails>;
}

@Injectable()
export class InterfacesServiceImpl extends InterfacesService {
  constructor(private http: HttpClient) {
    super();
  }

  getDetailsInterface(interfaceId: string) {
    return this.http.get<IInterfaceBackendDetails>(
      `${environment.urlBackend}/interfaces/${interfaceId}`
    );
  }
}
