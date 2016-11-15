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
import { Router } from '@angular/router';

// http interceptor
import { Interceptor, InterceptedResponse } from 'ng2-interceptors';

// our services
import { RouteService } from './route.service';

// environments for our app
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpResponseInterceptor implements Interceptor {
  constructor(private router: Router, private routeService: RouteService) { }

  public interceptAfter(interceptedResponse: InterceptedResponse): InterceptedResponse {
    if (interceptedResponse.response.status === 401) {
      if (environment.debug) {
        console.debug('Http response code : 401 - Redirect to /login');
      }

      let url = window.location.pathname;

      // before we redirect to /login, save the asked URL so we can route back the user once he's logged
      this.routeService.urlBeforeRedirectToLogin = (url === '/login' ? null : url);

      this.router.navigate(['/login']);
    }

    else if (interceptedResponse.response.status === 404) {
      if (environment.debug) {
        console.debug('Http response code : 404 - Redirect to /cockpit/404');
      }

      this.router.navigate(['/cockpit/404']);
    }

    // return either the modified response or nothing (it's like returning the original)
    return;
  }
}
