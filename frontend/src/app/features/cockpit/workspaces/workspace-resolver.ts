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
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from './../../../shared/interfaces/store.interface';
import { Workspaces } from './state/workspaces/workspaces.reducer';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';

@Injectable()
export class WorkspaceResolver implements Resolve<Observable<any>> {
  constructor(private store$: Store<IStore>) { }

  resolve(route: ActivatedRouteSnapshot) {
    const workspaceId = route.params['workspaceId'];

    this.store$.dispatch(batchActions([
      { type: Workspaces.CLOSE_WORKSPACE },
      { type: Workspaces.FETCH_WORKSPACE, payload: workspaceId }
    ]));

    return this
      .store$
      .select(state => state.workspaces.selectedWorkspaceId)
      .filter(selectedWorkspaceId => selectedWorkspaceId === workspaceId)
      .first();
  }
}
