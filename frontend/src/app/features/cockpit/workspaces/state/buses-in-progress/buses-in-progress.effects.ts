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

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IBusInProgressRow } from './bus-in-progress.interface';
import { BusesInProgress } from './buses-in-progress.reducer';
import { BusesInProgressService } from './../../../../../shared/services/buses-in-progress.service';

@Injectable()
export class BusesInProgressEffects {

  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _router: Router,
    private _busesInProgressService: BusesInProgressService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) postBus$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS)
    .combineLatest(this._store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, idWorkspace]) =>
      this._busesInProgressService.postBus(idWorkspace, action.payload)
        .map((res: Response) => {
          return {
            type: BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS,
            payload: {
              idWorkspace,
              busInProgress: <IBusInProgressRow>res.json()
            }
          };
        })
        .catch((res: Response) => {
          return Observable.of({
            type: BusesInProgress.POST_BUS_IN_PROGRESS_ERROR,
            payload: `Error ${res.status} ${res.statusText ? `(${res.statusText})` : ``}: ${res.text()}`
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) postBusSuccess$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS)
    .map((action: Action) => action.payload)
    .do(({idWorkspace, busInProgress}: { idWorkspace: string, busInProgress: IBusInProgressRow }) =>
      this._router.navigate(['/workspaces', idWorkspace, 'petals', 'buses-in-progress', busInProgress.id])
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) deleteBusInProgress$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.DELETE_BUS_IN_PROGRESS)
    .combineLatest(this._store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, idWorkspace]) =>
      this._busesInProgressService.deleteBus(idWorkspace, action.payload.id)
        .map((res: Response) => {
          return {
            type: BusesInProgress.DELETE_BUS_IN_PROGRESS_SUCCESS,
            payload: {
              idWorkspace,
              busInProgress: action.payload
            }
          };
        })
    // TODO catch error?
    );

  // No need to actually delete it in the store because it will be handled from the SSE event
  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) deleteBusSuccess$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.DELETE_BUS_IN_PROGRESS_SUCCESS)
    .map((action: Action) => action.payload)
    .do(({idWorkspace, busInProgress}: { idWorkspace: string, busInProgress: IBusInProgressRow }) =>
      // TODO improve that, what if we changed ws inbetween the delete and its success?!
      this._router.navigate(['/workspaces', idWorkspace])
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) removeBusInProgress$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.REMOVE_BUS_IN_PROGRESS)
    .combineLatest(
    this._store$.select(state => state.workspaces.selectedWorkspaceId),
    this._store$.select(state => state.busesInProgress.selectedBusInProgressId)
    )
    .map(([action, wsId, sId]) => {
      return { ...action.payload, wsId, sId };
    })
    .do(({busInProgressId, importOk, wsId, sId}: { busInProgressId: string, importOk: boolean, wsId: string, sId: string }) => {
      if (importOk && this._router.url.match(/\/buses-in-progress\//) && sId === busInProgressId) {
        this._router.navigate(['/workspaces', wsId, 'petals', 'buses', busInProgressId]);
      }
    });
}
