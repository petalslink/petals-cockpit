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
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
// until ts 2.4 is released, see https://github.com/palantir/tslint/issues/2470 https://github.com/Microsoft/TypeScript/issues/14953
// tslint:disable-next-line:no-unused-variable
import { Observable } from 'rxjs/Observable';

import { IStore } from '../../../shared/state/store.interface';

import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';

@Injectable()
export class WorkspaceResolver implements Resolve<Observable<any>> {
  constructor(private store$: Store<IStore>, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('workspaceId');

    this.store$.dispatch(new Workspaces.Fetch({ id }));

    return this.store$
      .select(state => state.workspaces)
      .filter(
        workspaces =>
          workspaces.isSelectedWorkspaceFetched ||
          workspaces.isSelectedWorkspaceFetchError
      )
      .first()
      .do(workspaces => {
        if (
          workspaces.isSelectedWorkspaceFetchError &&
          !workspaces.isSelectedWorkspaceFetched
        ) {
          this.router.navigate(['/workspaces']);
        }
      });
  }
}
