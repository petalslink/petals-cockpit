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
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { getBusWithContainers } from 'app/features/cockpit/workspaces/state/buses/buses.selectors';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { getContainerWithSiblings } from 'app/features/cockpit/workspaces/state/containers/containers.selectors';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { JsTable } from 'app/shared/helpers/jstable.helper';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

@Injectable()
export class ResourceByIdResolver implements Resolve<any> {
  constructor(private router: Router, private store$: Store<IStore>) {}

  resolve(route: ActivatedRouteSnapshot): Observable<void> | void {
    let id: string;
    let resourceState: (state: IStore) => JsTable<object>;
    let resourceInitActions: (state: IStore) => Action[];

    if ((id = route.params['busId'])) {
      resourceState = state => state.buses;
      resourceInitActions = state => [
        new Buses.SetCurrent({ id }),
        new Buses.FetchDetails({ id }),
        ...getBusWithContainers(id)(state).containers.map(
          c => new Containers.FetchDetails(c)
        ),
      ];
    } else if ((id = route.params['containerId'])) {
      resourceState = state => state.containers;
      resourceInitActions = state => [
        new Containers.SetCurrent({ id }),
        new Containers.FetchDetails({ id }),
        ...getContainerWithSiblings(id)(state).siblings.map(
          c => new Containers.FetchDetails(c)
        ),
      ];
    } else if ((id = route.params['serviceAssemblyId'])) {
      resourceState = state => state.serviceAssemblies;
      resourceInitActions = state => [
        new ServiceAssemblies.SetCurrent({ id }),
        new ServiceAssemblies.FetchDetails({ id }),
      ];
    } else if ((id = route.params['sharedLibraryId'])) {
      resourceState = state => state.sharedLibraries;
      resourceInitActions = state => [
        new SharedLibraries.SetCurrent({ id }),
        new SharedLibraries.FetchDetails({ id }),
      ];
    } else if ((id = route.params['componentId'])) {
      resourceState = state => state.components;
      resourceInitActions = state => [
        new Components.SetCurrent({ id }),
        new Components.FetchDetails({ id }),
      ];
    } else if ((id = route.params['serviceUnitId'])) {
      resourceState = state => state.serviceUnits;
      resourceInitActions = state => [
        new ServiceUnits.SetCurrent({ id }),
        new ServiceUnits.FetchDetails({ id }),
      ];
    } else if ((id = route.params['busInProgressId'])) {
      resourceState = state => state.busesInProgress;
      resourceInitActions = state => [];
    } else {
      if (environment.debug) {
        console.error(
          `Error in ResourceByIdResolver: You're trying to use it on a wrong URL`
        );
      }

      return null;
    }

    return this.store$.first().map(state => {
      if (!resourceState(state).byId[id]) {
        this.router.navigate([
          '/workspaces',
          state.workspaces.selectedWorkspaceId,
          'not-found',
        ]);
        return null;
      }

      this.store$.dispatch(batchActions(resourceInitActions(state)));

      return null;
    });
  }
}
