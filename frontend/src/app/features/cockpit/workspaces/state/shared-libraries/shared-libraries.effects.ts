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
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { environment } from './../../../../../../environments/environment';
import { SharedLibrariesService } from 'app/shared/services/shared-libraries.service';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.reducer';

@Injectable()
export class SharedLibrariesEffects {
  constructor(
    private actions$: Actions,
    private sharedLibrariesService: SharedLibrariesService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchDetails$: Observable<Action> = this.actions$
    .ofType(SharedLibraries.FETCH_DETAILS)
    .switchMap((action: { type: string; payload: { id: string } }) =>
      this.sharedLibrariesService
        .getDetails(action.payload.id)
        .map(data => {
          return {
            type: SharedLibraries.FETCH_DETAILS_SUCCESS,
            payload: {
              id: action.payload.id,
              data,
            },
          };
        })
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in shared-libraries.effects: ofType(SharedLibraries.FETCH_DETAILS)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: SharedLibraries.FETCH_DETAILS_ERROR,
            payload: { id: action.payload.id },
          });
        })
    );
}
