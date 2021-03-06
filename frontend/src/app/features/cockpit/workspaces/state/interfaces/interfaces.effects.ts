/**
 * Copyright (C) 2017-2020 Linagora
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
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { InterfacesService } from '@shared/services/interfaces.service';
import { Interfaces } from './interfaces.actions';

@Injectable()
export class InterfacesEffects {
  constructor(
    private actions$: Actions,
    private interfacesService: InterfacesService
  ) {}

  @Effect()
  fetchInterfaceDetails$: Observable<Action> = this.actions$.pipe(
    ofType<Interfaces.FetchDetails>(Interfaces.FetchDetailsType),
    switchMap(action =>
      this.interfacesService.getDetailsInterface(action.payload.id).pipe(
        map(
          res =>
            new Interfaces.FetchDetailsSuccess({
              id: action.payload.id,
              data: res,
            })
        ),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in interfaces.effects: ofType(Interfaces.FetchDetails)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Interfaces.FetchDetailsError(action.payload));
        })
      )
    )
  );
}
