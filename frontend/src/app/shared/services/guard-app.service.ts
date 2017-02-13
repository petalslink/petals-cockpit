/**
 * Copyright (C) 2017 Linagora
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
        if (environment.debug) {
          console.debug(`Guard App : User already logged. Continuing to /workspaces.`);
        }

        return true;
      }).catch((res: Response) => {
        // if not already connected, redirect to login
        if (environment.debug) {
          console.debug(`Guard App : User's not logged. Redirecting to /login.`);
        }

        this._router.navigate(['/login']);

        return Observable.of(false);
      });
  }
}
