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

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { Endpoints } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.actions';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { Services } from 'app/features/cockpit/workspaces/state/services/services.actions';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { BusesService } from 'app/shared/services/buses.service';
import { SseActions } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

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
    .pipe(
      withLatestFrom(this.store$),
      filter(([action, state]) => !!state.buses.byId[action.payload.id]),
      map(([action, state]) => {
        const { id, reason } = action.payload;
        const bus = state.buses.byId[id];

        this.notifications.info(bus.name, reason);

        return new Buses.Removed(bus);
      })
    );

  @Effect()
  watchImportOk$: Observable<Action> = this.actions$
    .ofType<SseActions.BusImportOk>(SseActions.BusImportOkType)
    .pipe(
      withLatestFrom(this.store$),
      map(([action, state]) => {
        const data = action.payload;
        const buses = toJsTable(data.buses);

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
          new Endpoints.Clean(),
          new Services.Clean(),
          new BusesInProgress.Removed(bus),
          new Buses.Added(buses),
          new Containers.Added(toJsTable(data.containers)),
          new Components.Added(toJsTable(data.components)),
          new Endpoints.Added(toJsTable(data.endpoints)),
          new Services.Added(toJsTable(data.services)),
          new ServiceAssemblies.Added(toJsTable(data.serviceAssemblies)),
          new ServiceUnits.Added(toJsTable(data.serviceUnits)),
          new SharedLibraries.Added(toJsTable(data.sharedLibraries)),
        ]);
      })
    );

  @Effect()
  fetchBusDetails$: Observable<Action> = this.actions$
    .ofType<Buses.FetchDetails>(Buses.FetchDetailsType)
    .pipe(
      switchMap(action =>
        this.busesService.getDetailsBus(action.payload.id).pipe(
          map(
            res =>
              new Buses.FetchDetailsSuccess({
                id: action.payload.id,
                data: res,
              })
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in buses.effects.ts: ofType(Buses.FetchDetails)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new Buses.FetchDetailsError(action.payload));
          })
        )
      )
    );

  @Effect()
  deleteBus$: Observable<Action> = this.actions$
    .ofType<Buses.Delete>(Buses.DeleteType)
    .pipe(
      withLatestFrom(
        this.store$.select(state => state.workspaces.selectedWorkspaceId)
      ),
      switchMap(([action, idWorkspace]) =>
        this.busesService.deleteBus(idWorkspace, action.payload.id).pipe(
          mergeMap(_ => empty<Action>()),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error catched in buses.effects: ofType<Buses.Delete>(Buses.DeleteType)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new Buses.DeleteError(action.payload));
          })
        )
      )
    );
}
