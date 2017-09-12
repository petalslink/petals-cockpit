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

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';

import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { getErrorMessage } from 'app/shared/helpers/shared.helper';
import {
  EServiceAssemblyState,
  ServiceAssembliesService,
} from 'app/shared/services/service-assemblies.service';
import { SseActions } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

@Injectable()
export class ServiceAssembliesEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private serviceAssembliesService: ServiceAssembliesService,
    private notifications: NotificationsService
  ) {}

  @Effect()
  watchDeployed$: Observable<Action> = this.actions$
    .ofType<SseActions.SaDeployed>(SseActions.SaDeployedType)
    .map(action => {
      const data = action.payload;
      const serviceAssemblies = toJsTable(data.serviceAssemblies);
      const serviceUnits = toJsTable(data.serviceUnits);
      return batchActions([
        new ServiceAssemblies.Added(serviceAssemblies),
        new ServiceUnits.Added(serviceUnits),
      ]);
    });

  @Effect()
  watchStateChanged$: Observable<Action> = this.actions$
    .ofType<SseActions.SaStateChange>(SseActions.SaStateChangeType)
    .withLatestFrom(this.store$)
    .map(([action, store]) => {
      const data = action.payload;

      const sa = store.serviceAssemblies.byId[data.id];

      if (data.state === EServiceAssemblyState.Unloaded) {
        this.notifications.success(
          'Service assembly unloaded',
          `'${sa.name}' has been unloaded`
        );

        return batchActions([
          new ServiceAssemblies.Removed(sa),
          ...sa.serviceUnits.map(
            id => new ServiceUnits.Removed(store.serviceUnits.byId[id])
          ),
        ]);
      } else {
        return new ServiceAssemblies.ChangeStateSuccess({
          id: sa.id,
          state: data.state,
        });
      }
    });

  @Effect()
  fetchServiceAssemblyDetails$: Observable<Action> = this.actions$
    .ofType<ServiceAssemblies.FetchDetails>(ServiceAssemblies.FetchDetailsType)
    .switchMap(action =>
      this.serviceAssembliesService
        .getDetailsServiceAssembly(action.payload.id)
        .map(
          res =>
            new ServiceAssemblies.FetchDetailsSuccess({
              id: action.payload.id,
              data: res,
            })
        )
        .catch((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in service-assemblies.effects: ofType(ServiceAssemblies.FetchDetails)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new ServiceAssemblies.FetchDetailsError(action.payload)
          );
        })
    );

  @Effect()
  changeState$: Observable<Action> = this.actions$
    .ofType<ServiceAssemblies.ChangeState>(ServiceAssemblies.ChangeStateType)
    .withLatestFrom(this.store$)
    .switchMap(([action, store]) => {
      return (
        this.serviceAssembliesService
          .putState(
            store.workspaces.selectedWorkspaceId,
            action.payload.id,
            action.payload.state
          )
          // response will be handled by sse
          .mergeMap(_ => Observable.empty<Action>())
          .catch((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in service-assemblies.effects: ofType(ServiceAssemblies.ChangeState)'
              );
              console.error(err);
              console.groupEnd();
            }

            return Observable.of(
              new ServiceAssemblies.ChangeStateError({
                id: action.payload.id,
                errorChangeState: getErrorMessage(err),
              })
            );
          })
      );
    });

  @Effect()
  changeStateSuccess$: Observable<Action> = this.actions$
    .ofType<ServiceAssemblies.ChangeStateSuccess>(
      ServiceAssemblies.ChangeStateSuccessType
    )
    .map(action => new ServiceAssemblies.FetchDetails(action.payload));
}
