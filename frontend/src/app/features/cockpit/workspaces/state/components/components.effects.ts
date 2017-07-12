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

import { Router } from '@angular/router';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { environment } from './../../../../../../environments/environment';

import {
  ComponentsService,
  ComponentState,
  EComponentState,
  IComponentBackendSSE,
} from './../../../../../shared/services/components.service';
import { IStore } from '../../../../../shared/state/store.interface';
import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';

import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';

@Injectable()
export class ComponentsEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private router: Router,
    private componentsService: ComponentsService,
    private notifications: NotificationsService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchDeployed$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.COMPONENT_DEPLOYED.action)
    .map(action => {
      const data = action.payload;

      const components = toJsTable<IComponentBackendSSE>(data.components);

      // there is only one component deployed here
      const component = components.byId[components.allIds[0]];

      this.notifications.success(
        'Component Deployed',
        `${component.name} has been successfully deployed`
      );

      return batchActions([
        // add the component
        new Components.Added(components),
        // add it to the container
        new Containers.DeployComponentSuccess(component),
      ]);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchStateChange$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.COMPONENT_STATE_CHANGE.action)
    .withLatestFrom(this.store$)
    .map(([action, store]) => {
      const data: { id: string; state: ComponentState } = action.payload;

      if (data.state === EComponentState.Unloaded) {
        const component = store.components.byId[data.id];

        if (store.components.selectedComponentId === component.id) {
          this.router.navigate([
            '/workspaces',
            store.workspaces.selectedWorkspaceId,
          ]);
        }

        this.notifications.success(
          'Component unloaded',
          `"${component.name}" has been unloaded`
        );

        return new Components.Removed(component);
      } else {
        return new Components.ChangeStateSuccess(data);
      }
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchContainersDetails$: Observable<Action> = this.actions$
    .ofType(Components.FetchDetailsType)
    .switchMap((action: Components.FetchDetails) =>
      this.componentsService
        .getDetailsComponent(action.payload.id)
        .map(
          res =>
            new Components.FetchDetailsSuccess({
              id: action.payload.id,
              data: res.json(),
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in components.effects.ts: ofType(Components.FetchDetailsType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Components.FetchDetailsError(action.payload)
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  changeState$: Observable<Action> = this.actions$
    .ofType(Components.ChangeStateType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, workspaceId]: [Components.ChangeState, string]) =>
      this.componentsService
        .putState(
          workspaceId,
          action.payload.id,
          action.payload.state,
          action.payload.parameters
        )
        .mergeMap(_ => Observable.empty<Action>())
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in components.effects: ofType(Components.ChangeStateType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Components.ChangeStateError({
              id: action.payload.id,
              errorChangeState: err.json().message,
            })
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  changeStateSuccess$: Observable<Action> = this.actions$
    .ofType(Components.ChangeStateSuccessType)
    .map(
      (action: Components.ChangeStateSuccess) =>
        new Components.FetchDetails(action.payload)
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  deployServiceUnit$: Observable<Action> = this.actions$
    .ofType(Components.DeployServiceUnitType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(
      ([action, workspaceId]: [Components.DeployServiceUnit, string]) =>
        this.componentsService
          .deploySu(
            workspaceId,
            action.payload.id,
            action.payload.file,
            action.payload.serviceUnitName
          )
          .mergeMap(_ => Observable.empty<Action>())
          .catch(err => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error caught in components.effects: ofType(Components.DeployServiceUnitType)'
              );
              console.error(err);
              console.groupEnd();
            }

            this.notifications.error(
              'Service Unit Deployment Failed',
              `An error occurred while deploying ${action.payload.file.name}`
            );

            return Observable.of(
              new Components.DeployServiceUnitError({
                id: action.payload.id,
                errorDeployment: err.json().message,
              })
            );
          })
    );
}
