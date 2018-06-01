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
import { EMPTY, Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { environment } from '@env/environment';
import { getErrorMessage } from '@shared/helpers/shared.helper';
import { BusesService } from '@shared/services/buses.service';
import { SseActions } from '@shared/services/sse.service';
import { IStore } from '@shared/state/store.interface';
import { BusesInProgress } from './buses-in-progress.actions';

@Injectable()
export class BusesInProgressEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private busesService: BusesService,
    private router: Router,
    private notifications: NotificationsService
  ) {}

  @Effect()
  watchBusImport$: Observable<Action> = this.actions$
    .ofType<SseActions.BusImport>(SseActions.BusImportType)
    .pipe(map(action => new BusesInProgress.Added(action.payload)));

  @Effect()
  watchBusImportError$: Observable<Action> = this.actions$
    .ofType<SseActions.BusImportError>(SseActions.BusImportErrorType)
    .pipe(
      map(action => {
        const busInError = action.payload;
        this.notifications.alert(
          `Bus import error`,
          `The import of a bus from the IP ${busInError.ip}:${
            busInError.port
          } failed`
        );

        return new BusesInProgress.UpdateError(busInError);
      })
    );

  @Effect()
  watchBusDeleted$: Observable<Action> = this.actions$
    .ofType<SseActions.BusDeleted>(SseActions.BusDeletedType)
    .pipe(
      withLatestFrom(this.store$),
      filter(
        ([action, state]) => !!state.busesInProgress.byId[action.payload.id]
      ),
      map(([action, state]) => {
        const { id, reason } = action.payload;
        const bip = state.busesInProgress.byId[id];
        this.notifications.info(`${bip.ip}:${bip.port}`, reason);

        return new BusesInProgress.Removed(bip);
      })
    );

  @Effect()
  postBus$: Observable<Action> = this.actions$
    .ofType<BusesInProgress.Post>(BusesInProgress.PostType)
    .pipe(
      withLatestFrom(this.store$),
      switchMap(([action, state]) =>
        this.busesService
          .postBus(state.workspaces.selectedWorkspaceId, action.payload)
          .pipe(
            tap(bip => {
              // if we are still on the import page (bc if we change it is set
              // back to false and we are in a switchMap) and the import event
              // already arrived
              if (state.busesInProgress.isImportingBus) {
                this.router.navigate([
                  '/workspaces',
                  state.workspaces.selectedWorkspaceId,
                  'petals',
                  'buses-in-progress',
                  bip.id,
                ]);
              }
            }),
            map(bip => new BusesInProgress.PostSuccess(bip)),
            catchError((err: HttpErrorResponse) => {
              return of(
                new BusesInProgress.PostError({
                  importBusError: getErrorMessage(err),
                })
              );
            })
          )
      )
    );

  @Effect()
  deleteBusInProgress$: Observable<Action> = this.actions$
    .ofType<BusesInProgress.Delete>(BusesInProgress.DeleteType)
    .pipe(
      withLatestFrom(
        this.store$.select(state => state.workspaces.selectedWorkspaceId)
      ),
      switchMap(([action, idWorkspace]) =>
        this.busesService.deleteBus(idWorkspace, action.payload.id).pipe(
          mergeMap(_ => EMPTY),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error catched in buses-in-progress.effects: ofType(BusesInProgress.Delete)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new BusesInProgress.DeleteError(action.payload));
          })
        )
      )
    );
}
