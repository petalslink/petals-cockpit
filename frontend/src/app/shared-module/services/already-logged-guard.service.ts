/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRoute } from '@angular/router';
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

// our actions
import { UserActions } from '../reducers/user.actions';

// our interfaces
import { IStore } from '../interfaces/store.interface';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class AlreadyLoggedGuardService implements CanActivate {
  constructor(
    private store: Store<IStore>,
    private user: UserService,
    private routeService: RouteService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  canActivate() {
    return this.user.getUserInformations(true)
      .map((res: Response) => {
        // if already logged
        if (res.ok) {
          let user: IUser = res.json();

          this.store.dispatch({ type: UserActions.USR_IS_CONNECTED, payload: user });

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
          // before we redirect to /login, save the asked URL so we can route back the user once he's logged
          this.routeService.urlBeforeRedirectToLogin = (this.router.url === '/login' ? null : this.router.url);

          // user is not logged
          return Observable.of(true);
        }
      });
  }
}
