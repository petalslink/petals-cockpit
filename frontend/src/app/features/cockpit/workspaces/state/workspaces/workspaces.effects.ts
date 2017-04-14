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
import { Subscription } from 'rxjs/Subscription';

import { Workspaces } from './workspaces.reducer';
import { WorkspacesService } from './../../../../../shared/services/workspaces.service';
import { Users } from '../../../../../shared/state/users.reducer';
import { environment } from '../../../../../../environments/environment';
import { Buses } from '../buses/buses.reducer';
import { Containers } from '../containers/containers.reducer';
import { Components } from '../components/components.reducer';
import { ServiceUnits } from '../service-units/service-units.reducer';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { BusesInProgress } from '../buses-in-progress/buses-in-progress.reducer';
import { SseService, SseWorkspaceEvent } from './../../../../../shared/services/sse.service';
import { toJavascriptMap } from '../../../../../shared/helpers/shared.helper';
import { BusesService } from './../../../../../shared/services/buses.service';
import { NotificationsService } from 'angular2-notifications';
import { ServiceUnitsService } from '../../../../../shared/services/service-units.service';
import { ComponentsService } from '../../../../../shared/services/components.service';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { IStore } from 'app/shared/interfaces/store.interface';
import { IWorkspaceRow } from 'app/features/cockpit/workspaces/state/workspaces/workspace.interface';
import { IUserRow } from 'app/shared/interfaces/user.interface';
import { IBusInProgressRow } from 'app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { IBusRow } from 'app/features/cockpit/workspaces/state/buses/bus.interface';
import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/container.interface';
import { IComponentRow } from 'app/features/cockpit/workspaces/state/components/component.interface';
import { IServiceUnitRow } from 'app/features/cockpit/workspaces/state/service-units/service-unit.interface';
import { ContainersService } from 'app/shared/services/containers.service';

@Injectable()
export class WorkspacesEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private router: Router,
    private workspacesService: WorkspacesService,
    private sseService: SseService,
    private busesService: BusesService,
    private componentsService: ComponentsService,
    private containersService: ContainersService,
    private serviceUnitsService: ServiceUnitsService,
    private notification: NotificationsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaces$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACES)
    .switchMap((action: Action) => this.workspacesService.fetchWorkspaces()
      .switchMap((res: Response) => {
        const data = res.json();
        return Observable.of(batchActions([
          { type: Workspaces.FETCH_WORKSPACES_SUCCESS, payload: toJavascriptMap<IWorkspaceRow>(data.workspaces) },
          { type: Users.FETCH_USERS_SUCCESS, payload: toJavascriptMap<IUserRow>(data.users) }
        ]));
      })
      .catch(err => {
        if (environment.debug) {
          console.group();
          console.debug(`Error in workspaces.effects : ${Workspaces.FETCH_WORKSPACES}`);
          console.error(err);
          console.groupEnd();
        }

        this.notification.error(`Workspaces`, `An error occured while loading the workspaces.`);
        return Observable.of({ type: Workspaces.FETCH_WORKSPACES_FAILED, payload: action.payload });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) postWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.POST_WORKSPACE)
    .switchMap((action: Action) => this.workspacesService.postWorkspace(action.payload)
      .map((res: Response) => {
        const workspace = res.json();

        return { type: Workspaces.POST_WORKSPACE_SUCCESS, payload: workspace };
      })
      .catch(err => {
        if (environment.debug) {
          console.group();
          console.debug(`Error in workspaces.effects : ${Workspaces.POST_WORKSPACE}`);
          console.error(err);
          console.groupEnd();
        }

        this.notification.error(`Workspaces`, `An error occured while adding a new workspace.`);
        return Observable.of({ type: Workspaces.POST_WORKSPACE_FAILED });
      })
    );

  // TODO this is ugly!
  // tslint:disable-next-line:member-ordering
  private sub: Subscription;

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) closeWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.CLOSE_WORKSPACE)
    .do(_ => this.sub && this.sub.unsubscribe())
    .do(_ => this.sseService.stopWatchingWorkspace())
    .do((action: Action) => {
      if (action.payload && action.payload.delete) {
        this.router.navigate(['/workspaces']);
      }
    })
    .map(_ => ({ type: Workspaces.CLEAN_WORKSPACE }));

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: false }) cleanWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.CLEAN_WORKSPACE)
    .do(_ => this.notification.remove());

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACE)
    .do(_ => this.sub && this.sub.unsubscribe())
    .switchMap((action: Action) => this.sseService.watchWorkspaceRealTime(action.payload)
      .map(_ => {
        this.sub = new Subscription();
        this.sub.add(this.busesService.watchEventBusImport().subscribe());
        this.sub.add(this.busesService.watchEventBusDeleted().subscribe());
        this.sub.add(this.busesService.watchEventBusImportOk().subscribe());
        this.sub.add(this.busesService.watchEventBusImportError().subscribe());
        this.sub.add(this.serviceUnitsService.watchEventSuStateChangeOk().subscribe());
        this.sub.add(this.componentsService.watchEventComponentStateChangeOk().subscribe());
        this.sub.add(this.workspacesService.watchEventWorkspaceDeleted().subscribe());
        this.sub.add(this.componentsService.watchEventSuDeployedOk().subscribe());
        this.sub.add(this.containersService.watchEventComponentDeployedOk().subscribe());

        return { type: Workspaces.FETCH_WORKSPACE_SSE_SUCCESS, payload: action.payload };
      })
      .catch(err => {
        if (environment.debug) {
          console.group();
          console.debug(`Error in workspaces.effects : ${Workspaces.FETCH_WORKSPACE}`);
          console.error(err);
          console.groupEnd();
        }

        this.notification.error(`Workspace`, `An error occured while loading the workspace.`);
        return Observable.empty();
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaceSseSuccess$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACE_SSE_SUCCESS)
    .switchMap((action: Action) => this.sseService.subscribeToWorkspaceEvent(SseWorkspaceEvent.WORKSPACE_CONTENT)
      .switchMap((data: any) => {
        return Observable.of(batchActions([
          { type: Workspaces.CLEAN_WORKSPACE },
          { type: Workspaces.FETCH_WORKSPACE_SUCCESS, payload: data.workspace },
          { type: Users.FETCH_USERS_SUCCESS, payload: toJavascriptMap<IUserRow>(data.users) },
          { type: BusesInProgress.FETCH_BUSES_IN_PROGRESS, payload: toJavascriptMap<IBusInProgressRow>(data.busesInProgress) },
          { type: Buses.FETCH_BUSES_SUCCESS, payload: toJavascriptMap<IBusRow>(data.buses) },
          { type: Containers.FETCH_CONTAINERS_SUCCESS, payload: toJavascriptMap<IContainerRow>(data.containers) },
          { type: Components.FETCH_COMPONENTS_SUCCESS, payload: toJavascriptMap<IComponentRow>(data.components) },
          { type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS, payload: toJavascriptMap<IServiceUnitRow>(data.serviceUnits) },

          { type: Ui.OPEN_SIDENAV },
          { type: Ui.CLOSE_POPUP_WORKSPACES_LIST }
        ]));
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaceDetails$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACE_DETAILS)
    .switchMap((action: Action) =>
      this.workspacesService.fetchWorkspace(action.payload)
        .map((res: Response) => {
          const data = res.json();
          return batchActions([
            { type: Workspaces.FETCH_WORKSPACE_DETAILS_SUCCESS, payload: { id: action.payload, data: data.workspace } },
            { type: Users.FETCH_USERS_SUCCESS, payload: toJavascriptMap<IUserRow>(data.users) },
          ]);
        })
        .catch((err) => {
          if (environment.debug) {
            console.group();
            console.warn(`Error caught in workspaces.effects : ${Workspaces.FETCH_WORKSPACE_DETAILS}`);
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Workspaces.FETCH_WORKSPACE_DETAILS_FAILED,
            payload: action.payload
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) setDescription$: Observable<Action> = this.actions$
    .ofType(Workspaces.SET_DESCRIPTION)
    .switchMap((action: Action) =>
      this.workspacesService
        .setDescription(action.payload.id, action.payload.description)
        .map(__ => ({ type: Workspaces.SET_DESCRIPTION_SUCCESS, payload: action.payload }))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(`Error catched in workspaces.effects : ${Workspaces.SET_DESCRIPTION}`);
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({ type: Workspaces.SET_DESCRIPTION_FAILED, payload: action.payload.id });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) deleteWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.DELETE_WORKSPACE)
    .switchMap((action: Action) =>
      this.workspacesService
        .deleteWorkspace(action.payload)
        .map(__ => ({ type: Workspaces.DELETE_WORKSPACE_SUCCESS, payload: action.payload }))
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error catched in workspace.effects : ofType(Workspaces.DELETE_WORKSPACE)');
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({ type: Workspaces.DELETE_WORKSPACE_FAILED, payload: action.payload });
        })
    );
}
