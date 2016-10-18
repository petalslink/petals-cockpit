// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs/Observable';

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { IUser } from '../interfaces/user.interface';

const adminUser = {
  'username': 'admin',
  'name': 'Administrator'
};

@Injectable()
export class UserMockService {
  private userIsConnected: boolean = environment.alreadyConnected;

  constructor() { }

  public connectUser(user: IUser) {
    let response: Response;

    // if user's already logged OR if user's informations are wrong
    if (this.userIsConnected || (user.username !== 'admin' || user.password !== 'admin')) {
      response = <Response>{ ok: false };
    } else {
      this.userIsConnected = true;

      response = <Response>{
        ok: true,
        json: function () {
          return adminUser;
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
        json: function () {
          return adminUser;
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
