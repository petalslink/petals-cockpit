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
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { IStore } from 'app/shared/state/store.interface';
import { IBusInProgressRow } from './buses-in-progress.interface';
import { BusesInProgressReducer } from './buses-in-progress.reducer';
import {
  BusesService,
  IBusInProgressBackend,
} from 'app/shared/services/buses.service';
import { environment } from 'environments/environment';
import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';

@Injectable()
export class BusesInProgressEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private busesService: BusesService,
    private router: Router,
    private notifications: NotificationsService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchBusImport$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.BUS_IMPORT.action)
    .withLatestFrom(this.store$)
    .map(([action, state]) => {
      const bip: IBusInProgressBackend = action.payload;

      if (state.busesInProgress.importBusId === bip.id) {
        this.router.navigate([
          '/workspaces',
          state.workspaces.selectedWorkspaceId,
          'petals',
          'buses-in-progress',
          bip.id,
        ]);
      }

      return new BusesInProgress.Added(
        toJsTable<IBusInProgressBackend>({ [bip.id]: bip })
      );
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchBusImportError$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.BUS_IMPORT_ERROR.action)
    .map(action => {
      const busInError: IBusInProgressBackend = action.payload;
      this.notifications.alert(
        `Bus import error`,
        `The import of a bus from the IP ${busInError.ip}:${busInError.port} failed`
      );
      return new BusesInProgress.UpdateError(busInError);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchBusDeleted$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.BUS_DELETED.action)
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

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  postBus$: Observable<Action> = this.actions$
    .ofType(BusesInProgress.PostType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, idWorkspace]: [BusesInProgress.Post, string]) =>
      this.busesService
        .postBus(idWorkspace, action.payload)
        .map(res => new BusesInProgress.PostSuccess(res.json()))
        .catch((res: Response) => {
          const err = res.json();
          return Observable.of(
            new BusesInProgress.PostError({
              importBusError: `Error ${err.code}: ${err.message}`,
            })
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  deleteBusInProgress$: Observable<Action> = this.actions$
    .ofType(BusesInProgress.DeleteType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, idWorkspace]: [BusesInProgress.Delete, string]) =>
      this.busesService
        .deleteBus(idWorkspace, action.payload.id)
        .mergeMap(_ => Observable.empty())
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in buses-in-progress.effects: ofType(BusesInProgress.DeleteType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new BusesInProgress.DeleteError(action.payload));
        })
    );
}
