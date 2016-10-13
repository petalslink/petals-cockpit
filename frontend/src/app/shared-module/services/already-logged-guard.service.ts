// angular modules
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

// our services
import { UserService } from './user.service';

@Injectable()
export class AlreadyLoggedGuardService implements CanActivate {
  constructor(private user: UserService, private router: Router) { }

  canActivate() {
    return this.user.getUserInformations(true)
      .map((res: Response) => {
        // if already logged
        if (res.ok) {
          this.router.navigate(['/cockpit']);
          return false;
        }

        // when using mocked services, http 401 are not catched
        // so return true as if we were catching the error
        return true;
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        // 401 --> unauthorized
        if (err.status === 401) {
          // user is not logged
          return Observable.of(true);
        }
      });
  }
}
