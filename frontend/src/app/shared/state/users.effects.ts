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
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';

import { Users } from 'app/shared/state/users.actions';
import { environment } from '../../../environments/environment';
import { IUserBackend, UsersService } from '../services/users.service';

import { toJsTable } from 'app/shared/helpers/jstable.helper';

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
  fetchAll$: Observable<Action> = this.actions$
    .ofType(Users.FetchAllType)
    .switchMap((action: Users.FetchAll) =>
      this.usersService
        .getAll()
        .map(
          user =>
            new Users.Fetched(
              toJsTable<IUserBackend>(
                user.reduce((p, c) => ({ ...p, [c.id]: c }), {})
              )
            )
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.FetchAllType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Users.FetchAllError());
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  add$: Observable<Action> = this.actions$
    .ofType(Users.AddType)
    .flatMap((action: Users.Add) =>
      this.usersService
        .add(action.payload)
        .map(
          () =>
            new Users.AddSuccess({
              id: action.payload.username,
              name: action.payload.name,
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.AddType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Users.AddError({ id: action.payload.username })
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  delete$: Observable<Action> = this.actions$
    .ofType(Users.DeleteType)
    .flatMap((action: Users.Delete) =>
      this.usersService
        .delete(action.payload.id)
        .map(() => new Users.DeleteSuccess({ id: action.payload.id }))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.DeleteType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Users.DeleteError(action.payload));
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  modify$: Observable<Action> = this.actions$
    .ofType(Users.ModifyType)
    .flatMap((action: Users.Modify) =>
      this.usersService
        .modify(action.payload.id, action.payload.changes)
        .map(() => new Users.ModifySuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.ModifyType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Users.ModifyError(action.payload));
        })
    );

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
