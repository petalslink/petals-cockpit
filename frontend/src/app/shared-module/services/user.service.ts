// angular modules
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

// http interceptor
import { InterceptorService } from 'ng2-interceptors';

// rxjs
import { Observable } from 'rxjs/Observable';

// our interfaces
import { IUser } from '../interfaces/user.interface';

// environments for our app
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {
  constructor(private http: InterceptorService) { }

  public connectUser(user: IUser): Observable<Response> {
    return this.http
      .post(`${environment.urlBackend}/user/session`, <any>user);
  }

  public disconnectUser(): Observable<Response> {
    return this.http
      .delete(`${environment.urlBackend}/user/session`, {});
  }

  public getUserInformations() {
    return this.http
      .get(`${environment.urlBackend}/user/session`);
  }
}
