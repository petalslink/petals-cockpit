import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UserMockService {
  constructor() { }

  public connectUser(user: IUser) {
    return Observable.create(observer => {
      setTimeout(() => {
        observer.next({
          data: {
            'username': 'user1',
            'name': 'John User'
          }
        });
        observer.complete();
      }, 2000);
    });
  }
}
