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
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { Buses } from './buses.reducer';
import { BusesService } from './../../../../../shared/services/buses.service';
import { environment } from './../../../../../../environments/environment';

@Injectable()
export class BusesEffects {
  constructor(
    private actions$: Actions,
    private busesService: BusesService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchBusDetails$: Observable<Action> = this.actions$
    .ofType(Buses.FETCH_BUS_DETAILS)
    .switchMap((action: { type: string, payload: { busId: string } }) =>
      this.busesService.getDetailsBus(action.payload.busId)
        .map((res: Response) => {
          const rslt = res.json();
          return { type: Buses.FETCH_BUS_DETAILS_SUCCESS, payload: { busId: action.payload.busId, rslt } };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in buses.effects.ts : ofType(Buses.FETCH_BUS_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Buses.FETCH_BUS_DETAILS_ERROR,
            payload: { busId: action.payload.busId }
          });
        })
    );
}
