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
import { Router, ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';
import { JsTable } from 'app/shared/helpers/jstable.helper';

@Injectable()
export class ResourceByIdResolver implements Resolve<any> {
  constructor(private router: Router, private store$: Store<IStore>) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    let id: string;
    let resourceState: (state: IStore) => JsTable<object>;

    if ((id = route.params['busId'])) {
      resourceState = state => state.buses;
    } else if ((id = route.params['containerId'])) {
      resourceState = state => state.containers;
    } else if ((id = route.params['serviceAssemblyId'])) {
      resourceState = state => state.serviceAssemblies;
    } else if ((id = route.params['sharedLibraryId'])) {
      resourceState = state => state.sharedLibraries;
    } else if ((id = route.params['componentId'])) {
      resourceState = state => state.components;
    } else if ((id = route.params['serviceUnitId'])) {
      resourceState = state => state.serviceUnits;
    } else if ((id = route.params['busInProgressId'])) {
      resourceState = state => state.busesInProgress;
    } else {
      if (environment.debug) {
        console.error(
          `Error in ResourceByIdResolver: You're trying to use it on a wrong URL`
        );
      }

      return true;
    }

    return this.store$
      .select(state => {
        if (!resourceState(state).byId[id]) {
          this.router.navigate([
            '/workspaces',
            state.workspaces.selectedWorkspaceId,
            'not-found',
          ]);
        }

        return true;
      })
      .first();
  }
}
