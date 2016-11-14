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
import { Observable } from 'rxjs/Observable';

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UserMockService {
  private userIsConnected: boolean = environment.alreadyConnected;
  public adminUser;

  constructor() {
    this.adminUser = {
      username: 'admin',
      name: 'Administrator',
      lastWorkspace: null
    };
  }

  public connectUser(user: IUser) {
    let response: Response;

    // if user's already logged OR if user's information are wrong
    if (this.userIsConnected || (user.username !== 'admin' || user.password !== 'admin')) {
      response = <Response>{ ok: false };
    } else {
      this.userIsConnected = true;

      response = <Response>{
        ok: true,
        json: () => {
          return this.adminUser;
        }
      };
    }

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  public disconnectUser() {
    this.userIsConnected = false;

    let response: Response = <Response>{
      ok: true
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }

  public getUserInformations() {
    let response: Response;

    if (this.userIsConnected) {
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
