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
import { RouteService } from './route.service';

// our interfaces
import { IUser } from '../interfaces/user.interface';
import { IStore } from '../interfaces/store.interface';

// our actions
import { USR_IS_CONNECTED } from '../reducers/user.reducer';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(
    private store: Store<IStore>,
    private user: UserService,
    private routeService: RouteService,
    private router: Router
  ) { }

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

        let url = window.location.pathname;

        // before we redirect to /login, save the asked URL so we can route back the user once he's logged
        this.routeService.urlBeforeRedirectToLogin = (url === '/login' ? null : url);

        this.router.navigate(['/login']);
        return Observable.of(false);
      });
  }

}
