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
import {
  USR_IS_CONNECTING,
  USR_IS_CONNECTED,
  USR_CONNECTION_FAILED,
  USR_IS_DISCONNECTING,
  USR_IS_DISCONNECTED,
  USR_DISCONNECTION_FAILED
} from '../reducers/user.reducer';

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
    .ofType(USR_IS_CONNECTING)
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

        else {
          this.router.navigate(['/cockpit']);
        }

        return { type: USR_IS_CONNECTED, payload: user };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: USR_CONNECTION_FAILED });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({dispatch: true}) usrDisconnect$: Observable<Action> = this.actions$
    .ofType(USR_IS_DISCONNECTING)
    .switchMap(() => this.userService.disconnectUser()
      .map((res: Response) => {
        if (!res.ok) {
          throw new Error('Error while disconnecting user');
        }

        this.router.navigate(['/login']);

        // TODO : clear user data once disconnected !
        return { type: USR_IS_DISCONNECTED };
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        return Observable.of({ type: USR_DISCONNECTION_FAILED });
      })
    );
}
