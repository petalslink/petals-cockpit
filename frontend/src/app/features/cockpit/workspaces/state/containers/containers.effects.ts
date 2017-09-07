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

import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { ContainersService } from 'app/shared/services/containers.service';
import { IStore } from 'app/shared/state/store.interface';
import { environment } from 'environments/environment';

@Injectable()
export class ContainersEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private containersService: ContainersService,
    private notifications: NotificationsService
  ) {}

  @Effect()
  fetchContainersDetails$: Observable<Action> = this.actions$
    .ofType<Containers.FetchDetails>(Containers.FetchDetailsType)
    .flatMap(action =>
      this.containersService
        .getDetailsContainer(action.payload.id)
        .map(
          res =>
            new Containers.FetchDetailsSuccess({
              id: action.payload.id,
              data: res.json(),
            })
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in containers.effects.ts: ofType(Containers.FetchDetails)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Containers.FetchDetailsError(action.payload)
          );
        })
    );

  @Effect()
  deployComponent$: Observable<Action> = this.actions$
    .ofType<Containers.DeployComponent>(Containers.DeployComponentType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, workspaceId]) =>
      this.containersService
        .deployComponent(workspaceId, action.payload.id, action.payload.file)
        .map(
          components =>
            new Containers.DeployComponentSuccess(
              components.byId[components.allIds[0]]
            )
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in containers.effects: ofType(Containers.DeployComponent)'
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            'Component Deployment Failed',
            `An error occurred while deploying ${action.payload.file.name}`
          );

          return Observable.of(
            new Containers.DeployComponentError({
              id: action.payload.id,
              errorDeployment: err.json().message,
            })
          );
        })
    );

  @Effect({ dispatch: false })
  deployComponentSuccess$: Observable<void> = this.actions$
    .ofType<Containers.DeployComponentSuccess>(
      Containers.DeployComponentSuccessType
    )
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .do(([action, workspaceId]) => {
      this.notifications.success(
        'Component Deployed',
        `${action.payload.name} has been successfully deployed`
      );
    })
    .mapTo(null);

  @Effect()
  deployServiceAssembly$: Observable<Action> = this.actions$
    .ofType<Containers.DeployServiceAssembly>(
      Containers.DeployServiceAssemblyType
    )
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, workspaceId]) =>
      this.containersService
        .deployServiceAssembly(
          workspaceId,
          action.payload.id,
          action.payload.file
        )
        .map(
          tables =>
            new Containers.DeployServiceAssemblySuccess(
              tables.serviceAssemblies.byId[tables.serviceAssemblies.allIds[0]]
            )
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in containers.effects: ofType(Containers.DeployServiceAssembly)'
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            'Service Assembly Deployment Failed',
            `An error occurred while deploying ${action.payload.file.name}`
          );

          return Observable.of(
            new Containers.DeployServiceAssemblyError({
              id: action.payload.id,
              errorDeployment: err.json().message,
            })
          );
        })
    );

  @Effect({ dispatch: false })
  deployServiceAssemblySuccess$: Observable<void> = this.actions$
    .ofType<Containers.DeployServiceAssemblySuccess>(
      Containers.DeployServiceAssemblySuccessType
    )
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .do(([action, workspaceId]) => {
      this.notifications.success(
        'Service Assembly Deployed',
        `${action.payload.name} has been successfully deployed`
      );
    })
    .mapTo(null);

  @Effect()
  deploySharedLibrary$: Observable<Action> = this.actions$
    .ofType<Containers.DeploySharedLibrary>(Containers.DeploySharedLibraryType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, workspaceId]) =>
      this.containersService
        .deploySharedLibrary(
          workspaceId,
          action.payload.id,
          action.payload.file
        )
        .map(
          sls =>
            new Containers.DeploySharedLibrarySuccess(sls.byId[sls.allIds[0]])
        )
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in containers.effects: ofType(Containers.DeploySharedLibrary)'
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            'Shared Library Deployment Failed',
            `An error occurred while deploying ${action.payload.file.name}`
          );

          return Observable.of(
            new Containers.DeploySharedLibraryError({
              id: action.payload.id,
              errorDeployment: err.json().message,
            })
          );
        })
    );

  @Effect({ dispatch: false })
  deploySharedLibrarySuccess$: Observable<void> = this.actions$
    .ofType<Containers.DeploySharedLibrarySuccess>(
      Containers.DeploySharedLibrarySuccessType
    )
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .do(([action, workspaceId]) => {
      this.notifications.success(
        'Shared Library Deployed',
        `${action.payload.name} has been successfully deployed`
      );
    })
    .mapTo(null);
}
