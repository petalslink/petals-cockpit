import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions, Effect, mergeEffects } from '@ngrx/effects';

import { AppState } from '../app.state';

import { IUser } from '../interfaces/user.interface';

import {
  USR_IS_CONNECTING,
  USR_IS_CONNECTED,
  USR_IS_DISCONNECTING,
  USR_IS_DISCONNECTED,
  USR_CONNECTION_FAILED
} from '../reducers/user.reducer';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class UserService implements OnDestroy {
  // our subscription(s) to @ngrx/effects
  private subscription: Subscription;

  constructor(
    private router: Router,
    private http: Http,
    private actions$: Actions,
    private store$: Store<AppState>
  ) {
    this.subscription = mergeEffects(this).subscribe(store$);
  }

  @Effect({dispatch: true}) usr_connect$ = this.actions$
    .ofType(USR_IS_CONNECTING)
    .switchMap(action => {return this.usrConnect(<IUser>action.payload)})
    .map((res: any) => {
      // TODO : check HTTP header here instead of checking for properties
      if (typeof res.data.username === 'undefined') {
        return { type: USR_CONNECTION_FAILED };
      }

      this.router.navigate(['/petals-cockpit']);
      return { type: USR_IS_CONNECTED };
    });

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private usrConnect(user: IUser) {
    console.log(`trying to connect ""${user.username}"" with password "${user.password}" ...`);

    return Observable.create(observer => {
      setTimeout(() => {
        console.log('connected !');

        observer.next({
          data: {
            'username': 'user1',
            'name': 'John User'
          }
        });
        observer.complete();
      }, 2000);
    });
  }
}
