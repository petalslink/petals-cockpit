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
import { Containers } from './containers.reducer';
import { ContainersService } from './../../../../../shared/services/containers.service';
import { IStore } from 'app/shared/interfaces/store.interface';
import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/component.interface';
import { IServiceAssemblyRow } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assembly.interface';

@Injectable()
export class ContainersEffects {
  constructor(
    private router: Router,
    private store$: Store<IStore>,
    private actions$: Actions,
    private containersService: ContainersService,
    private notification: NotificationsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchContainersDetails$: Observable<Action> = this.actions$
    .ofType(Containers.FETCH_CONTAINER_DETAILS)
    .flatMap((action: { type: string, payload: { containerId: string } }) =>
      this.containersService.getDetailsContainer(action.payload.containerId)
        .map((res: Response) => {
          const data = res.json();
          return { type: Containers.FETCH_CONTAINER_DETAILS_SUCCESS, payload: { containerId: action.payload.containerId, data } };
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in containers.effects.ts: ofType(Containers.FETCH_CONTAINER_DETAILS)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Containers.FETCH_CONTAINER_DETAILS_ERROR,
            payload: { containerId: action.payload.containerId }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) deployComponent$: Observable<Action> = this.actions$
    .ofType(Containers.DEPLOY_COMPONENT)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, workspaceId]: [{ type: string, payload: { file: File, containerId: string } }, string]) =>
      this.containersService.deployComponent(workspaceId, action.payload.containerId, action.payload.file)
        .mergeMap(_ => Observable.empty())
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn(`Error caught in containers.effects: ofType(${Containers.DEPLOY_COMPONENT})`);
            console.error(err);
            console.groupEnd();
          }

          this.notification.error(
            'Deploy component failed',
            `An error occurred when trying to deploy the file "${action.payload.file.name}"`
          );

          return Observable.of({
            type: Containers.DEPLOY_COMPONENT_ERROR,
            payload: { containerId: action.payload.containerId, errorDeploymentComponent: err.json().message }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) deployComponentSuccess$: Observable<void> = this.actions$
    .ofType(Containers.DEPLOY_COMPONENT_SUCCESS)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .do(([{ payload }, workspaceId]: [{ payload: IComponentRow }, string]) => {
      this.router.navigate(['workspaces', workspaceId, 'petals', 'components', payload.id]);
    })
    .mapTo(null);

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) deployServiceAssembly$: Observable<Action> = this.actions$
    .ofType(Containers.DEPLOY_SERVICE_ASSEMBLY)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, workspaceId]: [{ type: string, payload: { file: File, containerId: string } }, string]) =>
      this.containersService.deployServiceAssembly(workspaceId, action.payload.containerId, action.payload.file)
        .mergeMap(_ => Observable.empty())
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn(`Error caught in containers.effects: ofType(${Containers.DEPLOY_SERVICE_ASSEMBLY})`);
            console.error(err);
            console.groupEnd();
          }

          this.notification.error(
            'Deploy service-assembly failed',
            `An error occurred when trying to deploy the file "${action.payload.file.name}"`
          );

          return Observable.of({
            type: Containers.DEPLOY_SERVICE_ASSEMBLY_ERROR,
            payload: { containerId: action.payload.containerId, errorDeploymentServiceAssembly: err.json().message }
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) deployServiceAssemblySuccess$: Observable<void> = this.actions$
    .ofType(Containers.DEPLOY_SERVICE_ASSEMBLY_SUCCESS)
    .withLatestFrom(this.store$.select(state => state.workspaces.selectedWorkspaceId))
    .do(([{ payload }, workspaceId]: [{ payload: IServiceAssemblyRow }, string]) => {
      this.router.navigate(['workspaces', workspaceId, 'petals', 'service-assemblies', payload.id]);
    })
    .mapTo(null);
}
