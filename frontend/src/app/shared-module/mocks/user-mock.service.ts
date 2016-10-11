// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs/Observable';

// our interfaces
import { IUser } from '../interfaces/user.interface';

// const to mock response time
const TIMEOUT = 500;

@Injectable()
export class UserMockService {
  constructor() { }

  public connectUser(user: IUser) {
    let response: Response = <Response>{
      ok: true,
      json: function () {
        return JSON.stringify({
          'username': user.username,
          'name': 'Bertrand ESCUDIE'
        });
      }
    };

    return Observable.of(response)
    .delay(TIMEOUT);
  }

  public disconnectUser() {
    let response: Response = <Response>{
      ok: true
    };

    return Observable.of(response)
    .delay(TIMEOUT);
  }
}
