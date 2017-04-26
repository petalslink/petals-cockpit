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
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { environment } from './../../../../../../environments/environment';
import { ServiceUnitsService } from './../../../../../shared/services/service-units.service';
import { ServiceUnits } from './../service-units/service-units.reducer';
import { IStore } from '../../../../../shared/interfaces/store.interface';

@Injectable()
export class ServiceUnitsEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private serviceUnitsService: ServiceUnitsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchServiceUnitDetails$: Observable<Action> = this.actions$
    .ofType(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS)
    .switchMap((action: { type: string, payload: { serviceUnitId: string } }) =>
      this.serviceUnitsService.getDetailsServiceUnit(action.payload.serviceUnitId)
        .map((res: Response) => {
          const data = res.json();
          return { type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_SUCCESS, payload: { serviceUnitId: action.payload.serviceUnitId, data } };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in service-unit.effects : ofType(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_ERROR,
            payload: { serviceUnitId: action.payload.serviceUnitId }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) changeState$: Observable<Action> = this.actions$
    .ofType(ServiceUnits.CHANGE_STATE)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, workspaceId]: [{ type: string, payload: { serviceUnitId: string, newState: string } }, string]) =>
      this.serviceUnitsService.putState(workspaceId, action.payload.serviceUnitId, action.payload.newState)
        .mergeMap(_ => Observable.empty())
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in service-unit.effects : ofType(ServiceUnits.CHANGE_STATE)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: ServiceUnits.CHANGE_STATE_ERROR,
            payload: { serviceUnitId: action.payload.serviceUnitId, errorChangeState: err._body }
          });
        })
    );
}
