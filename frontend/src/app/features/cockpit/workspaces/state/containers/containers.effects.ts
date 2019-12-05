/**
 * Copyright (C) 2017-2019 Linagora
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@env/environment';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
  catchError,
  flatMap,
  map,
  mapTo,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  getErrorMessage,
  httpResponseWithProgress,
} from '@shared/helpers/shared.helper';
import { ContainersService } from '@shared/services/containers.service';
import { IStore } from '@shared/state/store.interface';
import { NotificationsService } from 'angular2-notifications';
import { Containers } from './containers.actions';

@Injectable()
export class ContainersEffects {
  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private containersService: ContainersService,
    private notifications: NotificationsService,
    private snackBar: MatSnackBar
  ) {}

  @Effect()
  fetchContainersDetails$: Observable<Action> = this.actions$.pipe(
    ofType<Containers.FetchDetails>(Containers.FetchDetailsType),
    flatMap(action =>
      this.containersService.getDetailsContainer(action.payload.id).pipe(
        map(
          res =>
            new Containers.FetchDetailsSuccess({
              id: action.payload.id,
              data: res,
            })
        ),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in containers.effects.ts: ofType(Containers.FetchDetails)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Containers.FetchDetailsError(action.payload));
        })
      )
    )
  );

  @Effect()
  deployComponent$: Observable<Action> = this.actions$.pipe(
    ofType<Containers.DeployComponent>(Containers.DeployComponentType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    switchMap(([action, workspaceId]) => {
      const { progress$, result$ } = this.containersService.deployComponent(
        workspaceId,
        action.payload.id,
        action.payload.file,
        action.payload.name,
        action.payload.sharedLibraries
      );

      return result$.pipe(
        httpResponseWithProgress(
          action.payload.correlationId,
          progress$,
          result =>
            new Containers.DeployComponentSuccess({
              ...result.byId[result.allIds[0]],
              correlationId: action.payload.correlationId,
            })
        ),
        catchError((err: HttpErrorResponse) => {
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

          // dismiss the currently-visible snack bar
          this.snackBar.dismiss();

          return of(
            new Containers.DeployComponentError({
              correlationId: action.payload.correlationId,
              id: action.payload.id,
              errorDeployment: getErrorMessage(err),
            })
          );
        })
      );
    })
  );

  @Effect({ dispatch: false })
  deployComponentSuccess$: Observable<void> = this.actions$.pipe(
    ofType<Containers.DeployComponentSuccess>(
      Containers.DeployComponentSuccessType
    ),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    tap(([action, workspaceId]) => {
      this.notifications.success(
        'Component Deployed',
        `${action.payload.name} has been successfully deployed`
      );
    }),
    mapTo(null)
  );

  @Effect()
  deployServiceAssembly$: Observable<Action> = this.actions$.pipe(
    ofType<Containers.DeployServiceAssembly>(
      Containers.DeployServiceAssemblyType
    ),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    switchMap(([action, workspaceId]) => {
      const {
        progress$,
        result$,
      } = this.containersService.deployServiceAssembly(
        workspaceId,
        action.payload.id,
        action.payload.file,
        action.payload.name
      );

      return result$.pipe(
        httpResponseWithProgress(
          action.payload.correlationId,
          progress$,
          result =>
            new Containers.DeployServiceAssemblySuccess({
              ...result.serviceAssemblies.byId[
                result.serviceAssemblies.allIds[0]
              ],
              correlationId: action.payload.correlationId,
            })
        ),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in containers.effects: ofType(Containers.DeployServiceAssembly)'
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            'Service Assembly deployment failed',
            `An error occurred while deploying ${action.payload.file.name}`
          );

          // dismiss the currently-visible snack bar
          this.snackBar.dismiss();

          return of(
            new Containers.DeployServiceAssemblyError({
              correlationId: action.payload.correlationId,
              id: action.payload.id,
              errorDeployment: getErrorMessage(err),
            })
          );
        })
      );
    })
  );

  @Effect({ dispatch: false })
  deployServiceAssemblySuccess$: Observable<void> = this.actions$.pipe(
    ofType<Containers.DeployServiceAssemblySuccess>(
      Containers.DeployServiceAssemblySuccessType
    ),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    tap(([action, workspaceId]) => {
      this.notifications.success(
        'Service Assembly Deployed',
        `${action.payload.name} has been successfully deployed`
      );
    }),
    mapTo(null)
  );

  @Effect()
  deploySharedLibrary$: Observable<Action> = this.actions$.pipe(
    ofType<Containers.DeploySharedLibrary>(Containers.DeploySharedLibraryType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    switchMap(([action, workspaceId]) => {
      const { progress$, result$ } = this.containersService.deploySharedLibrary(
        workspaceId,
        action.payload.id,
        action.payload.file,
        action.payload.name,
        action.payload.version
      );

      return result$.pipe(
        httpResponseWithProgress(
          action.payload.correlationId,
          progress$,
          result =>
            new Containers.DeploySharedLibrarySuccess({
              ...result.byId[result.allIds[0]],
              correlationId: action.payload.correlationId,
            })
        ),
        catchError((err: HttpErrorResponse) => {
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

          // dismiss the currently-visible snack bar
          this.snackBar.dismiss();

          return of(
            new Containers.DeploySharedLibraryError({
              correlationId: action.payload.correlationId,
              id: action.payload.id,
              errorDeployment: getErrorMessage(err),
            })
          );
        })
      );
    })
  );

  @Effect({ dispatch: false })
  deploySharedLibrarySuccess$: Observable<void> = this.actions$.pipe(
    ofType<Containers.DeploySharedLibrarySuccess>(
      Containers.DeploySharedLibrarySuccessType
    ),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    tap(([action, workspaceId]) => {
      this.notifications.success(
        'Shared Library Deployed',
        `${action.payload.name} has been successfully deployed`
      );
    }),
    mapTo(null)
  );
}
