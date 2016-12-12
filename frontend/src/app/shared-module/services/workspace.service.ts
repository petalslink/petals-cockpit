/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// http interceptor
import { InterceptorService } from 'ng2-interceptors';

// our environment
import { environment } from '../../../environments/environment';
import { INewBus } from '../interfaces/petals.interface';

@Injectable()
export class WorkspaceService {
  constructor(private http: InterceptorService) {}

  updateWorkspaces(): Observable<Response> {
    return this.http.get(`${environment.urlBackend}/workspaces`);
  }

  updateWorkspace(idWorkspace: string): Observable<Response> {
    return this.http.get(`${environment.urlBackend}/workspaces/${idWorkspace}`);
  }

  addWorkspace(name: string) {
    return this.http.post(`${environment.urlBackend}/workspaces`, {name});
  }

  importBus(idWorkspace: string, newBus: INewBus) {
    return this.http.post(`${environment.urlBackend}/workspaces/${idWorkspace}/buses`, <any>newBus);
  }

  removeBus(idWorkspace: string, idBus: string) {
    return this.http.delete(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${idBus}`);
  }

  getDetailsBus(idWorkspace: string, idBus: string) {
    return this.http.get(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${idBus}`);
  }

  getDetailsContainer(idWorkspace: string, idBus: string, idContainer: string) {
    return this.http.get(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${idBus}/containers/${idContainer}`);
  }

  getDetailsComponent(idWorkspace: string, idBus: string, idContainer: string, idComponent: string) {
    /* tslint:disable:max-line-length */
    return this.http.get(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${idBus}/containers/${idContainer}/components/${idComponent}`);
    /* tslint:enable:max-line-length */
  }

  getDetailsServiceUnit(idWorkspace: string, idBus: string, idContainer: string, idComponent: string, idServiceUnit: string) {
    /* tslint:disable:max-line-length */
    return this.http.get(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${idBus}/containers/${idContainer}/components/${idComponent}/serviceunits/${idServiceUnit}`);
    /* tslint:enable:max-line-length */
  }
}
