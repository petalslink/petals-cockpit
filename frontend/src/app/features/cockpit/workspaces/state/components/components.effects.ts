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

import { environment } from 'environments/environment';

import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import {
  ComponentsService,
  EComponentState,
  IComponentBackendSSE,
} from 'app/shared/services/components.service';
import { SseActions } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/state/store.interface';

@Injectable()
export class ComponentsEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private componentsService: ComponentsService,
    private notifications: NotificationsService
  ) {}

  @Effect()
  watchDeployed$: Observable<Action> = this.actions$
    .ofType<SseActions.ComponentDeployed>(SseActions.ComponentDeployedType)
    .map(action => {
      const data = action.payload;
      const components = toJsTable<IComponentBackendSSE>(data.components);
      return new Components.Added(components);
    });

  @Effect()
  watchStateChange$: Observable<Action> = this.actions$
    .ofType<SseActions.ComponentStateChange>(
      SseActions.ComponentStateChangeType
    )
    .withLatestFrom(this.store$)
    .map(([action, store]) => {
      const data = action.payload;

      if (data.state === EComponentState.Unloaded) {
        const component = store.components.byId[data.id];

        this.notifications.success(
          'Component unloaded',
          `"${component.name}" has been unloaded`
        );

        return new Components.Removed(component);
      } else {
        return new Components.ChangeStateSuccess(data);
      }
    });

  @Effect()
  fetchContainersDetails$: Observable<Action> = this.actions$
    .ofType<Components.FetchDetails>(Components.FetchDetailsType)
    .switchMap(action =>
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
              'Error caught in components.effects.ts: ofType(Components.FetchDetails)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Components.FetchDetailsError(action.payload)
          );
        })
    );

  @Effect()
  changeState$: Observable<Action> = this.actions$
    .ofType<Components.ChangeState>(Components.ChangeStateType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, workspaceId]) =>
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
              'Error catched in components.effects: ofType(Components.ChangeState)'
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

  @Effect()
  changeStateSuccess$: Observable<Action> = this.actions$
    .ofType<Components.ChangeStateSuccess>(Components.ChangeStateSuccessType)
    .map(action => new Components.FetchDetails(action.payload));

  @Effect()
  deployServiceUnit$: Observable<Action> = this.actions$
    .ofType<Components.DeployServiceUnit>(Components.DeployServiceUnitType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, workspaceId]) =>
      this.componentsService
        .deploySu(
          workspaceId,
          action.payload.id,
          action.payload.file,
          action.payload.serviceUnitName
        )
        .map(
          tables =>
            new Components.DeployServiceUnitSuccess({
              ...tables.serviceUnits.byId[tables.serviceUnits.allIds[0]],
              correlationId: action.payload.correlationId,
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in components.effects: ofType(Components.DeployServiceUnit)'
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

  @Effect({ dispatch: false })
  deployServiceUnitSuccess$: Observable<void> = this.actions$
    .ofType<Components.DeployServiceUnitSuccess>(
      Components.DeployServiceUnitSuccessType
    )
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .do(([action, workspaceId]) => {
      this.notifications.success(
        'Service Unit Deployed',
        `${action.payload.name} has been successfully deployed`
      );
    })
    .mapTo(null);
}
