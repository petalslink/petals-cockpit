// angular modules
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// http interceptor
import { Interceptor, InterceptedResponse } from 'ng2-interceptors';

// environments for our app
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpResponseInterceptor implements Interceptor {
  constructor(private router: Router) { }

  public interceptAfter(interceptedResponse: InterceptedResponse): InterceptedResponse {
    if (interceptedResponse.response.status === 401) {
      if (environment.debug) {
        console.debug('Http response code : 401 - Redirect to /login');
      }

      this.router.navigate(['/login']);
    };

    // return either the modified response or nothing (it's like returning the original)
    return;
  }
}
