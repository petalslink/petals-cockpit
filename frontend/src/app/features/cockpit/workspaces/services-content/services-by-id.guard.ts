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
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { first, map } from 'rxjs/operators';

import { Endpoints } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.actions';
import { Interfaces } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.actions';
import { Services } from 'app/features/cockpit/workspaces/state/services/services.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { JsTable } from 'app/shared/helpers/jstable.helper';
import { IStore } from 'app/shared/state/store.interface';

@Injectable()
export class ServicesByIdGuard implements CanActivateChild {
  private previousDestroyAction: Action;

  constructor(private router: Router, private store$: Store<IStore>) {}

  canActivateChild(
    route: ActivatedRouteSnapshot,
    rstate: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // we are only interested by leafs!
    // TODO if only we could define the if/else below on something more specific,
    // such as the component type, it would be better...
    if (route.firstChild) {
      return true;
    }

    let id: string;
    let resourceState: (state: IStore) => JsTable<object>;
    let initActions: (state: IStore) => Action[];

    const destroyAction = this.previousDestroyAction;
    this.previousDestroyAction = undefined;

    if ((id = route.params['interfaceId'])) {
      resourceState = state => state.interfaces;
      initActions = state => [
        new Interfaces.SetCurrent({ id }),
        new Interfaces.FetchDetails({ id }),
      ];
      this.previousDestroyAction = new Interfaces.SetCurrent({ id: '' });
    } else if ((id = route.params['endpointId'])) {
      resourceState = state => state.endpoints;
      initActions = state => [
        new Endpoints.SetCurrent({ id }),
        new Endpoints.FetchDetails({ id }),
      ];
      this.previousDestroyAction = new Endpoints.SetCurrent({ id: '' });
    } else if ((id = route.params['serviceId'])) {
      resourceState = state => state.services;
      initActions = state => [
        new Services.SetCurrent({ id }),
        new Services.FetchDetails({ id }),
      ];
      this.previousDestroyAction = new Services.SetCurrent({
        id: '',
      });
    } else {
      if (destroyAction) {
        this.store$.dispatch(destroyAction);
      }

      return true;
    }

    return this.store$.pipe(
      first(),
      map(state => {
        if (!resourceState(state).byId[id]) {
          if (destroyAction) {
            this.store$.dispatch(destroyAction);
          }

          this.router.navigate([
            '/workspaces',
            state.workspaces.selectedWorkspaceId,
            'not-found',
          ]);

          return false;
        }

        const actions = initActions(state);

        this.store$.dispatch(
          batchActions(destroyAction ? [destroyAction, ...actions] : actions)
        );

        return true;
      })
    );
  }
}
