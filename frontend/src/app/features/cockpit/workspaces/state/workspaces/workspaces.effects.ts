/**
 * Copyright (C) 2017-2020 Linagora
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
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable, of } from 'rxjs';
import {
  catchError,
  map,
  mapTo,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { batchActions } from '@shared/helpers/batch-actions.helper';
import { toJsTable } from '@shared/helpers/jstable.helper';
import { getErrorMessage } from '@shared/helpers/shared.helper';
import { SseActions, SseService } from '@shared/services/sse.service';
import { WorkspacesService } from '@shared/services/workspaces.service';
import { IStore } from '@shared/state/store.interface';
import { getCurrentUser } from '@shared/state/users.selectors';
import { Buses } from '@wks/state/buses/buses.actions';
import { Components } from '@wks/state/components/components.actions';
import { Containers } from '@wks/state/containers/containers.actions';
import { Endpoints } from '@wks/state/endpoints/endpoints.actions';
import { Interfaces } from '@wks/state/interfaces/interfaces.actions';
import { ServiceAssemblies } from '@wks/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from '@wks/state/service-units/service-units.actions';
import { Services } from '@wks/state/services/services.actions';
import { SharedLibraries } from '@wks/state/shared-libraries/shared-libraries.actions';
import { Workspaces } from './workspaces.actions';

@Injectable()
export class WorkspacesEffects {
  constructor(
    private actions$: Actions,
    private workspacesService: WorkspacesService,
    private router: Router,
    private sseService: SseService,
    private notifications: NotificationsService,
    private store$: Store<IStore>
  ) {}

  @Effect()
  fetchWorkspaces$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.FetchAll>(Workspaces.FetchAllType),
    switchMap(() => this.workspacesService.fetchWorkspaces()),
    map(res => new Workspaces.FetchAllSuccess(res)),
    catchError((err: HttpErrorResponse) => {
      if (environment.debug) {
        console.group();
        console.debug(
          `Error in workspaces.effects: ofType(Workspaces.FetchAll)`
        );
        console.error(err);
        console.groupEnd();
      }

      this.notifications.error(
        `Workspaces`,
        `An error occurred while loading the workspaces.`
      );

      return of(new Workspaces.FetchAllError());
    })
  );

  @Effect()
  postWorkspace$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.Create>(Workspaces.CreateType),
    switchMap(action => {
      return this.workspacesService
        .postWorkspace(action.payload.name, action.payload.shortDescription)
        .pipe(
          tap(newWks => {
            if (newWks) {
              this.router.navigate(['/workspaces', newWks.id]);
            }
          }),
          map(
            res =>
              new Workspaces.CreateSuccess({
                ...res,
                users: [],
              })
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.debug(
                `Error in workspaces.effects: ofType(Workspaces.Post)`
              );
              console.error(err);
              console.groupEnd();
            }

            this.notifications.error(
              `Workspaces`,
              `An error occurred while adding a new workspace.`
            );
            return of(
              new Workspaces.CreateError({
                createWksError: getErrorMessage(err),
              })
            );
          })
        );
    })
  );

  @Effect({ dispatch: false })
  removeWorkspace$: Observable<Action> = this.actions$.pipe(
    ofType(SseActions.WorkspaceDeletedType),
    tap(_ => this.sseService.stopWatchingWorkspace()),
    map(
      (action: SseActions.WorkspaceDeleted) =>
        new Workspaces.Deleted({ id: action.payload.id })
    )
  );

  @Effect()
  fetchWorkspace$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.Fetch>(Workspaces.FetchType),
    withLatestFrom(this.store$.pipe(getCurrentUser)),
    map(([action, currentUser]) => {
      this.store$.dispatch(
        new Workspaces.FetchWorkspaceUserPermissions({
          workspaceId: action.payload.id,
          currentUserId: currentUser.id,
        })
      );
      return action;
    }),
    switchMap(action =>
      this.sseService.watchWorkspaceRealTime(action.payload.id).pipe(
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.debug(
              `Error in workspaces.effects: ofType(Workspaces.Fetch)`
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            `Workspace Error`,
            `An error occurred with the workspace connection.`
          );
          return of(new Workspaces.FetchError(action.payload));
        })
      )
    )
  );

  @Effect()
  fetchWorkspaceSseSuccess$: Observable<Action> = this.actions$.pipe(
    ofType<SseActions.WorkspaceContent>(SseActions.WorkspaceContentType),
    map(action => {
      const data = action.payload;
      return batchActions([
        new Workspaces.CleanWorkspace(),
        new Workspaces.FetchSuccess(data.workspace),
        new Buses.Fetched(toJsTable(data.buses)),
        new Containers.Fetched(toJsTable(data.containers)),
        new Components.Fetched(toJsTable(data.components)),
        new ServiceAssemblies.Fetched(toJsTable(data.serviceAssemblies)),
        new ServiceUnits.Fetched(toJsTable(data.serviceUnits)),
        new SharedLibraries.Fetched(toJsTable(data.sharedLibraries)),
        new Interfaces.Fetched(toJsTable(data.interfaces)),
        new Services.Fetched(toJsTable(data.services)),
        new Endpoints.Fetched(toJsTable(data.endpoints)),
        new Workspaces.BuildServiceTree(),
      ]);
    })
  );

  @Effect()
  buildServiceTree$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.BuildServiceTree>(Workspaces.BuildServiceTreeType),
    withLatestFrom(
      this.store$.pipe(
        select(state => ({
          services: state.services,
          interfaces: state.interfaces,
          endpoints: state.endpoints,
        }))
      )
    ),
    map(([action, serviceTree]) => {
      return new Workspaces.BuildServiceTreeSuccess(serviceTree);
    })
  );

  @Effect()
  fetchWorkspaceDetails$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.FetchDetails>(Workspaces.FetchDetailsType),
    switchMap(action =>
      this.workspacesService.fetchWorkspace(action.payload.id).pipe(
        map(res => new Workspaces.FetchDetailsSuccess(res)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              `Error caught in workspaces.effects: ofType(Workspaces.FetchDetails)`
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Workspaces.FetchDetailsError(action.payload));
        })
      )
    )
  );

  @Effect()
  updateWorkspaceDetails$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.UpdateWorkspaceDetails>(
      Workspaces.UpdateWorkspaceDetailsType
    ),
    switchMap(action =>
      this.workspacesService
        .putWorkspaceDetails(
          action.payload.id,
          action.payload.name,
          action.payload.shortDescription,
          action.payload.description
        )
        .pipe(
          map(
            _ => new Workspaces.UpdateWorkspaceDetailsSuccess(action.payload)
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                `Error catched in workspaces.effects: ofType(Workspaces.UpdateWorkspaceDetails)`
              );
              console.error(err);
              console.groupEnd();
            }

            this.notifications.error(
              `Workspace`,
              `An error occurred while updating workspace details.`
            );

            return of(
              new Workspaces.UpdateWorkspaceDetailsError(action.payload)
            );
          })
        )
    )
  );

  @Effect()
  updateWorkspaceDetailsSuccess$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.UpdateWorkspaceDetailsSuccess>(
      Workspaces.UpdateWorkspaceDetailsSuccessType
    ),
    map(action => {
      return new Workspaces.EditWorkspaceDetails({
        id: action.payload.id,
        isEditDetailsMode: false,
      });
    })
  );

  @Effect()
  deleteWorkspace$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.Delete>(Workspaces.DeleteType),
    switchMap(action =>
      this.workspacesService.deleteWorkspace(action.payload.id).pipe(
        map(_ => new Workspaces.DeleteSuccess(action.payload)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.Delete)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Workspaces.DeleteError(action.payload));
        })
      )
    )
  );

  @Effect()
  addUser$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.AddWorkspaceUser>(Workspaces.AddWorkspaceUserType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    mergeMap(([action, workspaceId]) =>
      this.workspacesService.addUser(workspaceId, action.payload.id).pipe(
        map(res => new Workspaces.AddWorkspaceUserSuccess(res)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.AddUser)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Workspaces.AddWorkspaceUserError(action.payload));
        })
      )
    )
  );

  @Effect()
  updateUserPermissions$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.UpdateWorkspaceUserPermissions>(
      Workspaces.UpdateWorkspaceUserPermissionsType
    ),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    mergeMap(([action, workspaceId]) =>
      this.workspacesService
        .putUserPermissions(
          workspaceId,
          action.payload.userId,
          action.payload.permissions
        )
        .pipe(
          map(
            _ =>
              new Workspaces.UpdateWorkspaceUserPermissionsSuccess(
                action.payload
              )
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error catched in workspace.effects: ofType(Workspaces.UpdateWorkspaceUserPermissions)'
              );
              console.error(err);
              console.groupEnd();
            }

            this.notifications.error(
              `${action.payload.userId} permissions update failed`,
              `${getErrorMessage(err)}`
            );

            return of(
              new Workspaces.UpdateWorkspaceUserPermissionsError(action.payload)
            );
          })
        )
    )
  );

  @Effect()
  fetchUserPermissions$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.FetchWorkspaceUserPermissions>(
      Workspaces.FetchWorkspaceUserPermissionsType
    ),
    switchMap(action =>
      this.workspacesService
        .getUserPermissions(
          action.payload.currentUserId,
          action.payload.workspaceId
        )
        .pipe(
          map(
            response =>
              new Workspaces.FetchWorkspaceUserPermissionsSuccess(
                response.permissions[action.payload.workspaceId]
              )
          ),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                'Error catched in workspace.effects: ofType(Workspaces.FetchWorkspaceUserPermissions)'
              );
              console.error(err);
              console.groupEnd();
            }

            this.notifications.error(
              `Fetch workspace user permissions failed`,
              `${getErrorMessage(err)}`
            );

            return of(new Workspaces.FetchWorkspaceUserPermissionsError());
          })
        )
    )
  );

  @Effect()
  deleteUser$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.DeleteUser>(Workspaces.DeleteUserType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    mergeMap(([action, workspaceId]) =>
      this.workspacesService.removeUser(workspaceId, action.payload.id).pipe(
        map(_ => new Workspaces.DeleteUserSuccess(action.payload)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.DeleteUser)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Workspaces.DeleteUserError(action.payload));
        })
      )
    )
  );

  @Effect({ dispatch: false })
  deleteUserSuccess$: Observable<void> = this.actions$.pipe(
    ofType<Workspaces.DeleteUserSuccess>(Workspaces.DeleteUserSuccessType),
    withLatestFrom(
      this.store$.pipe(getCurrentUser),
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    tap(([action, currentUser, workspaceId]) => {
      if (currentUser.id === action.payload.id) {
        this.router.navigate(['/workspaces'], {
          queryParams: { page: 'list' },
        });
        this.notifications.success(
          'User deleted',
          'You are no longer in workspace ' + workspaceId
        );
      }
    }),
    mapTo(null)
  );

  @Effect()
  watchServicesUpdated$: Observable<Action> = this.actions$.pipe(
    ofType<SseActions.ServicesUpdated>(SseActions.ServicesUpdatedType),
    withLatestFrom(this.store$),
    map(_ => new Workspaces.BuildServiceTree())
  );

  @Effect()
  refreshServices$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.RefreshServices>(Workspaces.RefreshServicesType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    mergeMap(([action, workspaceId]) =>
      this.workspacesService.refreshServices(action.payload.id).pipe(
        map(_ => new Workspaces.RefreshServicesSuccess(action.payload)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.RefreshServices)'
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            `Services`,
            `An error occurred while fetching services.`
          );

          return of(new Workspaces.RefreshServicesError(action.payload));
        })
      )
    )
  );
}
