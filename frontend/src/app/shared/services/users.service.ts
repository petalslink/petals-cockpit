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

export interface IUserBackendCommon {
  // from server
  id: string;
  name: string;
}

export interface IUserBackend extends IUserBackendCommon {
  // from server (actually only present for current user)
  lastWorkspace: string;
}

export interface IUserLogin {
  username: string;
  password: string;
}

export interface IUserSetup extends IUserLogin {
  token: string;
  name: string;
}

export abstract class UsersService {
  abstract connectUser(user: IUserLogin): Observable<Response>;

  abstract disconnectUser(): Observable<Response>;

  abstract getUserInformations(): Observable<Response>;

  abstract setupUser(value: IUserSetup): Observable<Response>;
}

@Injectable()
export class UsersServiceImpl extends UsersService {
  constructor(private http: Http) {
    super();
  }

  connectUser(user: IUserLogin) {
    return this.http.post(`${environment.urlBackend}/user/session`, <any>user);
  }

  disconnectUser() {
    return this.http.delete(`${environment.urlBackend}/user/session`);
  }

  getUserInformations() {
    return this.http.get(`${environment.urlBackend}/user/session`);
  }

  setupUser(value: IUserSetup) {
    return this.http.post(`${environment.urlBackend}/setup`, value);
  }
}
