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
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { ServiceUnitsService } from '@shared/services/service-units.service';
import { ServiceUnits } from './service-units.actions';

@Injectable()
export class ServiceUnitsEffects {
  constructor(
    private actions$: Actions,
    private serviceUnitsService: ServiceUnitsService
  ) {}

  @Effect()
  fetchServiceUnitDetails$: Observable<Action> = this.actions$
    .ofType<ServiceUnits.FetchDetails>(ServiceUnits.FetchDetailsType)
    .pipe(
      switchMap(action =>
        this.serviceUnitsService.getDetailsServiceUnit(action.payload.id).pipe(
          map(
            res =>
              new ServiceUnits.FetchDetailsSuccess({
                id: action.payload.id,
                data: res,
              })
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in service-unit.effects: ofType(ServiceUnits.FetchDetails)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new ServiceUnits.FetchDetailsError(action.payload));
          })
        )
      )
    );
}
