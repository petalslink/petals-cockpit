import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IUser } from './../interfaces/user.interface';
import { environment } from './../../../environments/environment';

@Injectable()
export class UsersMockService {
  constructor() { }

  public connectUser(user: IUser): Observable<Response> {
    let response: Response;

    if (user.username === 'admin' && user.password === 'admin') {
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

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
