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
import { Subscription } from 'rxjs/Subscription';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { environment } from './../../../../../../environments/environment';
import { ServiceUnitsService } from './../../../../../shared/services/service-units.service';
import { ServiceUnits } from './../service-units/service-units.reducer';

@Injectable()
export class ServiceUnitsEffects {
  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _serviceUnitsService: ServiceUnitsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchServiceUnitDetails$: Observable<Action> = this._actions$
    .ofType(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS)
    .combineLatest(this
      // wait the first workspace to be fetched
      ._store$
      .select(state => [state.workspaces.selectedWorkspaceId, state.workspaces.firstWorkspaceFetched])
      .filter(([selectedWorkspaceId, firstWorkspaceFetched]) => firstWorkspaceFetched === true)
      .map(([selectedWorkspaceId, _]) => selectedWorkspaceId)
      .first()
    )
    .switchMap(([action, workspaceId]:
      [{ type: string, payload: { serviceUnitId: string } }, string]) =>
      this._serviceUnitsService.getDetailsServiceUnit(workspaceId, action.payload.serviceUnitId)
        .map((res: Response) => {
          if (!res.ok) {
            throw new Error('Error while fetching the service-unit details');
          }

          const data = res.json();
          return { type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_SUCCESS, payload: { serviceUnitId: action.payload.serviceUnitId, data } };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error catched in service-unit.effects.ts : ofType(ServiceUnits.FETCH_SERVICE_UNIT_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: ServiceUnits.FETCH_SERVICE_UNIT_DETAILS_ERROR,
            payload: { serviceUnitId: action.payload.serviceUnitId }
          });
        })
    );
}
