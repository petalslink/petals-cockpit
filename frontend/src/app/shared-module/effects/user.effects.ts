/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs/Observable';

// store
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { IUser } from '../interfaces/user.interface';

// our services
import { UserService } from '../services/user.service';
import { RouteService } from './../services/route.service';

// our actions
import { UserActions } from '../reducers/user.actions';

@Injectable()
export class UserEffects {
  constructor(
    private router: Router,
    private actions$: Actions,
    private userService: UserService,
    private routeService: RouteService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) usrConnect$: Observable<Action> = this.actions$
    .ofType(UserActions.USR_IS_CONNECTING)
    .switchMap((action: Action) => this.userService.connectUser(action.payload)
      .map((res: any) => {
        if (!res.ok) {
          throw new Error('Error while connecting user');
        }

        let user: IUser = res.json();

        if (this.routeService.urlBeforeRedirectToLogin) {
          if (environment.debug) {
            console.debug(
              `Redirecting to the URL "${this.routeService.urlBeforeRedirectToLogin}" which was asked before being redirected to /login`
            );
          }

          this.router.navigate([this.routeService.urlBeforeRedirectToLogin]);
        }

        else if (user.lastWorkspace) {
          this.router.navigate([`/cockpit/workspaces/${user.lastWorkspace}`]);
        }

        else {
          this.router.navigate(['/cockpit']);
        }

        return { type: UserActions.USR_IS_CONNECTED, payload: user };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: UserActions.USR_CONNECTION_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) usrDisconnect$: Observable<Action> = this.actions$
    .ofType(UserActions.USR_IS_DISCONNECTING)
    .switchMap(() => this.userService.disconnectUser()
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while disconnecting user');
        }

        return { type: UserActions.USR_IS_DISCONNECTED };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: UserActions.USR_DISCONNECTION_FAILED });
      })
    );

  @Effect({dispatch: false}) usrDisconnected$: Observable<void> = this.actions$
    .ofType(UserActions.USR_IS_DISCONNECTED)
    .map(() => {
        this.router.navigate(['/login']);
    });
}
