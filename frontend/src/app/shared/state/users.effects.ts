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
import { Actions, Effect } from '@ngrx/effects';
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
  fetchAll$: Observable<Action> = this.actions$
    .ofType<Users.FetchAll>(Users.FetchAllType)
    .pipe(
      switchMap(action => this.usersService.getAll()),
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
  fetchLdapUsers$: Observable<Action> = this.actions$
    .ofType<Users.FetchLdapUsers>(Users.FetchLdapUsersType)
    .pipe(
      switchMap(action => this.usersService.getLdapUsers(action.payload)),
      map(ldapSearchList => new Users.FetchedLdapUsers(ldapSearchList)),
      catchError((err: HttpErrorResponse) => {
        if (environment.debug) {
          console.group();
          console.warn('FetchLdapUsers');
          console.error(err);
          console.groupEnd();
        }

        return of(new Users.FetchLdapUsersError());
      })
    );

  @Effect()
  add$: Observable<Action> = this.actions$
    .ofType<Users.Add>(Users.AddType)
    .pipe(
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
              console.warn(
                'Error caught in users.effects.ts: ofType(Users.Add)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new Users.AddError({ id: action.payload.username }));
          })
        )
      )
    );

  @Effect()
  delete$: Observable<Action> = this.actions$
    .ofType<Users.Delete>(Users.DeleteType)
    .pipe(
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
  modify$: Observable<Action> = this.actions$
    .ofType<Users.Modify>(Users.ModifyType)
    .pipe(
      flatMap(action =>
        this.usersService
          .modify(action.payload.id, action.payload.changes)
          .pipe(
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
  connectUser$: Observable<Action> = this.actions$
    .ofType<Users.Connect>(Users.ConnectType)
    .pipe(
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
  connectUserSuccess$: Observable<void> = this.actions$
    .ofType<Users.ConnectSuccess>(Users.ConnectSuccessType)
    .pipe(
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
  disconnectUser$: Observable<Action> = this.actions$
    .ofType<Users.Disconnect>(Users.DisconnectType)
    .pipe(
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
  disconnectUserSuccess$: Observable<Action> = this.actions$
    .ofType<Users.DisconnectSuccess>(Users.DisconnectSuccessType)
    .pipe(
      tap(() =>
        this.notification.success('Log out !', `You're now disconnected.`)
      )
    );
}
