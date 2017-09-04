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
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';

import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import {
  EServiceAssemblyState,
  IServiceAssemblyBackendSSE,
  ServiceAssembliesService,
  ServiceAssemblyState,
} from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
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

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchDeployed$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.SA_DEPLOYED.action)
    .map(action => {
      const data = action.payload;
      const serviceAssemblies = toJsTable<IServiceAssemblyBackendSSE>(
        data.serviceAssemblies
      );
      const serviceUnits = toJsTable<IServiceUnitBackendSSE>(data.serviceUnits);
      return batchActions([
        new ServiceAssemblies.Added(serviceAssemblies),
        new ServiceUnits.Added(serviceUnits),
      ]);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchStateChanged$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.SA_STATE_CHANGE.action)
    .withLatestFrom(this.store$)
    .map(([action, store]) => {
      const data: { id: string; state: ServiceAssemblyState } = action.payload;

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

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchServiceAssemblyDetails$: Observable<Action> = this.actions$
    .ofType(ServiceAssemblies.FetchDetailsType)
    .switchMap((action: ServiceAssemblies.FetchDetails) =>
      this.serviceAssembliesService
        .getDetailsServiceAssembly(action.payload.id)
        .map(
          res =>
            new ServiceAssemblies.FetchDetailsSuccess({
              id: action.payload.id,
              data: res.json(),
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in service-assemblies.effects: ofType(ServiceAssemblies.FetchDetailsType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new ServiceAssemblies.FetchDetailsError(action.payload)
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  changeState$: Observable<Action> = this.actions$
    .ofType(ServiceAssemblies.ChangeStateType)
    .withLatestFrom(this.store$)
    .switchMap(([action, store]: [ServiceAssemblies.ChangeState, IStore]) => {
      return (
        this.serviceAssembliesService
          .putState(
            store.workspaces.selectedWorkspaceId,
            action.payload.id,
            action.payload.state
          )
          // response will be handled by sse
          .mergeMap(_ => Observable.empty<Action>())
          .catch(err => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in service-assemblies.effects: ofType(ServiceAssemblies.ChangeStateType)'
              );
              console.error(err);
              console.groupEnd();
            }

            return Observable.of(
              new ServiceAssemblies.ChangeStateError({
                id: action.payload.id,
                errorChangeState: err.json().message,
              })
            );
          })
      );
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  changeStateSuccess$: Observable<Action> = this.actions$
    .ofType(ServiceAssemblies.ChangeStateSuccessType)
    .map(
      (action: ServiceAssemblies.ChangeStateSuccess) =>
        new ServiceAssemblies.FetchDetails(action.payload)
    );
}
