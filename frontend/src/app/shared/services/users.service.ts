import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from './../../../environments/environment';

import { IUser } from './../interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private _http: Http) { }

  public connectUser(user: IUser): Observable<Response> {
    return this._http.post(`${environment.urlBackend}/user/session`, <any>user);
  }

  public disconnectUser(): Observable<Response> {
    return this._http.delete(`${environment.urlBackend}/user/session`);
  }
}
