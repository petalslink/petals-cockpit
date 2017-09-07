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

import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { ServiceUnitsService } from 'app/shared/services/service-units.service';
import { environment } from 'environments/environment';

import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';

@Injectable()
export class ServiceUnitsEffects {
  constructor(
    private actions$: Actions,
    private serviceUnitsService: ServiceUnitsService
  ) {}

  @Effect({ dispatch: true })
  fetchServiceUnitDetails$: Observable<Action> = this.actions$
    .ofType<ServiceUnits.FetchDetails>(ServiceUnits.FetchDetailsType)
    .switchMap(action =>
      this.serviceUnitsService
        .getDetailsServiceUnit(action.payload.id)
        .map(
          res =>
            new ServiceUnits.FetchDetailsSuccess({
              id: action.payload.id,
              data: res.json(),
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in service-unit.effects: ofType(ServiceUnits.FetchDetails)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new ServiceUnits.FetchDetailsError(action.payload)
          );
        })
    );
}
