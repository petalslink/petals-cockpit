/**
 * Copyright (C) 2017-2018 Linagora
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
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { first, map } from 'rxjs/operators';

import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { IStore } from 'app/shared/state/store.interface';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private store$: Store<IStore>,
    private router: Router,
    private actions$: Actions
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const id = route.paramMap.get('workspaceId');

    this.store$.dispatch(new Workspaces.Fetch({ id }));

    return this.actions$
      .ofType<Workspaces.FetchSuccess | Workspaces.FetchError>(
        Workspaces.FetchSuccessType,
        Workspaces.FetchErrorType
      )
      .pipe(
        first(),
        map(action => {
          if (action instanceof Workspaces.FetchError) {
            this.router.navigate(['/workspaces']);
            return false;
          } else {
            return true;
          }
        })
      );
  }
}
