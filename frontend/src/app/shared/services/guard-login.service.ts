import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { UsersService } from './users.service';
import { environment } from './../../../environments/environment';

@Injectable()
export class GuardLoginService implements CanLoad {
  constructor(private _router: Router, private _userService: UsersService) { }

  canLoad() {
    return this._userService.getUserInformations()
      .map((res: Response) => {
        // if already connected, redirect to the app
        if (res.ok) {
          if (environment.debug) {
            console.debug(`Guard Login : User's already logged. Redirecting to /workspaces.`);
          }

          this._router.navigate(['/workspaces']);
          return false;
        }

        return true;
      });
  }
}
