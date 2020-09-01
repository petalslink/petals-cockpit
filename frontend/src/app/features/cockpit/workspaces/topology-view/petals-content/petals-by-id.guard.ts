/**
 * Copyright (C) 2017-2020 Linagora
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
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { batchActions } from '@shared/helpers/batch-actions.helper';
import { JsTable } from '@shared/helpers/jstable.helper';
import { IStore } from '@shared/state/store.interface';
import { Buses } from '@wks/state/buses/buses.actions';
import { getCurrentBus } from '@wks/state/buses/buses.selectors';
import { Components } from '@wks/state/components/components.actions';
import { Containers } from '@wks/state/containers/containers.actions';
import { getCurrentContainer } from '@wks/state/containers/containers.selectors';
import { ServiceAssemblies } from '@wks/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from '@wks/state/service-units/service-units.actions';
import { SharedLibraries } from '@wks/state/shared-libraries/shared-libraries.actions';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class PetalsByIdGuard implements CanActivateChild {
  private previousDestroyAction: Action;

  constructor(
    private router: Router,
    private store$: Store<IStore>,
    private notifications: NotificationsService
  ) {}

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

    if ((id = route.params['busId'])) {
      resourceState = state => state.buses;
      initActions = state => [
        new Buses.SetCurrent({ id }),
        new Buses.FetchDetails({ id }),
        ...getCurrentBus({
          ...state,
          buses: {
            ...state.buses,
            selectedBusId: id,
          },
        }).containers.map(c => new Containers.FetchDetails(c)),
      ];
      this.previousDestroyAction = new Buses.SetCurrent({ id: '' });
    } else if ((id = route.params['containerId'])) {
      resourceState = state => state.containers;
      initActions = state => [
        new Containers.SetCurrent({ id }),
        new Containers.FetchDetails({ id }),
        ...getCurrentContainer({
          ...state,
          containers: {
            ...state.containers,
            selectedContainerId: id,
          },
        }).siblings.map(c => new Containers.FetchDetails(c)),
      ];
      this.previousDestroyAction = new Containers.SetCurrent({ id: '' });
    } else if ((id = route.params['serviceAssemblyId'])) {
      resourceState = state => state.serviceAssemblies;
      initActions = state => [
        new ServiceAssemblies.SetCurrent({ id }),
        new ServiceAssemblies.FetchDetails({ id }),
      ];
      this.previousDestroyAction = new ServiceAssemblies.SetCurrent({ id: '' });
    } else if ((id = route.params['sharedLibraryId'])) {
      resourceState = state => state.sharedLibraries;
      initActions = state => [
        new SharedLibraries.SetCurrent({ id }),
        new SharedLibraries.FetchDetails({ id }),
      ];
      this.previousDestroyAction = new SharedLibraries.SetCurrent({ id: '' });
    } else if ((id = route.params['componentId'])) {
      resourceState = state => state.components;
      initActions = state => [
        new Components.SetCurrent({ id }),
        new Components.FetchDetails({ id }),
      ];
      this.previousDestroyAction = new Components.SetCurrent({ id: '' });
    } else if ((id = route.params['serviceUnitId'])) {
      resourceState = state => state.serviceUnits;
      initActions = state => [
        new ServiceUnits.SetCurrent({ id }),
        new ServiceUnits.FetchDetails({ id }),
      ];
      this.previousDestroyAction = new ServiceUnits.SetCurrent({ id: '' });
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
          this.notifications.error('Not found', id + ' does not exist!');

          if (destroyAction) {
            this.store$.dispatch(destroyAction);
          }

          this.router.navigate([
            '/workspaces',
            state.workspaces.selectedWorkspaceId,
            'petals',
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
