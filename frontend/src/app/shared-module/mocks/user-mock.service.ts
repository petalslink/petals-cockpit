import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IUser } from '../interfaces/user.interface';

const TIMEOUT = 400;

@Injectable()
export class UserMockService {
  constructor() { }

  public connectUser(user: IUser) {
    return Observable.of({
      data: {
        'username': user.username,
        'name': 'Bertrand ESCUDIE'
      }
    })
    .delay(TIMEOUT);
  }

  public disconnectUser() {
    return Observable.of({
      status: 204
    })
    .delay(TIMEOUT);
  }
}
