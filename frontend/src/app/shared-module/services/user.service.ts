import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { IUser } from '../interfaces/user.interface';
import { Observable } from 'rxjs/Observable';

// environments for our app
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {
  constructor(private http: Http) { }

  public connectUser(user: IUser): Observable<Response> {
    return this.http
      .post(`${environment.urlBackend}/user/session`, user);
  }

  public disconnectUser(): Observable<Response> {
    return this.http
      .delete(`${environment.urlBackend}/user/session`, {});
  }
}
