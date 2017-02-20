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
import { Store } from '@ngrx/store';

import { UsersService } from './users.service';
import { environment } from './../../../environments/environment';
import { IStore } from './../interfaces/store.interface';
import { Users } from './../state/users.reducer';
import { IUser } from './../interfaces/user.interface';

@Injectable()
export class GuardLoginService implements CanLoad {
  constructor(private _router: Router, private _userService: UsersService, private _store$: Store<IStore>) { }

  canLoad() {
    return this._userService.getUserInformations()
      .map((res: Response) => {
        // if already connected, redirect to the app
        if (environment.debug) {
          console.debug(`Guard Login : User already logged. Redirecting to /workspaces.`);
        }

        // this will redirect the user to /workspaces (from the effect catching it)
        this._store$.dispatch({ type: Users.CONNECT_USER_SUCCESS, payload: { user: <IUser>res.json(), redirectWorkspace: true } });

        return false;
      }).catch((res: Response) => {
        if (environment.debug) {
          console.debug(`Guard Login : User not logged. Continuing to /login.`);
        }

        return Observable.of(true);
      });
  }
}
