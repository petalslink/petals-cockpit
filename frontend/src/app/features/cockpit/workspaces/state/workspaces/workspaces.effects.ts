import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { batchActions } from 'redux-batched-actions';

import { IStore } from '../../../../../shared/interfaces/store.interface';
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

@Injectable()
export class WorkspacesEffects {
  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _workspacesService: WorkspacesService,
    private _sseService: SseService,
    private _busesService: BusesService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaces$: Observable<Action> = this._actions$
    .ofType(Workspaces.FETCH_WORKSPACES)
    .switchMap((action: Action) => this._workspacesService.fetchWorkspaces()
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

        // TODO : Define the FETCH_WORKSPACES_ERROR
        return Observable.of({ type: 'Workspaces.FETCH_WORKSPACES_ERROR', payload: action.payload });
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspace$: Observable<Action> = this._actions$
    .ofType(Workspaces.FETCH_WORKSPACE)
    .switchMap((action: Action) => this._sseService.watchWorkspaceRealTime(action.payload)
      .map(_ => {
        this._busesService.watchEventBusDeleted();
        return { type: Workspaces.FETCH_WORKSPACE_WAIT_SSE, payload: action.payload };
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaceWaitSse$: Observable<Action> = this._actions$
    .ofType(Workspaces.FETCH_WORKSPACE_WAIT_SSE)
    // TODO there must be a way to improve the following line without setTimeout
    .do((action: Action) => setTimeout(() => this._sseService.triggerSseEvent(SseWorkspaceEvent.WORKSPACE_CONTENT, action.payload), 500))
    .switchMap((action: Action) => this._sseService.subscribeToWorkspaceEvent(SseWorkspaceEvent.WORKSPACE_CONTENT)
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

        // TODO : Define the FETCH_WORKSPACE_ERROR
        return Observable.of({ type: 'TODO Workspaces.FETCH_WORKSPACE_ERROR', payload: action.payload });
      })
    );
}
