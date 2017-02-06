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
import { Containers } from './containers.reducer';
import { ContainersService } from './../../../../../shared/services/containers.service';

@Injectable()
export class ContainersEffects {
  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _containersService: ContainersService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchContainersDetails$: Observable<Action> = this._actions$
    .ofType(Containers.FETCH_CONTAINER_DETAILS)
    .combineLatest(this._store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, workspaceId]:
      [{ type: string, payload: { containerId: string } }, string]) =>
      this._containersService.getDetailsContainer(workspaceId, action.payload.containerId)
        .map((res: Response) => {
          if (!res.ok) {
            throw new Error('Error while fetching the container details');
          }

          const data = res.json();
          return { type: Containers.FETCH_CONTAINER_DETAILS_SUCCESS, payload: { containerId: action.payload.containerId, data } };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error catched in containers.effects.ts : ofType(Containers.FETCH_CONTAINER_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Containers.FETCH_CONTAINER_DETAILS_ERROR,
            payload: { containerId: action.payload.containerId }
          });
        })
    );
}
