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

import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';

import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import {
  BusesService,
  IBusBackendSSE,
} from 'app/shared/services/buses.service';
import { SseActions } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

import { IComponentBackendSSE } from 'app/shared/services/components.service';
import { IContainerBackendSSE } from 'app/shared/services/containers.service';

import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';

@Injectable()
export class BusesEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private busesService: BusesService,
    private router: Router,
    private notifications: NotificationsService
  ) {}

  @Effect()
  watchDeleted$: Observable<Action> = this.actions$
    .ofType<SseActions.BusDeleted>(SseActions.BusDeletedType)
    .withLatestFrom(this.store$)
    .filter(([action, state]) => !!state.buses.byId[action.payload.id])
    .map(([action, state]) => {
      const { id, reason } = action.payload;
      const bus = state.buses.byId[id];

      this.notifications.info(bus.name, reason);

      return new Buses.Removed(bus);
    });

  @Effect()
  watchImportOk$: Observable<Action> = this.actions$
    .ofType<SseActions.BusImportOk>(SseActions.BusImportOkType)
    .withLatestFrom(this.store$)
    .map(([action, state]) => {
      const data = action.payload;
      const buses = toJsTable<IBusBackendSSE>(data.buses);

      // there should be only one element in there!
      const bus = buses.byId[buses.allIds[0]];

      this.notifications.success(
        `Bus import success`,
        `The import of the bus ${bus.name} succeeded`
      );

      if (state.busesInProgress.selectedBusInProgressId === bus.id) {
        this.router.navigate([
          '/workspaces',
          state.workspaces.selectedWorkspaceId,
          'petals',
          'buses',
          bus.id,
        ]);
      }

      return batchActions([
        new BusesInProgress.Removed(bus),
        new Buses.Added(buses),
        new Containers.Added(toJsTable<IContainerBackendSSE>(data.containers)),
        new ServiceAssemblies.Added(
          toJsTable<IServiceAssemblyBackendSSE>(data.serviceAssemblies)
        ),
        new Components.Added(toJsTable<IComponentBackendSSE>(data.components)),
        new ServiceUnits.Added(
          toJsTable<IServiceUnitBackendSSE>(data.serviceUnits)
        ),
        new SharedLibraries.Added(
          toJsTable<ISharedLibraryBackendSSE>(data.sharedLibraries)
        ),
      ]);
    });

  @Effect()
  fetchBusDetails$: Observable<Action> = this.actions$
    .ofType<Buses.FetchDetails>(Buses.FetchDetailsType)
    .switchMap(action =>
      this.busesService
        .getDetailsBus(action.payload.id)
        .map(
          res =>
            new Buses.FetchDetailsSuccess({
              id: action.payload.id,
              data: res.json(),
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in buses.effects.ts: ofType(Buses.FetchDetails)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Buses.FetchDetailsError(action.payload));
        })
    );

  @Effect()
  deleteBus$: Observable<Action> = this.actions$
    .ofType<Buses.Delete>(Buses.DeleteType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, idWorkspace]) =>
      this.busesService
        .deleteBus(idWorkspace, action.payload.id)
        .mergeMap(_ => Observable.empty<Action>())
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in buses.effects: ofType<Buses.Delete>(Buses.DeleteType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Buses.DeleteError(action.payload));
        })
    );
}
