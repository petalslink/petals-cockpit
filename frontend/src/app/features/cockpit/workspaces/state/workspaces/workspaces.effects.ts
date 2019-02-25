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
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
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
import { Ui } from '@shared/state/ui.actions';
import { Users } from '@shared/state/users.actions';
import { BusesInProgress } from '@wks/state/buses-in-progress/buses-in-progress.actions';
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
    map(res =>
      batchActions([
        new Workspaces.FetchAllSuccess(toJsTable(res.workspaces)),
        new Users.Fetched(toJsTable(res.users)),
      ])
    ),
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
              this.store$.dispatch(new Ui.CloseCreateWorkspace());
              this.router.navigate(['/workspaces', newWks.id]);
            }
          }),
          map(res => new Workspaces.CreateSuccess(res)),
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
        new Workspaces.Clean(),
        new Ui.OpenSidenav(),
        new Workspaces.FetchSuccess(data.workspace),
        new Users.Fetched(toJsTable(data.users)),
        new BusesInProgress.Fetched(toJsTable(data.busesInProgress)),
        new Buses.Fetched(toJsTable(data.buses)),
        new Containers.Fetched(toJsTable(data.containers)),
        new Components.Fetched(toJsTable(data.components)),
        new Endpoints.Fetched(toJsTable(data.endpoints)),
        new Interfaces.Fetched(toJsTable(data.interfaces)),
        new ServiceAssemblies.Fetched(toJsTable(data.serviceAssemblies)),
        new ServiceUnits.Fetched(toJsTable(data.serviceUnits)),
        new Services.Fetched(toJsTable(data.services)),
        new SharedLibraries.Fetched(toJsTable(data.sharedLibraries)),
      ]);
    })
  );

  @Effect()
  fetchWorkspaceDetails$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.FetchDetails>(Workspaces.FetchDetailsType),
    switchMap(action =>
      this.workspacesService.fetchWorkspace(action.payload.id).pipe(
        map(res =>
          batchActions([
            new Workspaces.FetchDetailsSuccess({
              id: action.payload.id,
              data: res.workspace,
            }),
            new Users.Fetched(toJsTable(res.users)),
          ])
        ),
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
  setDescription$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.SetDescription>(Workspaces.SetDescriptionType),
    switchMap(action =>
      this.workspacesService
        .setDescription(action.payload.id, action.payload.description)
        .pipe(
          map(_ => new Workspaces.SetDescriptionSuccess(action.payload)),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                `Error catched in workspaces.effects: ofType(Workspaces.SetDescription)`
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new Workspaces.SetDescriptionError(action.payload));
          })
        )
    )
  );

  @Effect()
  setShortDescription$: Observable<Action> = this.actions$.pipe(
    ofType<Workspaces.SetShortDescription>(Workspaces.SetShortDescriptionType),
    switchMap(action =>
      this.workspacesService
        .setShortDescription(action.payload.id, action.payload.shortDescription)
        .pipe(
          map(_ => new Workspaces.SetShortDescriptionSuccess(action.payload)),
          catchError((err: HttpErrorResponse) => {
            if (environment.debug) {
              console.group();
              console.warn(
                `Error catched in workspaces.effects: ofType(Workspaces.SetShortDescription)`
              );
              console.error(err);
              console.groupEnd();
            }

            return of(new Workspaces.SetShortDescriptionError(action.payload));
          })
        )
    )
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
    ofType<Workspaces.AddUser>(Workspaces.AddUserType),
    withLatestFrom(
      this.store$.pipe(select(state => state.workspaces.selectedWorkspaceId))
    ),
    mergeMap(([action, workspaceId]) =>
      this.workspacesService.addUser(workspaceId, action.payload.id).pipe(
        map(_ => new Workspaces.AddUserSuccess(action.payload)),
        catchError((err: HttpErrorResponse) => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.AddUser)'
            );
            console.error(err);
            console.groupEnd();
          }

          return of(new Workspaces.AddUserError(action.payload));
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

  @Effect()
  unfoldCurrentElementParents$: Observable<Action> = this.actions$.pipe(
    ofType<SetCurrentActions>(
      Containers.SetCurrentType,
      Components.SetCurrentType,
      ServiceUnits.SetCurrentType,
      ServiceAssemblies.SetCurrentType,
      SharedLibraries.SetCurrentType
    ),
    filter(action => !!action.payload.id),
    withLatestFrom(this.store$),
    map(([action, state]: [SetCurrentActions, IStore]) =>
      batchActions(unfoldWithParents(action, state, false))
    )
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

          return of(new Workspaces.RefreshServicesError(action.payload));
        })
      )
    )
  );
}

type SetCurrentActions =
  | Containers.SetCurrent
  | Components.SetCurrent
  | ServiceUnits.SetCurrent
  | ServiceAssemblies.SetCurrent
  | SharedLibraries.SetCurrent;

function unfoldWithParents(
  action: SetCurrentActions | Buses.SetCurrent,
  state: IStore,
  alsoCurrent = true
): Action[] {
  const id = action.payload.id;

  switch (action.type) {
    case Buses.SetCurrentType: {
      return alsoCurrent ? [new Buses.Unfold({ id })] : [];
    }

    case Containers.SetCurrentType: {
      return [
        ...(alsoCurrent
          ? [new Containers.Unfold({ id, type: 'container' })]
          : []),
        ...unfoldWithParents(
          new Buses.SetCurrent({ id: state.containers.byId[id].busId }),
          state
        ),
      ];
    }

    case Components.SetCurrentType: {
      const cId = state.components.byId[id].containerId;
      return [
        ...(alsoCurrent ? [new Components.Unfold({ id })] : []),
        new Containers.Unfold({ id: cId, type: 'components' }),
        ...unfoldWithParents(new Containers.SetCurrent({ id: cId }), state),
      ];
    }

    case ServiceAssemblies.SetCurrentType: {
      const cId = state.serviceAssemblies.byId[id].containerId;
      return [
        new Containers.Unfold({ id: cId, type: 'service-assemblies' }),
        ...unfoldWithParents(new Containers.SetCurrent({ id: cId }), state),
      ];
    }

    case SharedLibraries.SetCurrentType: {
      const cId = state.sharedLibraries.byId[id].containerId;
      return [
        new Containers.Unfold({ id: cId, type: 'shared-libraries' }),
        ...unfoldWithParents(new Containers.SetCurrent({ id: cId }), state),
      ];
    }

    case ServiceUnits.SetCurrentType: {
      return unfoldWithParents(
        new Components.SetCurrent({
          id: state.serviceUnits.byId[id].componentId,
        }),
        state
      );
    }
  }
}
