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
