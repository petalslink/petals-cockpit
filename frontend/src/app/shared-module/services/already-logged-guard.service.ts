// angular modules
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Response } from '@angular/http';

// ngrx
import { Store } from '@ngrx/store';

// rxjs
import { Observable } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

// our services
import { UserService } from './user.service';

// our states
import { AppState } from '../../app.state';

// our actions
import { USR_IS_CONNECTED } from '../reducers/user.reducer';

// our interfaces
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class AlreadyLoggedGuardService implements CanActivate {
  constructor(private store: Store<AppState>, private user: UserService, private router: Router) { }

  canActivate() {
    return this.user.getUserInformations(true)
      .map((res: Response) => {
        // if already logged
        if (res.ok) {
          let user: IUser = res.json();

          this.store.dispatch({ type: USR_IS_CONNECTED, payload: user });

          this.router.navigate(['/cockpit']);
          return false;
        }

        // when using mocked services, http 401 are not catched
        // so return true as if we were catching the error
        return true;
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        // 401 --> unauthorized
        if (err.status === 401) {
          // user is not logged
          return Observable.of(true);
        }
      });
  }
}
