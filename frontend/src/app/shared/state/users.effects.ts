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

import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { UsersService } from '../services/users.service';

import { environment } from '../../../environments/environment';

import { Users } from 'app/shared/state/users.actions';

@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private router: Router,
    private usersService: UsersService,
    private notification: NotificationsService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  connectUser$: Observable<Action> = this.actions$
    .ofType(Users.ConnectType)
    .switchMap((action: Users.Connect) =>
      this.usersService
        .connectUser(action.payload.user)
        .map(
          user =>
            new Users.ConnectSuccess({
              user,
              navigate: true,
              previousUrl: action.payload.previousUrl,
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.ConnectType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Users.ConnectError());
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false })
  connectUserSuccess$: Observable<void> = this.actions$
    .ofType(Users.ConnectSuccessType)
    .filter((action: Users.ConnectSuccess) => action.payload.navigate)
    .map((action: Users.ConnectSuccess) => {
      if (action.payload.previousUrl) {
        this.router.navigate([action.payload.previousUrl]);
      } else if (action.payload.user.lastWorkspace) {
        this.router.navigate([
          '/workspaces',
          action.payload.user.lastWorkspace,
        ]);
      } else {
        this.router.navigate(['/workspaces']);
      }
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  disconnectUser$: Observable<Action> = this.actions$
    .ofType(Users.DisconnectType)
    .switchMap(() =>
      this.usersService
        .disconnectUser()
        .map(() => {
          this.router.navigate(['/login']);
          this.notification.remove();
          return new Users.DisconnectSuccess();
        })
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.DisconnectType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Users.DisconnectError());
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false })
  disconnectUserSuccess$: Observable<Action> = this.actions$
    .ofType(Users.DisconnectSuccessType)
    .do(() =>
      this.notification.success('Log out !', `You're now disconnected.`)
    );
}
