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
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import {
  BusesService,
  IBusInProgressBackend,
} from 'app/shared/services/buses.service';
import { SseActions } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

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
    .map(action => new BusesInProgress.Added(action.payload));

  @Effect()
  watchBusImportError$: Observable<Action> = this.actions$
    .ofType<SseActions.BusImportError>(SseActions.BusImportErrorType)
    .map(action => {
      const busInError = action.payload;
      this.notifications.alert(
        `Bus import error`,
        `The import of a bus from the IP ${busInError.ip}:${busInError.port} failed`
      );
      return new BusesInProgress.UpdateError(busInError);
    });

  @Effect()
  watchBusDeleted$: Observable<Action> = this.actions$
    .ofType<SseActions.BusDeleted>(SseActions.BusDeletedType)
    .withLatestFrom(this.store$)
    .filter(
      ([action, state]) => !!state.busesInProgress.byId[action.payload.id]
    )
    .map(([action, state]) => {
      const { id, reason } = action.payload;
      const bip = state.busesInProgress.byId[id];
      this.notifications.info(`${bip.ip}:${bip.port}`, reason);

      if (state.busesInProgress.selectedBusInProgressId === id) {
        this.router.navigate([
          '/workspaces',
          state.workspaces.selectedWorkspaceId,
        ]);
      }

      return new BusesInProgress.Removed(bip);
    });

  @Effect()
  postBus$: Observable<Action> = this.actions$
    .ofType<BusesInProgress.Post>(BusesInProgress.PostType)
    .withLatestFrom(this.store$)
    .switchMap(([action, state]) =>
      this.busesService
        .postBus(state.workspaces.selectedWorkspaceId, action.payload)
        .map(res => res.json() as IBusInProgressBackend)
        .do(bip => {
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
        })
        .map(bip => new BusesInProgress.PostSuccess(bip))
        .catch((res: Response) => {
          const err = res.json();
          return Observable.of(
            new BusesInProgress.PostError({
              importBusError: `Error ${err.code}: ${err.message}`,
            })
          );
        })
    );

  @Effect()
  deleteBusInProgress$: Observable<Action> = this.actions$
    .ofType<BusesInProgress.Delete>(BusesInProgress.DeleteType)
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
              'Error catched in buses-in-progress.effects: ofType(BusesInProgress.Delete)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new BusesInProgress.DeleteError(action.payload));
        })
    );
}
