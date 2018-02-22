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
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Endpoints } from 'app/features/cockpit/workspaces/state/endpoints/endpoints.actions';
import { EndpointsService } from 'app/shared/services/endpoints.service';
import { environment } from 'environments/environment';

@Injectable()
export class EndpointsEffects {
  constructor(
    private actions$: Actions,
    private endpointsService: EndpointsService
  ) {}

  @Effect()
  fetchEndpointDetails$: Observable<Action> = this.actions$
    .ofType<Endpoints.FetchDetails>(Endpoints.FetchDetailsType)
    .pipe(
      switchMap(action =>
        this.endpointsService.getDetailsEndpoint(action.payload.id).pipe(
          map(
            res =>
              new Endpoints.FetchDetailsSuccess({
                id: action.payload.id,
                data: res,
              })
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in endpoint.effects: ofType(Endpoints.FetchDetails)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new Endpoints.FetchDetailsError(action.payload));
          })
        )
      )
    );
}
