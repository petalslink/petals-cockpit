/**
 * Copyright (C) 2017-2019 Linagora
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
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { IStore } from '@shared/state/store.interface';
import { Users } from '@shared/state/users.actions';
import { UsersService } from './users.service';

@Injectable()
export class GuardLoginService implements CanActivate {
  constructor(
    private userService: UsersService,
    private router: Router,
    private store$: Store<IStore>
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store$.pipe(
      select(s => s.users.connectedUser && !s.users.isDisconnecting),
      first(),
      switchMap(connectedUser => {
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

            return of(false);
          } else {
            if (environment.debug) {
              console.debug(
                `Guard App: User already retrieved. Continuing to ${url}.`
              );
            }

            return of(true);
          }
        } else {
          return this.userService.getCurrentUserInformations().pipe(
            map(user => {
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
            }),
            catchError(_ => {
              if (isLoginPage) {
                if (environment.debug) {
                  console.debug(
                    `Guard Login: User not logged. Continuing to /login.`
                  );
                }

                return of(true);
              } else {
                if (environment.debug) {
                  console.debug(
                    `Guard App: User not logged. Redirecting to /login (and then to ${url}).`
                  );
                }

                this.router.navigate(['/login'], {
                  queryParams: { previousUrl: url },
                });

                return of(false);
              }
            })
          );
        }
      })
    );
  }
}
