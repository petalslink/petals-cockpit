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
    };

    // return either the modified response or nothing (it's like returning the original)
    return;
  }
}
