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
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { IStore } from 'app/shared/interfaces/store.interface';
import { IBusInProgressRow } from './buses-in-progress.interface';
import { BusesInProgress } from './buses-in-progress.reducer';
import { BusesService } from 'app/shared/services/buses.service';
import { environment } from 'environments/environment';

@Injectable()
export class BusesInProgressEffects {

  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private busesService: BusesService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) postBus$: Observable<Action> = this.actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, idWorkspace]) =>
      this.busesService.postBus(idWorkspace, action.payload)
        .map((res: Response) => ({
          type: BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS,
          payload: <IBusInProgressRow>res.json()
        })
        )
        .catch((res: Response) => {
          const err = res.json();
          return Observable.of({
            type: BusesInProgress.POST_BUS_IN_PROGRESS_ERROR,
            payload: `Error ${err.code}: ${err.message}`
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) deleteBusInProgress$: Observable<Action> = this.actions$
    .ofType(BusesInProgress.DELETE_BUS_IN_PROGRESS)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, idWorkspace]) =>
      this.busesService
        .deleteBus(idWorkspace, action.payload.id)
        .mergeMap(_ => Observable.empty())
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error catched in buses-in-progress.effects: ofType(Buses.DELETE_BUS_IN_PROGRESS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({ type: BusesInProgress.DELETE_BUS_IN_PROGRESS_FAILED, payload: action.payload });
        })
    );
}
