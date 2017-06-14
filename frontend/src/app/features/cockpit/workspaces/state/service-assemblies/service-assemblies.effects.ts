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
import { Router } from '@angular/router';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { environment } from './../../../../../../environments/environment';
import { IStore } from '../../../../../shared/interfaces/store.interface';
import {
  ServiceAssembliesService,
  ServiceAssemblyState,
  EServiceAssemblyState,
  IServiceAssemblyBackendSSE,
} from 'app/shared/services/service-assemblies.service';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.reducer';
import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { toJavascriptMap } from 'app/shared/helpers/map.helper';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.reducer';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';

@Injectable()
export class ServiceAssembliesEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private router: Router,
    private serviceAssembliesService: ServiceAssembliesService,
    private notifications: NotificationsService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchDeployed$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.SA_DEPLOYED.action)
    .map(action => {
      const data = action.payload;

      const serviceAssemblies = toJavascriptMap<IServiceAssemblyBackendSSE>(
        data.serviceAssemblies
      );
      const serviceUnits = toJavascriptMap<IServiceUnitBackendSSE>(
        data.serviceUnits
      );

      const serviceAssemby =
        serviceAssemblies.byId[serviceAssemblies.allIds[0]];

      this.notifications.success(
        'Service Assembly Deployed',
        `${serviceAssemby.name} has been successfully deployed`
      );

      const actions = serviceUnits.allIds.map(id => ({
        type: Components.DEPLOY_SERVICE_UNIT_SUCCESS,
        payload: serviceUnits.byId[id],
      }));

      return batchActions([
        {
          type: ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS,
          payload: serviceAssemblies,
        },
        {
          type: ServiceUnits.ADD_SERVICE_UNITS_SUCCESS,
          payload: serviceUnits,
        },
        {
          type: Containers.DEPLOY_SERVICE_ASSEMBLY_SUCCESS,
          payload: serviceAssemby,
        },
        ...actions,
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
        if (store.serviceAssemblies.selectedServiceAssemblyId === sa.id) {
          this.router.navigate([
            '/workspaces',
            store.workspaces.selectedWorkspaceId,
          ]);
        }

        this.notifications.success(
          'Service assembly unloaded',
          `'${sa.name}' has been unloaded`
        );

        return batchActions([
          {
            type: ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY,
            payload: {
              containerId: sa.containerId,
              serviceAssemblyId: sa.id,
            },
          },

          ...sa.serviceUnits.map(suId => ({
            type: ServiceUnits.REMOVE_SERVICE_UNIT,
            payload: {
              componentId: store.serviceUnits.byId[suId].componentId,
              serviceUnitId: suId,
            },
          })),
        ]);
      } else {
        return {
          type: ServiceAssemblies.CHANGE_STATE_SUCCESS,
          payload: { newState: data.state, serviceAssemblyId: sa.id },
        };
      }
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchServiceAssemblyDetails$: Observable<Action> = this.actions$
    .ofType(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS)
    .switchMap(
      (action: { type: string; payload: { serviceAssemblyId: string } }) =>
        this.serviceAssembliesService
          .getDetailsServiceAssembly(action.payload.serviceAssemblyId)
          .map((res: Response) => {
            const data = res.json();
            return {
              type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_SUCCESS,
              payload: {
                serviceAssemblyId: action.payload.serviceAssemblyId,
                data,
              },
            };
          })
          .catch(err => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in service-assemblies.effects: ofType(ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS)'
              );
              console.error(err);
              console.groupEnd();
            }

            return Observable.of({
              type: ServiceAssemblies.FETCH_SERVICE_ASSEMBLY_DETAILS_ERROR,
              payload: { serviceAssemblyId: action.payload.serviceAssemblyId },
            });
          })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  changeState$: Observable<Action> = this.actions$
    .ofType(ServiceAssemblies.CHANGE_STATE)
    .withLatestFrom(this.store$)
    .switchMap(
      (
        [action, store]: [
          {
            type: string;
            payload: {
              serviceAssemblyId: string;
              newState: ServiceAssemblyState;
            };
          },
          IStore
        ]
      ) => {
        return (
          this.serviceAssembliesService
            .putState(
              store.workspaces.selectedWorkspaceId,
              action.payload.serviceAssemblyId,
              action.payload.newState
            )
            // response will be handled by sse
            .mergeMap(_ => Observable.empty())
            .catch(err => {
              if (environment.debug) {
                console.group();
                console.warn(
                  'Error caught in service-assemblies.effects: ofType(ServiceAssemblies.CHANGE_STATE)'
                );
                console.error(err);
                console.groupEnd();
              }

              return Observable.of({
                type: ServiceAssemblies.CHANGE_STATE_ERROR,
                payload: {
                  serviceAssemblyId: action.payload.serviceAssemblyId,
                  errorChangeState: err.json().message,
                },
              });
            })
        );
      }
    );
}
