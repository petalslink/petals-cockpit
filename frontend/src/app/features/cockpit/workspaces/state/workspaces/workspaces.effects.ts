import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { batchActions } from 'redux-batched-actions';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { Workspaces } from './workspaces.reducer';
import { WorkspacesService } from './workspaces.service';
import { Users } from '../../../../../shared/state/users.reducer';
import { environment } from '../../../../../../environments/environment';
import { Buses } from '../buses/buses.reducer';
import { Containers } from '../containers/containers.reducer';
import { Components } from '../components/components.reducer';
import { ServiceUnits } from '../service-units/service-units.reducer';
import { Ui } from '../../../../../shared/state/ui.reducer';
import { BusesInProgress } from '../buses-in-progress/buses-in-progress.reducer';
import { SseService, SseWorkspaceEvent } from './../../../../../shared/services/sse.service';

@Injectable()
export class WorkspacesEffects {
  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _workspacesService: WorkspacesService,
    private _sseService: SseService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaces$: Observable<Action> = this._actions$
    .ofType(Workspaces.FETCH_WORKSPACES)
    .switchMap((action: Action) => this._workspacesService.fetchWorkspaces()
      .switchMap((res: Response) => {
        return Observable.of(batchActions([
          { type: Workspaces.FETCH_WORKSPACES_SUCCESS, payload: res.json().workspaces },
          { type: Users.FETCH_USERS_SUCCESS, payload: res.json().users }
        ]));
      })
      .catch(err => {
        if (environment.debug) {
          console.debug(`Error in workspaces.effects : ${Workspaces.FETCH_WORKSPACES}`);
          console.error(err);
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
        return { type: Workspaces.FETCH_WORKSPACE_WAIT_SSE, payload: action.payload };
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaceWaitSse$: Observable<Action> = this._actions$
    .ofType(Workspaces.FETCH_WORKSPACE_WAIT_SSE)
    // TODO there must be a way to improve the following line without setTimeout
    .do((action: Action) => setTimeout(() => this._sseService.triggerSseEvent(SseWorkspaceEvent.WORKSPACE_CONTENT, action.payload), 500))
    .switchMap((action: Action) => this._sseService.subscribeToWorkspaceEvent(SseWorkspaceEvent.WORKSPACE_CONTENT)
      .switchMap((res: string) => {
        const data = JSON.parse(res);
        return Observable.of(batchActions([
          { type: Workspaces.FETCH_WORKSPACE_SUCCESS, payload: data.workspace },
          { type: BusesInProgress.FETCH_BUSES_IN_PROGRESS, payload: data.busesInProgress },
          { type: Buses.FETCH_BUSES_SUCCESS, payload: data.buses },
          { type: Containers.FETCH_CONTAINERS_SUCCESS, payload: data.containers },
          { type: Components.FETCH_COMPONENTS_SUCCESS, payload: data.components },
          { type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS, payload: data.serviceUnits },

          { type: Ui.OPEN_SIDENAV },
          { type: Ui.CLOSE_POPUP_WORKSPACES_LIST }
        ]));
      })
      .catch(err => {
        if (environment.debug) {
          console.debug(`Error in workspaces.effects : ${Workspaces.FETCH_WORKSPACE_WAIT_SSE}`);
          console.error(err);
        }

        // TODO : Define the FETCH_WORKSPACE_ERROR
        return Observable.of({ type: 'TODO Workspaces.FETCH_WORKSPACE_ERROR', payload: action.payload });
      })
    );
}
