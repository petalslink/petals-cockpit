/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// angular modules
import { Injectable } from '@angular/core';
import { Response, Http } from '@angular/http';

// http interceptor
import { InterceptorService } from 'ng2-interceptors';

// rxjs
import { Observable } from 'rxjs/Observable';

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UserService {

  constructor(private httpAngular: Http, private http: InterceptorService) { }

  // this is only for mock
  public setLastWorkspace(lastWorkspace: string) { }

  public connectUser(user: IUser): Observable<Response> {
    return this.http.post(`${environment.urlBackend}/user/session`, <any>user);
  }

  public disconnectUser(): Observable<Response> {
    return this.http.delete(`${environment.urlBackend}/user/session`, {});
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

    return httpService.get(`${environment.urlBackend}/user/session`);
  }
}
