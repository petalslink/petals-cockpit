import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { batchActions } from 'redux-batched-actions';
import { NotificationsService } from 'angular2-notifications';

import { IStore } from './../interfaces/store.interface';
import { Users } from './../state/users.reducer';
import { UsersService } from './../services/users.service';
import { IUser } from './../interfaces/user.interface';
import { environment } from './../../../environments/environment';

@Injectable()
export class UsersEffects {
  private _notifIds = new Map<string, string>();

  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _router: Router,
    private _usersService: UsersService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) connectUser$: Observable<Action> = this._actions$
    .ofType(Users.CONNECT_USER)
    .switchMap((action: Action) =>
      this._usersService.connectUser(action.payload)
        .map((res: Response) => {
          if (!res.ok) {
            throw new Error('Error while connecting user');
          }

          return {
            type: Users.CONNECT_USER_SUCCESS,
            payload: <IUser>res.json()
          };
        })
        .catch((err) => {
          if (environment.debug) {
            console.warn('Error catched in users.effects.ts : ofType(Users.CONNECT_USER)');
            console.error(err);
          }

          return Observable.of({ type: Users.CONNECT_USER_FAILED });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) connectUserSuccess$: Observable<void> = this._actions$
    .ofType(Users.CONNECT_USER_SUCCESS)
    .map((action: Action) => {
      this._router.navigate(['/workspaces']);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) disconnectUser$: Observable<Action> = this._actions$
    .ofType(Users.DISCONNECT_USER)
    .switchMap((action: Action) =>
      this._usersService.disconnectUser()
        .map((res: Response) => {
          if (!res.ok) {
            throw new Error('Error while disconnecting user');
          }

          return { type: Users.DISCONNECT_USER_SUCCESS };
        })
        .catch((err) => {
          if (environment.debug) {
            console.warn('Error catched in users.effects.ts : ofType(Users.DISCONNECT_USER)');
            console.error(err);
          }

          return Observable.of({ type: Users.DISCONNECT_USER_FAILED });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) disconnectUserSuccess$: any = this._actions$
    .ofType(Users.DISCONNECT_USER_SUCCESS)
    .map(() => this._router.navigate(['/login']));
}
