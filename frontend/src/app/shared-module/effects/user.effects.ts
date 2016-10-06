import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions, Effect, mergeEffects } from '@ngrx/effects';

import { AppState } from '../../app.state';

import { UserService } from '../services/user.service';

import {
  USR_IS_CONNECTING,
  USR_IS_CONNECTED,
  USR_CONNECTION_FAILED,
  USR_IS_DISCONNECTING,
  USR_IS_DISCONNECTED
} from '../reducers/user.reducer';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class UserEffects implements OnDestroy {
  // our subscription(s) to @ngrx/effects
  private subscription: Subscription;

  constructor(
    private router: Router,
    private http: Http,
    private actions$: Actions,
    private store$: Store<AppState>,
    private userService: UserService
  ) {
    this.subscription = mergeEffects(this).subscribe(store$);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) usr_connect$: Observable<{ type: string }> = this.actions$
    .ofType(USR_IS_CONNECTING)
    .switchMap(action => this.userService.connectUser(action.payload))
    .map((res: any) => {
      // TODO : check HTTP header here instead of checking for properties
      if (typeof res.data.username === 'undefined') {
        return { type: USR_CONNECTION_FAILED };
      }

      this.router.navigate(['/cockpit']);
      return { type: USR_IS_CONNECTED };
    });

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) usr_disconnect$: Observable<{ type: string }> = this.actions$
    .ofType(USR_IS_DISCONNECTING)
    .switchMap(() => this.userService.disconnectUser())
    .map((res: any) => {
      // TODO : check HTTP header here and check there's no errors
      // otherwise, create a new action type to handle this error
      this.router.navigate(['/login']);
      return { type: USR_IS_DISCONNECTED };
    });
}
