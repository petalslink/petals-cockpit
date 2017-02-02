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

import { IUser } from './../interfaces/user.interface';
import { environment } from './../../../environments/environment';

@Injectable()
export class UsersMockService {
  private _userIsConnected: boolean = environment.alreadyConnected;
  private adminUser: IUser;

  constructor() {
    this.adminUser = {
      id: 'admin',
      name: 'Bertrand ESCUDIE',
      username: 'admin',
      lastWorkspace: '',
      password: ''
    };
  }

  public connectUser(user: IUser): Observable<Response> {
    let response: Response;

    if (user.username === 'admin' && user.password === 'admin') {
      this._userIsConnected = true;

      response = <Response>{
        ok: true,
        json: () => {
          return user;
        }
      };
    } else {
      response = <Response>{ ok: false };
    }

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  public disconnectUser(): Observable<Response> {
    const response = <Response>{ ok: true };
    this._userIsConnected = false;

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  public getUserInformations() {
    let response: Response;

    if (this._userIsConnected) {
      response = <Response>{
        ok: true,
        json: () => {
          return this.adminUser;
        }
      };
    } else {
      response = <Response>{ ok: false };
    }
    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
