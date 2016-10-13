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
    return this.user.getUserInformations()
      .map((res: Response) => {
        // if already logged
        if (!res.ok) {
          return true;
        }

        throw new Error(`Already connected, can't access login page again`);
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        this.router.navigate(['/cockpit']);
        return Observable.of(true);
      });
  }
}
