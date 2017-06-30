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

export interface IUserBackend {
  id: string;
  name: string;
}

export interface ICurrentUserBackend extends IUserBackend {
  lastWorkspace: string;
  isAdmin: boolean;
}

export interface IUserLogin {
  username: string;
  password: string;
}

export interface IUserNew extends IUserLogin {
  name: string;
}

export interface IUserSetup extends IUserNew {
  token: string;
}

export abstract class UsersService {
  abstract connectUser(user: IUserLogin): Observable<ICurrentUserBackend>;

  abstract disconnectUser(): Observable<Response>;

  abstract getCurrentUserInformations(): Observable<ICurrentUserBackend>;

  abstract setupUser(value: IUserSetup): Observable<Response>;

  abstract getAll(): Observable<IUserBackend[]>;

  abstract getOne(id: string): Observable<IUserBackend>;

  abstract add(user: IUserNew): Observable<Response>;

  abstract delete(id: string): Observable<Response>;

  abstract modify(
    id: string,
    props: { name?: string; password?: string }
  ): Observable<Response>;
}

@Injectable()
export class UsersServiceImpl extends UsersService {
  constructor(private http: Http) {
    super();
  }

  connectUser(user: IUserLogin) {
    return this.http
      .post(`${environment.urlBackend}/user/session`, user)
      .map(res => res.json() as ICurrentUserBackend);
  }

  disconnectUser() {
    return this.http.delete(`${environment.urlBackend}/user/session`);
  }

  getCurrentUserInformations() {
    return this.http
      .get(`${environment.urlBackend}/user/session`)
      .map(res => res.json() as ICurrentUserBackend);
  }

  setupUser(value: IUserSetup) {
    return this.http.post(`${environment.urlBackend}/setup`, value);
  }

  getAll() {
    return this.http
      .get(`${environment.urlBackend}/users`)
      .map(res => res.json() as IUserBackend[]);
  }

  getOne(id: string) {
    return this.http
      .get(`${environment.urlBackend}/users/${id}`)
      .map(res => res.json() as IUserBackend);
  }

  add(user: IUserNew) {
    return this.http.post(`${environment.urlBackend}/users/`, user);
  }

  delete(id: string) {
    return this.http.delete(`${environment.urlBackend}/users/${id}`);
  }

  modify(id: string, props: { name?: string; password?: string }) {
    return this.http.put(`${environment.urlBackend}/users/${id}`, props);
  }
}
