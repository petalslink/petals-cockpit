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

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { Buses } from 'app/features/cockpit/workspaces/state/buses/buses.actions';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.actions';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.actions';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.actions';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import {
  IBusBackendSSE,
  IBusInProgressBackend,
} from 'app/shared/services/buses.service';
import { IComponentBackendSSE } from 'app/shared/services/components.service';
import { IContainerBackendSSE } from 'app/shared/services/containers.service';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';
import { SseActions, SseService } from 'app/shared/services/sse.service';
import { IUserBackend } from 'app/shared/services/users.service';
import {
  IWorkspaceBackend,
  WorkspacesService,
} from 'app/shared/services/workspaces.service';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';
import { Users } from 'app/shared/state/users.actions';
import { environment } from 'environments/environment';

@Injectable()
export class WorkspacesEffects {
  constructor(
    private actions$: Actions,
    private workspacesService: WorkspacesService,
    private sseService: SseService,
    private notifications: NotificationsService,
    private store$: Store<IStore>
  ) {}

  @Effect({ dispatch: true })
  fetchWorkspaces$: Observable<Action> = this.actions$
    .ofType<Workspaces.FetchAll>(Workspaces.FetchAllType)
    .switchMap(action =>
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
              `Error in workspaces.effects: ofType(Workspaces.FetchAll)`
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

  @Effect({ dispatch: true })
  postWorkspace$: Observable<Action> = this.actions$
    .ofType<Workspaces.Create>(Workspaces.CreateType)
    .switchMap(action =>
      this.workspacesService
        .postWorkspace(action.payload.name)
        .map(res => new Workspaces.CreateSuccess(res.json()))
        .catch(err => {
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
          return Observable.of(new Workspaces.CreateError());
        })
    );

  @Effect({ dispatch: false })
  removeWorkspace$: Observable<Action> = this.actions$
    .ofType(SseActions.WorkspaceDeletedType)
    .do(_ => this.sseService.stopWatchingWorkspace())
    .map(
      (action: SseActions.WorkspaceDeleted) =>
        new Workspaces.Deleted({ id: action.payload.id })
    );

  @Effect({ dispatch: true })
  fetchWorkspace$: Observable<Action> = this.actions$
    .ofType<Workspaces.Fetch>(Workspaces.FetchType)
    .switchMap(action =>
      this.sseService.watchWorkspaceRealTime(action.payload.id).catch(err => {
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

        return Observable.of(new Workspaces.FetchError(action.payload));
      })
    );

  @Effect({ dispatch: true })
  fetchWorkspaceSseSuccess$: Observable<Action> = this.actions$
    .ofType<SseActions.WorkspaceContent>(SseActions.WorkspaceContentType)
    .map(action => {
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

  @Effect({ dispatch: true })
  fetchWorkspaceDetails$: Observable<Action> = this.actions$
    .ofType<Workspaces.FetchDetails>(Workspaces.FetchDetailsType)
    .switchMap(action =>
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
              `Error caught in workspaces.effects: ofType(Workspaces.FetchDetails)`
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Workspaces.FetchDetailsError(action.payload)
          );
        })
    );

  @Effect({ dispatch: true })
  setDescription$: Observable<Action> = this.actions$
    .ofType<Workspaces.SetDescription>(Workspaces.SetDescriptionType)
    .switchMap(action =>
      this.workspacesService
        .setDescription(action.payload.id, action.payload.description)
        .map(_ => new Workspaces.SetDescriptionSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              `Error catched in workspaces.effects: ofType(Workspaces.SetDescription)`
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(
            new Workspaces.SetDescriptionError(action.payload)
          );
        })
    );

  @Effect({ dispatch: true })
  deleteWorkspace$: Observable<Action> = this.actions$
    .ofType<Workspaces.Delete>(Workspaces.DeleteType)
    .switchMap(action =>
      this.workspacesService
        .deleteWorkspace(action.payload.id)
        .map(_ => new Workspaces.DeleteSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.Delete)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Workspaces.DeleteError(action.payload));
        })
    );

  @Effect({ dispatch: true })
  addUser$: Observable<Action> = this.actions$
    .ofType<Workspaces.AddUser>(Workspaces.AddUserType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .mergeMap(([action, workspaceId]) =>
      this.workspacesService
        .addUser(workspaceId, action.payload.id)
        .map(_ => new Workspaces.AddUserSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.AddUser)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Workspaces.AddUserError(action.payload));
        })
    );

  @Effect({ dispatch: true })
  deleteUser$: Observable<Action> = this.actions$
    .ofType<Workspaces.DeleteUser>(Workspaces.DeleteUserType)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .mergeMap(([action, workspaceId]) =>
      this.workspacesService
        .removeUser(workspaceId, action.payload.id)
        .map(_ => new Workspaces.DeleteUserSuccess(action.payload))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in workspace.effects: ofType(Workspaces.DeleteUser)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of(new Workspaces.DeleteUserError(action.payload));
        })
    );

  @Effect()
  unfoldCurrentElementParents$: Observable<Action> = this.actions$
    .ofType<SetCurrentActions>(
      Containers.SetCurrentType,
      Components.SetCurrentType,
      ServiceUnits.SetCurrentType,
      ServiceAssemblies.SetCurrentType,
      SharedLibraries.SetCurrentType
    )
    .filter(action => !!action.payload.id)
    .withLatestFrom(this.store$)
    .map(([action, state]: [SetCurrentActions, IStore]) =>
      batchActions(unfoldWithParents(action, state, false))
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
