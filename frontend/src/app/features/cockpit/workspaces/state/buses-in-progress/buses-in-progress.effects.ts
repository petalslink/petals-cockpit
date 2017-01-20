import { batchActions } from 'redux-batched-actions';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IBusInProgress, IBusInProgressRow } from './bus-in-progress.interface';
import { BusesInProgress } from './buses-in-progress.reducer';
import { environment } from './../../../../../../environments/environment';
import { BusesInProgressService } from './buses-in-progress.service';
import { SseService, SseWorkspaceEvent } from './../../sse.service';
import { Ui } from './../../../../../shared/state/ui.reducer';
import { ServiceUnits } from './../service-units/service-units.reducer';
import { Buses } from './../buses/buses.reducer';
import { Components } from './../components/components.reducer';
import { Containers } from './../containers/containers.reducer';
import { Workspaces } from './../workspaces/workspaces.reducer';

@Injectable()
export class BusesInProgressEffects {
  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _router: Router,
    private _busesInProgressService: BusesInProgressService,
    private _sseService: SseService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) postBus$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS)
    .combineLatest(this._store$.select(state => state.workspaces.selectedWorkspaceId))
    .switchMap(([action, idWorkspace]) =>
      this._busesInProgressService.postBus(idWorkspace, action.payload)
        .map((res: Response) => {
          return {
            type: BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS,
            payload: {
              idWorkspace,
              busInProgress: <IBusInProgressRow>res.json()
            }
          };
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) postBusSuccess$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS)
    .map((action: Action) => action.payload)
    .do(({idWorkspace, busInProgress}: { idWorkspace: string, busInProgress: IBusInProgressRow }) =>
      this._router.navigate(['/workspaces', idWorkspace, 'petals', 'buses-in-progress', busInProgress.id])
    )
    .do(_ => setTimeout(() => this._sseService.triggerSseEvent(SseWorkspaceEvent.BUS_IMPORT_OK), 3000))
    .switchMap(({ idWorkspace, busInProgress }: { idWorkspace: string, busInProgress: IBusInProgressRow }) =>
      this._sseService.subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_IMPORT_OK)
        .map(res => {
          const data = JSON.parse(res);

          return batchActions([
            { type: Buses.FETCH_BUSES_SUCCESS, payload: data.buses },
            { type: Containers.FETCH_CONTAINERS_SUCCESS, payload: data.containers },
            { type: Components.FETCH_COMPONENTS_SUCCESS, payload: data.components },
            { type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS, payload: data.serviceUnits },
          ])
        })
    );
}
