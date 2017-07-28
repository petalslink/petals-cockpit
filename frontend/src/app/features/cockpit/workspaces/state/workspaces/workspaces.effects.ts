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
import { Observable } from 'rxjs/Observable';

import { NotificationsService } from 'angular2-notifications';

import {
  IWorkspaceBackend,
  WorkspacesService,
} from 'app/shared/services/workspaces.service';

import { environment } from 'environments/environment';

import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import {
  IBusBackendSSE,
  IBusInProgressBackend,
} from 'app/shared/services/buses.service';
import { IComponentBackendSSE } from 'app/shared/services/components.service';
import { IContainerBackendSSE } from 'app/shared/services/containers.service';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import { SseService, SseWorkspaceEvent } from 'app/shared/services/sse.service';

import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { IUserBackend } from 'app/shared/services/users.service';

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { Users } from 'app/shared/state/users.actions';

@Injectable()
export class WorkspacesEffects {
  constructor(
    private actions$: Actions,
    private workspacesService: WorkspacesService,
    private sseService: SseService,
    private notifications: NotificationsService,
    private store$: Store<IStore>
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchWorkspaces$: Observable<Action> = this.actions$
    .ofType(Workspaces.FetchAllType)
    .switchMap((action: Workspaces.FetchAll) =>
      this.workspacesService
        .fetchWorkspaces()
        .map(res => {
          const data = res.json();
          return batchActions([
            new Workspaces.FetchAllSuccess(
              toJsTable<IWorkspaceBackend>(data.workspaces)
            ),
            new Users.Fetched(toJsTable<IUserBackend>(data.users)),
          ]);
        })
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.debug(
              `Error in workspaces.effects: ofType(Workspaces.FetchAllType)`
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            `Workspaces`,
            `An error occurred while loading the workspaces.`
          );

          return Observable.of(new Workspaces.FetchAllError());
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  postWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.CreateType)
    .switchMap((action: Workspaces.Create) =>
      this.workspacesService
        .postWorkspace(action.payload.name)
        .map(res => new Workspaces.CreateSuccess(res.json()))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.debug(
              `Error in workspaces.effects: ofType(Workspaces.PostType)`
            );
            console.error(err);
            console.groupEnd();
          }

          this.notifications.error(
            `Workspaces`,
            `An error occurred while adding a new workspace.`
          );
          return Observable.of(new Workspaces.CreateError());
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false })
  removeWorkspace$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.WORKSPACE_DELETED.action)
    .do(_ => this.sseService.stopWatchingWorkspace())
    .map(action => new Workspaces.Deleted(action.payload.id));

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.FetchType)
    .switchMap((action: Workspaces.Fetch) =>
      this.sseService.watchWorkspaceRealTime(action.payload.id).catch(err => {
        if (environment.debug) {
          console.group();
          console.debug(
            `Error in workspaces.effects: ofType(Workspaces.FetchType)`
          );
          console.error(err);
          console.groupEnd();
        }

        this.notifications.error(
          `Workspace Error`,
          `An error occurred with the workspace connection.`
        );

        return Observable.of(new Workspaces.FetchError(action.payload));
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchWorkspaceSseSuccess$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.WORKSPACE_CONTENT.action)
    .map((action: Action) => {
      const data = action.payload;
      return batchActions([
        new Workspaces.Clean(),
        new Ui.OpenSidenav(),
        new Workspaces.FetchSuccess(data.workspace),
        new Users.Fetched(toJsTable<IUserBackend>(data.users)),
        new BusesInProgress.Fetched(
          toJsTable<IBusInProgressBackend>(data.busesInProgress)
        ),
        new Buses.Fetched(toJsTable<IBusBackendSSE>(data.buses)),
        new Containers.Fetched(
          toJsTable<IContainerBackendSSE>(data.containers)
        ),
        new Components.Fetched(
          toJsTable<IComponentBackendSSE>(data.components)
        ),
        new ServiceAssemblies.Fetched(
          toJsTable<IServiceAssemblyBackendSSE>(data.serviceAssemblies)
        ),
        new ServiceUnits.Fetched(
          toJsTable<IServiceUnitBackendSSE>(data.serviceUnits)
        ),
        new SharedLibraries.Fetched(
          toJsTable<ISharedLibraryBackendSSE>(data.sharedLibraries)
        ),
      ]);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchWorkspaceDetails$: Observable<Action> = this.actions$
    .ofType(Workspaces.FetchDetailsType)
    .switchMap((action: Workspaces.FetchDetails) =>
      this.workspacesService
        .fetchWorkspace(action.payload.id)
        .map(res => {
          const data = res.json();
          return batchActions([
            new Workspaces.FetchDetailsSuccess({
              id: action.payload.id,
              data: data.workspace,
            }),
            new Users.Fetched(toJsTable<IUserBackend>(data.users)),
          ]);
        })
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              `Error caught in workspaces.effects: ofType(Workspaces.FetchDetailsType)`
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Workspaces.FetchDetailsError(action.payload)
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  setDescription$: Observable<Action> = this.actions$
    .ofType(Workspaces.SetDescriptionType)
    .switchMap((action: Workspaces.SetDescription) =>
      this.workspacesService
        .setDescription(action.payload.id, action.payload.description)
        .map(_ => new Workspaces.SetDescriptionSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              `Error catched in workspaces.effects: ofType(Workspaces.SetDescriptionType)`
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Workspaces.SetDescriptionError(action.payload)
          );
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  deleteWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.DeleteType)
    .switchMap((action: Workspaces.Delete) =>
      this.workspacesService
        .deleteWorkspace(action.payload.id)
        .map(_ => new Workspaces.DeleteSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.DeleteType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Workspaces.DeleteError(action.payload));
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  addUser$: Observable<Action> = this.actions$
    .ofType(Workspaces.AddUserType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .mergeMap(([action, workspaceId]: [Workspaces.AddUser, string]) =>
      this.workspacesService
        .addUser(workspaceId, action.payload.id)
        .map(_ => new Workspaces.AddUserSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.AddUserType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Workspaces.AddUserError(action.payload));
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  deleteUser$: Observable<Action> = this.actions$
    .ofType(Workspaces.DeleteUserType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .mergeMap(([action, workspaceId]: [Workspaces.AddUser, string]) =>
      this.workspacesService
        .removeUser(workspaceId, action.payload.id)
        .map(_ => new Workspaces.DeleteUserSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.DeleteUserType)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Workspaces.DeleteUserError(action.payload));
        })
    );
}
