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
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { environment } from './../../../../../../environments/environment';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import { ServiceAssembliesService } from 'app/shared/services/service-assemblies.service';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { ServiceAssemblyState } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assembly.interface';

@Injectable()
export class ServiceAssembliesEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private serviceAssembliesService: ServiceAssembliesService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchServiceAssemblyDetails$: Observable<Action> = this.actions$
    .ofType(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS)
    .switchMap((action: { type: string, payload: { serviceAssemblyId: string } }) =>
      this.serviceAssembliesService.getDetailsServiceAssembly(action.payload.serviceAssemblyId)
        .map((res: Response) => {
          const data = res.json();
          return {
            type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_SUCCESS,
            payload: {
              serviceAssemblyId: action.payload.serviceAssemblyId,
              data
            }
          };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in service-assemblies.effects: ofType(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_ERROR,
            payload: { serviceAssemblyId: action.payload.serviceAssemblyId }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) changeState$: Observable<Action> = this.actions$
    .ofType(ServiceAssemblies.CHANGE_STATE)
    .withLatestFrom(this.store$)
    .switchMap(([action, store]: [{ type: string, payload: { serviceAssemblyId: string, newState: ServiceAssemblyState } }, IStore]) => {
      return this.serviceAssembliesService
        .putState(store.workspaces.selectedWorkspaceId, action.payload.serviceAssemblyId, action.payload.newState)
        // response will be handled by sse
        .mergeMap(_ => Observable.empty())
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in service-assemblies.effects: ofType(ServiceAssemblies.CHANGE_STATE)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: ServiceAssemblies.CHANGE_STATE_ERROR,
            payload: { serviceAssemblyId: action.payload.serviceAssemblyId, errorChangeState: err.json().message }
          });
        });
    });
}
