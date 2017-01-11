import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { batchActions } from 'redux-batched-actions';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { Workspaces } from './workspaces.reducer';
import { WorkspacesService } from './workspaces.service';
import { Users } from './../../../../../shared/state/users.reducer';
import { environment } from './../../../../../../environments/environment';
import { Buses } from './../buses/buses.reducer';
import { Containers } from './../containers/containers.reducer';
import { Components } from './../components/components.reducer';
import { ServiceUnits } from './../service-units/service-units.reducer';
import { Ui } from './../../../../../shared/state/ui.reducer';

@Injectable()
export class WorkspacesEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private workspacesService: WorkspacesService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspaces$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACES)
    .switchMap((action: Action) => this.workspacesService.fetchWorkspaces()
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
        return Observable.of({ type: 'Workspaces.FETCH_WORKSPACES_ERROR', payload: action.payload});
      })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) fetchWorkspace$: Observable<Action> = this.actions$
    .ofType(Workspaces.FETCH_WORKSPACE)
    .switchMap((action: Action) => this.workspacesService.fetchWorkspace(action.payload)
      .switchMap((res: Response) => {
        return Observable.of(batchActions([
          { type: Workspaces.FETCH_WORKSPACE_SUCCESS, payload: res.json().workspace },
          { type: Buses.FETCH_BUSES_SUCCESS, payload: res.json().buses },
          { type: Containers.FETCH_CONTAINERS_SUCCESS, payload: res.json().containers },
          { type: Components.FETCH_COMPONENTS_SUCCESS, payload: res.json().components },
          { type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS, payload: res.json().serviceUnits },

          { type: Ui.OPEN_SIDENAV },
          { type: Ui.CLOSE_POPUP_WORKSPACES_LIST }
        ]));
      })
      .catch(err => {
        if (environment.debug) {
          console.debug(`Error in workspaces.effects : ${Workspaces.FETCH_WORKSPACE}`);
          console.error(err);
        }

        // TODO : Define the FETCH_WORKSPACE_ERROR
        return Observable.of({ type: 'Workspaces.FETCH_WORKSPACE_ERROR', payload: action.payload});
      })
    );
}
