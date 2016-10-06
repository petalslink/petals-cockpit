// angular modules
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';

// rxjs
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

// store
import { Store } from '@ngrx/store';
import { Actions, Effect, mergeEffects } from '@ngrx/effects';

// our environment
import {environment} from '../../../environments/environment';

// our states
import { AppState } from '../../app.state';

// our services
import { UserService } from '../services/user.service';

// our actions
import {
  USR_IS_CONNECTING,
  USR_IS_CONNECTED,
  USR_CONNECTION_FAILED,
  USR_IS_DISCONNECTING,
  USR_IS_DISCONNECTED,
  USR_DISCONNECTION_FAILED
} from '../reducers/user.reducer';

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
    .switchMap(action => this.userService.connectUser(action.payload)
      .map((res: any) => {
        this.router.navigate(['/cockpit']);
        return { type: USR_IS_CONNECTED, payload: res };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: USR_CONNECTION_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) usr_disconnect$: Observable<{ type: string }> = this.actions$
    .ofType(USR_IS_DISCONNECTING)
    .switchMap(() => this.userService.disconnectUser()
      .map((res: Response) => {
        if (res.status === 204) {
          this.router.navigate(['/login']);
          // TODO : clear user data once disconnected !
          return { type: USR_IS_DISCONNECTED };
        }

        Observable.throw(new Error('Error while disconnecting user'));
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: USR_DISCONNECTION_FAILED });
      })
    );
}
