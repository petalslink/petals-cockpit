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
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { IStore } from 'app/shared/state/store.interface';
import {
  BusesService,
  IBusBackendSSE,
} from 'app/shared/services/buses.service';
import { environment } from 'environments/environment';
import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';

import { IContainerBackendSSE } from 'app/shared/services/containers.service';
import { IComponentBackendSSE } from 'app/shared/services/components.service';

import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';

import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';

@Injectable()
export class BusesEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private busesService: BusesService,
    private router: Router,
    private notifications: NotificationsService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchDeleted$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.BUS_DELETED.action)
    .withLatestFrom(this.store$)
    .filter(([action, state]) => !!state.buses.byId[action.payload.id])
    .map(([action, state]) => {
      const { id, reason } = action.payload;
      const bus = state.buses.byId[id];

      this.notifications.info(bus.name, reason);

      if (state.buses.selectedBusId === id) {
        this.router.navigate([
          '/workspaces',
          state.workspaces.selectedWorkspaceId,
        ]);
      }

      return new Buses.Removed(bus);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchImportOk$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.BUS_IMPORT_OK.action)
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

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchBusDetails$: Observable<Action> = this.actions$
    .ofType(Buses.FetchDetailsType)
    .switchMap((action: Buses.FetchDetails) =>
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
              'Error caught in buses.effects.ts: ofType(Buses.FetchDetailsType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Buses.FetchDetailsError(action.payload));
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  deleteBus$: Observable<Action> = this.actions$
    .ofType(Buses.DeleteType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, idWorkspace]: [Buses.Delete, string]) =>
      this.busesService
        .deleteBus(idWorkspace, action.payload.id)
        .mergeMap(_ => Observable.empty<Action>())
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in buses.effects: ofType(Buses.DeleteType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Buses.DeleteError(action.payload));
        })
    );
}
