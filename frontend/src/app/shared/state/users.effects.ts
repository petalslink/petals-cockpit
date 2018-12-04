/**
 * Copyright (C) 2017-2018 Linagora
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

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  flatMap,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { environment } from '@env/environment';
import { toJsTable } from '@shared/helpers/jstable.helper';
import { getErrorMessage } from '@shared/helpers/shared.helper';
import { UsersService } from '@shared/services/users.service';
import { Users } from './users.actions';

@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private router: Router,
    private usersService: UsersService,
    private notification: NotificationsService
  ) {}

  @Effect()
  fetchAll$: Observable<Action> = this.actions$.pipe(
    ofType<Users.FetchAll>(Users.FetchAllType),
    switchMap(() => this.usersService.getAll()),
    map(
      user =>
        new Users.Fetched(
          toJsTable(user.reduce((p, c) => ({ ...p, [c.id]: c }), {}))
        )
    ),
    catchError((err: HttpErrorResponse) => {
      if (environment.debug) {
        console.group();
        console.warn(
          'Error caught in users.effects.ts: ofType(Users.FetchAll)'
        );
        console.error(err);
        console.groupEnd();
      }

      return of(new Users.FetchAllError());
    })
  );

  @Effect()
  fetchLdapUsers$: Observable<Action> = this.actions$.pipe(
    ofType<Users.FetchLdapUsers>(Users.FetchLdapUsersType),
    switchMap(action => this.usersService.getLdapUsers(action.payload)),
    map(ldapSearchList => new Users.FetchedLdapUsers(ldapSearchList)),
    catchError((err: HttpErrorResponse) => {
      if (environment.debug) {
        console.group();
        console.warn(
          'Error caught in users.effects.ts: ofType(Users.FetchLdapUsers)'
        );
        console.error(err);
        console.groupEnd();
      }

      return of(new Users.FetchLdapUsersError());
    })
  );

  @Effect()
  add$: Observable<Action> = this.actions$.pipe(
    ofType<Users.Add>(Users.AddType),
    flatMap(action =>
      this.usersService.add(action.payload).pipe(
        map(
          () =>
            new Users.AddSuccess({
              id: action.payload.username,
              name: action.payload.name,
            })
        ),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in users.effects.ts: ofType(Users.Add)');
            console.error(err);
            console.groupEnd();
          }

          return of(new Users.AddError({ id: action.payload.username }));
        })
      )
    )
  );

  @Effect()
  delete$: Observable<Action> = this.actions$.pipe(
    ofType<Users.Delete>(Users.DeleteType),
    flatMap(action =>
      this.usersService.delete(action.payload.id).pipe(
        map(() => new Users.DeleteSuccess({ id: action.payload.id })),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.Delete)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Users.DeleteError(action.payload));
        })
      )
    )
  );

  @Effect()
  modify$: Observable<Action> = this.actions$.pipe(
    ofType<Users.Modify>(Users.ModifyType),
    flatMap(action =>
      this.usersService.modify(action.payload.id, action.payload.changes).pipe(
        map(() => new Users.ModifySuccess(action.payload)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.Modify)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Users.ModifyError(action.payload));
        })
      )
    )
  );

  @Effect()
  connectUser$: Observable<Action> = this.actions$.pipe(
    ofType<Users.Connect>(Users.ConnectType),
    switchMap(action =>
      this.usersService.connectUser(action.payload.user).pipe(
        map(
          user =>
            new Users.ConnectSuccess({
              user,
              navigate: true,
              previousUrl: action.payload.previousUrl,
            })
        ),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.Connect)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Users.ConnectError());
        })
      )
    )
  );

  @Effect({ dispatch: false })
  connectUserSuccess$: Observable<void> = this.actions$.pipe(
    ofType<Users.ConnectSuccess>(Users.ConnectSuccessType),
    filter(action => action.payload.navigate),
    map((action: Users.ConnectSuccess) => {
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
    })
  );

  @Effect()
  disconnectUser$: Observable<Action> = this.actions$.pipe(
    ofType<Users.Disconnect>(Users.DisconnectType),
    switchMap(() =>
      this.usersService.disconnectUser().pipe(
        map(() => {
          this.router.navigate(['/login']);
          this.notification.remove();
          return new Users.DisconnectSuccess();
        }),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.Disconnect)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Users.DisconnectError());
        })
      )
    )
  );

  @Effect({ dispatch: false })
  disconnectUserSuccess$: Observable<Action> = this.actions$.pipe(
    ofType<Users.DisconnectSuccess>(Users.DisconnectSuccessType),
    tap(() =>
      this.notification.success('Log out !', `You're now disconnected.`)
    )
  );

  @Effect()
  setupUser$: Observable<Action> = this.actions$.pipe(
    ofType<Users.Setup>(Users.SetupType),
    switchMap(action =>
      this.usersService.setupUser(action.payload.value).pipe(
        map(() => {
          const data = action.payload;
          return new Users.SetupSuccess({
            value: {
              token: data.value.token,
              username: data.value.username,
              name: data.value.name,
              password: data.value.password,
            },
            validSetupUser: 'User has been added successfully.',
          });
        }),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in users.effects.ts: ofType(Users.Setup)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(
            new Users.SetupError({ errorSetupUser: getErrorMessage(err) })
          );
        })
      )
    )
  );

  @Effect({ dispatch: false })
  setupUserSuccess$: Observable<void> = this.actions$.pipe(
    ofType<Users.SetupSuccess>(Users.SetupSuccessType),
    map((action: Users.SetupSuccess) => {
      if (action.payload.value) {
        this.router.navigate(['/login']);
      } else {
        this.router.navigate(['/setup']);
      }
    })
  );
}
