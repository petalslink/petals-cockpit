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

import { IUser } from './../interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private _http: Http) { }

  public connectUser(user: IUser): Observable<Response> {
    return this._http.post(`${environment.urlBackend}/user/session`, <any>user);
  }

  public disconnectUser(): Observable<Response> {
    return this._http.delete(`${environment.urlBackend}/user/session`);
  }

  public getUserInformations() {
    return this._http.get(`${environment.urlBackend}/user/session`);
  }
}