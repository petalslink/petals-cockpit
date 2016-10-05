import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(private http: Http) { }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }

  public connectUser(user: IUser) {
    return this.http
                .post('http://serveur.com/api/user/session', user)
                .map(this.extractData);
  }

  // TODO
  public disconnectUser() {
    return this.http
                .post('http://serveur.com/api/user/session/disconnect', {})
                .map(this.extractData);
  }
}
