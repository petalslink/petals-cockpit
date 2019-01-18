/**
 * Copyright (C) 2017-2019 Linagora
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
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { EMPTY, Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { environment } from '@env/environment';
import { batchActions } from '@shared/helpers/batch-actions.helper';
import { toJsTable } from '@shared/helpers/jstable.helper';
import { BusesService } from '@shared/services/buses.service';
import { SseActions } from '@shared/services/sse.service';
import { IStore } from '@shared/state/store.interface';
import { BusesInProgress } from '@wks/state/buses-in-progress/buses-in-progress.actions';
import { Components } from '@wks/state/components/components.actions';
import { Containers } from '@wks/state/containers/containers.actions';
import { Endpoints } from '@wks/state/endpoints/endpoints.actions';
import { Interfaces } from '@wks/state/interfaces/interfaces.actions';
import { ServiceAssemblies } from '@wks/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from '@wks/state/service-units/service-units.actions';
import { Services } from '@wks/state/services/services.actions';
import { SharedLibraries } from '@wks/state/shared-libraries/shared-libraries.actions';
import { Buses } from './buses.actions';

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
  watchDeleted$: Observable<Action> = this.actions$.pipe(
    ofType<SseActions.BusDeleted>(SseActions.BusDeletedType),
    withLatestFrom(this.store$),
    filter(([action, state]) => !!state.buses.byId[action.payload.id]),
    map(([action, state]) => {
      const { id, reason, content } = action.payload;
      const bus = state.buses.byId[id];

      this.notifications.info(bus.name, reason);

      return batchActions([
        new Endpoints.Clean(),
        new Interfaces.Clean(),
        new Services.Clean(),
        new Endpoints.Added(toJsTable(content.endpoints)),
        new Interfaces.Added(toJsTable(content.interfaces)),
        new Services.Added(toJsTable(content.services)),
        new Buses.Removed(bus),
      ]);
    })
  );

  @Effect()
  watchImportOk$: Observable<Action> = this.actions$.pipe(
    ofType<SseActions.BusImportOk>(SseActions.BusImportOkType),
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
        new Interfaces.Clean(),
        new Services.Clean(),
        new BusesInProgress.Removed(bus),
        new Buses.Added(buses),
        new Containers.Added(toJsTable(data.containers)),
        new Components.Added(toJsTable(data.components)),
        new Endpoints.Added(toJsTable(data.endpoints)),
        new Interfaces.Added(toJsTable(data.interfaces)),
        new Services.Added(toJsTable(data.services)),
        new ServiceAssemblies.Added(toJsTable(data.serviceAssemblies)),
        new ServiceUnits.Added(toJsTable(data.serviceUnits)),
        new SharedLibraries.Added(toJsTable(data.sharedLibraries)),
      ]);
    })
  );

  @Effect()
  fetchBusDetails$: Observable<Action> = this.actions$.pipe(
    ofType<Buses.FetchDetails>(Buses.FetchDetailsType),
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
  deleteBus$: Observable<Action> = this.actions$.pipe(
    ofType<Buses.Delete>(Buses.DeleteType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    switchMap(([action, idWorkspace]) =>
      this.busesService.deleteBus(idWorkspace, action.payload.id).pipe(
        mergeMap(_ => EMPTY),
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
