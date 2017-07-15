/**
 * Copyright (C) 2017 Linagora
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

import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { UsersService } from './users.service';
import { environment } from './../../../environments/environment';
import { IStore } from '../state/store.interface';

import { Users } from 'app/shared/state/users.actions';

@Injectable()
export class GuardLoginService implements CanActivate {
  constructor(
    private userService: UsersService,
    private router: Router,
    private store$: Store<IStore>
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store$
      .select(s => s.users.connectedUser && !s.users.isDisconnecting)
      .first()
      .switchMap(connectedUser => {
        const url = state.url;
        const isLoginPage = url.match('^/login');

        if (connectedUser) {
          if (isLoginPage) {
            if (environment.debug) {
              console.debug(
                `Guard Login: User already retrieved. Redirecting to /workspaces.`
              );
            }

            this.router.navigate(['/workspaces']);

            return Observable.of(false);
          } else {
            if (environment.debug) {
              console.debug(
                `Guard App: User already retrieved. Continuing to ${url}.`
              );
            }

            return Observable.of(true);
          }
        } else {
          return this.userService
            .getCurrentUserInformations()
            .map(user => {
              if (isLoginPage) {
                if (environment.debug) {
                  console.debug(
                    `Guard Login: User already logged. Redirecting to /workspaces.`
                  );
                }

                this.store$.dispatch(
                  new Users.ConnectSuccess({ user, navigate: true })
                );

                return false;
              } else {
                if (environment.debug) {
                  console.debug(
                    `Guard App: User already logged. Continuing to ${url}.`
                  );
                }

                this.store$.dispatch(
                  new Users.ConnectSuccess({ user, navigate: false })
                );

                return true;
              }
            })
            .catch(_ => {
              if (isLoginPage) {
                if (environment.debug) {
                  console.debug(
                    `Guard Login: User not logged. Continuing to /login.`
                  );
                }

                return Observable.of(true);
              } else {
                if (environment.debug) {
                  console.debug(
                    `Guard App: User not logged. Redirecting to /login (and then to ${url}).`
                  );
                }

                this.router.navigate(['/login'], {
                  queryParams: { previousUrl: url },
                });

                return Observable.of(false);
              }
            });
        }
      });
  }
}
