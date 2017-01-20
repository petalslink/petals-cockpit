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

@Injectable()
export class BusesInProgressEffects {
  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _router: Router,
    private _busesInProgressService: BusesInProgressService
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
  @Effect({ dispatch: false }) postBusSuccess$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS)
    .map((action: Action) => action.payload)
    .do(({idWorkspace, busInProgress}: { idWorkspace: string, busInProgress: IBusInProgressRow }) =>
      this._router.navigate(['/workspaces', idWorkspace, 'petals', 'buses-in-progress', busInProgress.id])
    );
}
