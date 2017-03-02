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
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { batchActions } from 'redux-batched-actions';

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

@Injectable()
export class WorkspacesEffects {
  constructor(
    private actions$: Actions,
    private workspacesService: WorkspacesService,
    private sseService: SseService,
    private busesService: BusesService,
    private notification: NotificationsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaces$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACES)
    .switchMap((action: Action) => this.workspacesService.fetchWorkspaces()
      .switchMap((res: Response) => {
        const data = res.json();
        return Observable.of(batchActions([
          { type: Workspaces.FETCH_WORKSPACES_SUCCESS, payload: toJavascriptMap(data.workspaces) },
          { type: Users.FETCH_USERS_SUCCESS, payload: toJavascriptMap(data.users) }
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

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACE)
    .switchMap((action: Action) => this.sseService.watchWorkspaceRealTime(action.payload)
      .map(_ => {
        // TODO shouldn't we keep the Subscriptions and close them when we change workspace?
        this.busesService.watchEventBusDeleted();
        this.busesService.watchEventBusImportOk();
        this.busesService.watchEventBusImportError();
        return { type: Workspaces.FETCH_WORKSPACE_WAIT_SSE, payload: action.payload };
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaceWaitSse$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACE_WAIT_SSE)
    .switchMap((action: Action) => this.sseService.subscribeToWorkspaceEvent(SseWorkspaceEvent.WORKSPACE_CONTENT)
      .switchMap((data: any) => {
        return Observable.of(batchActions([
          { type: Workspaces.FETCH_WORKSPACE_SUCCESS, payload: data.workspace },
          { type: Users.FETCH_USERS_SUCCESS, payload: toJavascriptMap(data.users) },
          { type: BusesInProgress.FETCH_BUSES_IN_PROGRESS, payload: toJavascriptMap(data.busesInProgress) },
          { type: Buses.FETCH_BUSES_SUCCESS, payload: toJavascriptMap(data.buses) },
          { type: Containers.FETCH_CONTAINERS_SUCCESS, payload: toJavascriptMap(data.containers) },
          { type: Components.FETCH_COMPONENTS_SUCCESS, payload: toJavascriptMap(data.components) },
          { type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS, payload: toJavascriptMap(data.serviceUnits) },

          { type: Ui.OPEN_SIDENAV },
          { type: Ui.CLOSE_POPUP_WORKSPACES_LIST }
        ]));
      })
      .catch(err => {
        if (environment.debug) {
          console.group();
          console.debug(`Error in workspaces.effects : ${Workspaces.FETCH_WORKSPACE_WAIT_SSE}`);
          console.error(err);
          console.groupEnd();
        }

        this.notification.error(`Workspace`, `An error occured while loading the workspace.`);
        return Observable.of({ type: Workspaces.FETCH_WORKSPACE_FAILED, payload: action.payload });
      })
    );
}
