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

import { environment } from './../../../../../../environments/environment';
import { Components } from './components.reducer';
import { ComponentsService } from './../../../../../shared/services/components.service';

@Injectable()
export class ComponentsEffects {
  constructor(
    private actions$: Actions,
    private componentsService: ComponentsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchContainersDetails$: Observable<Action> = this.actions$
    .ofType(Components.FETCH_COMPONENT_DETAILS)
    .switchMap((action: { type: string, payload: { componentId: string } }) =>
      this.componentsService.getDetailsComponent(action.payload.componentId)
        .map((res: Response) => {
          const data = res.json();
          return { type: Components.FETCH_COMPONENT_DETAILS_SUCCESS, payload: { componentId: action.payload.componentId, data } };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in components.effects.ts : ofType(Components.FETCH_COMPONENT_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Components.FETCH_COMPONENT_DETAILS_ERROR,
            payload: { componentId: action.payload.componentId }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) changeState$: Observable<Action> = this.actions$
    .ofType(Components.CHANGE_STATE)
    .switchMap((action: { type: string, payload: { componentId: string, newState: string } }) =>
      this.componentsService.putState(action.payload.componentId, action.payload.newState)
        .map((res: Response) => {
          if (!res.ok) {
            throw new Error('Error while changing the component state');
          }

          return {
            type: Components.CHANGE_STATE_WAIT_SSE,
            payload: { componentId: action.payload.componentId }
          };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error catched in components.effects : ofType(Components.CHANGE_STATE)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Components.CHANGE_STATE_ERROR,
            payload: { componentId: action.payload.componentId }
          });
        })
    );
}
