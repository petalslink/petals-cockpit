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
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { Users } from './../state/users.reducer';
import { UsersService } from './../services/users.service';
import { ICurrentUser } from './../interfaces/user.interface';
import { environment } from './../../../environments/environment';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';

@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private router: Router,
    private usersService: UsersService,
    private notification: NotificationsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) connectUser$: Observable<Action> = this.actions$
    .ofType(Users.CONNECT_USER)
    .switchMap((action: Action) =>
      this.usersService.connectUser(action.payload.user)
        .map((res: Response) => {
          const user = <ICurrentUser>res.json();
          return {
            type: Users.CONNECT_USER_SUCCESS,
            payload: { user, navigate: true, previousUrl: action.payload.previousUrl }
          };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in users.effects.ts: ofType(Users.CONNECT_USER)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({ type: Users.CONNECT_USER_FAILED });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) connectUserSuccess$: Observable<void> = this.actions$
    .ofType(Users.CONNECT_USER_SUCCESS)
    .filter((action: Action) => action.payload.navigate)
    .map((action: Action) => {
      if (action.payload.previousUrl) {
        this.router.navigate([action.payload.previousUrl]);
      } else if (action.payload.user.lastWorkspace) {
        this.router.navigate(['/workspaces', action.payload.user.lastWorkspace]);
      } else {
        this.router.navigate(['/workspaces']);
      }
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) disconnectUser$: Observable<Action> = this.actions$
    .ofType(Users.DISCONNECT_USER)
    .switchMap(() =>
      this.usersService.disconnectUser()
        .map(() => batchActions([
          { type: Users.DISCONNECT_USER_SUCCESS },
          { type: Workspaces.CLOSE_WORKSPACE }
        ]))
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in users.effects.ts: ofType(Users.DISCONNECT_USER)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({ type: Users.DISCONNECT_USER_FAILED });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) disconnectUserSuccess$: any = this.actions$
    .ofType(Users.DISCONNECT_USER_SUCCESS)
    .do(_ => this.router.navigate(['/login']))
    .do(_ => this.notification.success('Log out !', `You're now disconnected.`));
}
