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
import { CanLoad } from '@angular/router';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { UsersService } from './users.service';
import { environment } from './../../../environments/environment';
import { IStore } from './../interfaces/store.interface';
import { Users } from './../state/users.reducer';
import { ICurrentUser } from './../interfaces/user.interface';

@Injectable()
export class GuardLoginService implements CanLoad {
  constructor(private userService: UsersService, private store$: Store<IStore>) { }

  canLoad() {
    return this.store$
      .select(state => state.users.connectedUserId)
      .first()
      .switchMap(userId => {
        if (userId) {
          // if we are already logged, let's not do the whole request again
          // see https://github.com/angular/angular/issues/14475
          return Observable.of(false);
        } else {
          return this.userService.getUserInformations()
            .map((res: Response) => {
              // if already connected, redirect to the app
              if (environment.debug) {
                console.debug(`Guard Login : User already logged. Redirecting to /workspaces.`);
              }

              // this will redirect the user to /workspaces (from the effect catching it)
              this.store$.dispatch({
                type: Users.CONNECT_USER_SUCCESS,
                payload: { user: <ICurrentUser>res.json(), redirectWorkspace: true }
              });

              return false;
            }).catch(_ => {
              if (environment.debug) {
                console.debug(`Guard Login : User not logged. Continuing to /login.`);
              }

              return Observable.of(true);
            });
        }
      });
  }
}
