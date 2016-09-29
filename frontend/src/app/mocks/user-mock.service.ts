import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UserMockService {
  constructor() { }

  public connectUser(user: IUser) {
    console.log(`trying to connect user "${user.username}" with password "${user.password}" ...`);

    return Observable.create(observer => {
      setTimeout(() => {
        console.log('connected !');

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
