import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { UsersService } from './users.service';
import { environment } from './../../../environments/environment';

@Injectable()
export class GuardAppService implements CanLoad {
  constructor(private _router: Router, private _userService: UsersService) { }

  canLoad() {
    return this._userService.getUserInformations()
      .map((res: Response) => {
        // if not already connected, redirect to login
        if (!res.ok) {
          if (environment.debug) {
            console.debug(`Guard App : User's not logged. Redirecting to /login.`);
          }

          this._router.navigate(['/login']);
          return false;
        }

        return true;
      });
  }
}
