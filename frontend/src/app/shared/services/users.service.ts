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
import { mapTo } from 'rxjs/operators';

import { environment } from '@env/environment';
import { IWorkspaceUserPermissionsBackend } from '@shared/services/workspaces.service';
import { IUserLDAP } from '@shared/state/users.interface';

export interface IUserBackend {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface ICurrentUserBackend extends IUserBackend {
  lastWorkspace: string;
  isAdmin: boolean;
  isFromLdap: boolean;
  workspacePermissions?: IWorkspaceUserPermissionsBackend;
}

export interface IUserLogin {
  username: string;
  password: string;
}

export interface IUserNew extends IUserLogin {
  name: string;
  isAdmin: boolean;
}

export interface IUserSetup extends IUserNew {
  token: string;
}

export abstract class UsersService {
  abstract connectUser(user: IUserLogin): Observable<ICurrentUserBackend>;

  abstract disconnectUser(): Observable<void>;

  abstract getCurrentUserInformations(): Observable<ICurrentUserBackend>;

  abstract setupUser(value: IUserSetup): Observable<void>;

  abstract getLdapUsers(search: string): Observable<IUserLDAP[]>;

  abstract getAll(): Observable<IUserBackend[]>;

  abstract getOne(id: string): Observable<IUserBackend>;

  abstract add(user: IUserNew): Observable<void>;

  abstract delete(id: string): Observable<void>;

  abstract modify(
    id: string,
    props: { name?: string; password?: string; isAdmin?: boolean }
  ): Observable<void>;
}

@Injectable()
export class UsersServiceImpl extends UsersService {
  constructor(private http: HttpClient) {
    super();
  }

  connectUser(user: IUserLogin) {
    return this.http.post<ICurrentUserBackend>(
      `${environment.urlBackend}/user/session`,
      user
    );
  }

  disconnectUser() {
    // the backend returns an empty text response with a 200 status code and not a json response or a 204 for logout!
    // Note that even if it did, it wouldn't work currently because of https://github.com/angular/angular/issues/19413
    return this.http
      .delete(`${environment.urlBackend}/user/session`, {
        responseType: 'text',
      })
      .pipe(mapTo(undefined));
  }

  getCurrentUserInformations() {
    return this.http.get<ICurrentUserBackend>(
      `${environment.urlBackend}/user/session`
    );
  }

  setupUser(value: IUserSetup) {
    return this.http.post<void>(`${environment.urlBackend}/setup`, value);
  }

  getLdapUsers(search: string) {
    return this.http.get<IUserLDAP[]>(
      `${environment.urlBackend}/ldap/users?name=${search}`
    );
  }

  getAll() {
    return this.http.get<IUserBackend[]>(`${environment.urlBackend}/users`);
  }

  getOne(id: string) {
    return this.http.get<IUserBackend>(`${environment.urlBackend}/users/${id}`);
  }

  add(user: IUserNew) {
    return this.http.post<void>(`${environment.urlBackend}/users/`, user);
  }

  delete(id: string) {
    return this.http.delete<void>(`${environment.urlBackend}/users/${id}`);
  }

  modify(
    id: string,
    props: { name?: string; password?: string; isAdmin?: boolean }
  ) {
    return this.http.put<void>(`${environment.urlBackend}/users/${id}`, props);
  }
}
