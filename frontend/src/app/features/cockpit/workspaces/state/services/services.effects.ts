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
import { Interfaces } from 'app/features/cockpit/workspaces/state/interfaces/interfaces.actions';
import { Services } from 'app/features/cockpit/workspaces/state/services/services.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { ServicesService } from 'app/shared/services/services.service';
import { SseActions } from 'app/shared/services/sse.service';
import { environment } from 'environments/environment';

@Injectable()
export class ServicesEffects {
  constructor(
    private actions$: Actions,
    private servicesService: ServicesService
  ) {}

  @Effect()
  fetchServiceDetails$: Observable<Action> = this.actions$
    .ofType<Services.FetchDetails>(Services.FetchDetailsType)
    .pipe(
      switchMap(action =>
        this.servicesService.getDetailsService(action.payload.id).pipe(
          map(
            res =>
              new Services.FetchDetailsSuccess({
                id: action.payload.id,
                data: res,
              })
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in services.effects: ofType(Services.FetchDetails)'
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new Services.FetchDetailsError(action.payload));
          })
        )
      )
    );

  @Effect()
  watchServicesChanged$: Observable<Action> = this.actions$
    .ofType<SseActions.ServicesUpdated>(SseActions.ServicesUpdatedType)
    .pipe(
      map(action => {
        const data = action.payload;
        const services = toJsTable(data.services);
        const endpoints = toJsTable(data.endpoints);
        const interfaces = toJsTable(data.interfaces);

        return batchActions([
          new Interfaces.Clean(),
          new Services.Clean(),
          new Endpoints.Clean(),
          new Interfaces.Added(interfaces),
          new Services.Added(services),
          new Endpoints.Added(endpoints),
        ]);
      })
    );
}
