// angular modules
import { Injectable } from '@angular/core';
import { Response, Http } from '@angular/http';

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
  constructor(private httpAngular: Http, private http: InterceptorService) { }

  public connectUser(user: IUser): Observable<Response> {
    return this.http
      .post(`${environment.urlBackend}/user/session`, <any>user);
  }

  public disconnectUser(): Observable<Response> {
    return this.http
      .delete(`${environment.urlBackend}/user/session`, {});
  }

  // this method can be used by guards when we start the application
  // to check wether the user is logged or not
  // when we use this method from guard, we should use the real HTTP service
  // because otherwise it ends up in a loop, redirecting to /login and trying to test
  // if we can access this route but we have a 401 so we get redirected again and again
  // pass true as angularHttpService parameter to use the real angular http service FROM THE GUARD ONLY
  // otherwise to get getUserInformations just call the function without passing any argument
  public getUserInformations(angularHttpService = false) {
    let httpService: Http;

    httpService = this.http;

    if (angularHttpService) {
       httpService = this.httpAngular;
    }

    return httpService
      .get(`${environment.urlBackend}/user/session`);
  }
}
