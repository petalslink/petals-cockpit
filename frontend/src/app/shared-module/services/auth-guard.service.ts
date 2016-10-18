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

// our interfaces
import { IUser } from '../interfaces/user.interface';

// our actions
import { USR_IS_CONNECTED } from '../reducers/user.reducer';

// our states
import { AppState } from '../../app.state';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private store: Store<AppState>, private user: UserService, private router: Router) { }

  canActivate() {
    return this.user.getUserInformations(true)
      .map((res: Response) => {
        if (res.ok) {
          let user: IUser = res.json();

          this.store.dispatch({ type: USR_IS_CONNECTED, payload: user });
          return true;
        }

        throw new Error(`Not connected, can't access to protected routes`);
      })
      .catch((err) => {
        if (environment.debug) {
          console.error(err);
        }

        this.router.navigate(['/login']);
        return Observable.of(false);
      });
  }

}
