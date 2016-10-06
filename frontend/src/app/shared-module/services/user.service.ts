import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { IUser } from '../interfaces/user.interface';

// environments for our app
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {
  constructor(private http: Http) { }

  public connectUser(user: IUser) {
    return this.http
      .post(`${environment.urlBackend}/user/session`, user);
  }

  public disconnectUser() {
    return this.http
      .delete(`${environment.urlBackend}/user/session`, {});
  }
}
