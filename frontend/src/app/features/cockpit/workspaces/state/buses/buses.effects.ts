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

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { environment } from '@env/environment';
import { batchActions } from '@shared/helpers/batch-actions.helper';
import { toJsTable } from '@shared/helpers/jstable.helper';
import { getErrorMessage } from '@shared/helpers/shared.helper';
import { BusesService } from '@shared/services/buses.service';
import { SseActions } from '@shared/services/sse.service';
import { IStore } from '@shared/state/store.interface';
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
    private notifications: NotificationsService
  ) {}

  // BUS

  @Effect()
  watchDeleted$: Observable<Action> = this.actions$.pipe(
    ofType<SseActions.BusDetached>(SseActions.BusDetachedType),
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
        new Buses.Detached({ id }),
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

      return batchActions([
        new Endpoints.Clean(),
        new Interfaces.Clean(),
        new Services.Clean(),
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
  detachBus$: Observable<Action> = this.actions$.pipe(
    ofType<Buses.Detach>(Buses.DetachType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    switchMap(([action, idWorkspace]) =>
      this.busesService.detachBus(idWorkspace, action.payload.id).pipe(
        map(_ => new Buses.DetachSuccess(action.payload)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in buses.effects: ofType<Buses.Detach>(Buses.DetachType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Buses.DetachError(action.payload));
        })
      )
    )
  );

  // BUS IN PROGRESS

  @Effect()
  watchBusImportError$: Observable<Action> = this.actions$.pipe(
    ofType<SseActions.BusImportError>(SseActions.BusImportErrorType),
    map(action => {
      const busInError = action.payload;
      this.notifications.error(
        `Bus import error`,
        `The import of a bus from the IP ${busInError.ip}:${
          busInError.port
        } failed`
      );

      return new Buses.UpdateError(busInError);
    })
  );

  @Effect()
  postBus$: Observable<Action> = this.actions$.pipe(
    ofType<Buses.Post>(Buses.PostType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    switchMap(([action, idWorkspace]) =>
      this.busesService.postBus(idWorkspace, action.payload).pipe(
        map(bip => new Buses.PostSuccess(bip)),
        catchError((err: HttpErrorResponse) => {
          return of(
            new Buses.PostError({
              importBusError: getErrorMessage(err),
            })
          );
        })
      )
    )
  );

  @Effect()
  deleteBusInProgress$: Observable<Action> = this.actions$.pipe(
    ofType<Buses.CancelImport>(Buses.CancelImportType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    switchMap(([action, idWorkspace]) =>
      this.busesService.detachBus(idWorkspace, action.payload.id).pipe(
        map(_ => new Buses.CanceledImport(action.payload)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in buses.effects: ofType(Buses.Delete)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Buses.CancelImportError(action.payload));
        })
      )
    )
  );
}
