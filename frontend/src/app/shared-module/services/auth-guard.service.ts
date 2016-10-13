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
export class AuthGuardService implements CanActivate {
  constructor(private user: UserService, private router: Router) { }

  canActivate() {
    return this.user.getUserInformations(true)
      .map((res: Response) => {
        if (res.ok) {
          return true;
        }

        throw new Error(`Not connected, can't access to protected routes`);
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        this.router.navigate(['/login']);
        return Observable.of(false);
      });
  }

}
