import { batchActions } from 'redux-batched-actions';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { IStore } from './../interfaces/store.interface';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { Buses } from './../../features/cockpit/workspaces/state/buses/buses.reducer';
import { BusesInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';

@Injectable()
export class BusesService {
  constructor(private _store$: Store<IStore>, private _sseService: SseService) { }

  public watchEventBusDeleted() {
    this._sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.WORKSPACE_CONTENT)
      .map(({ id }) => {
        this._store$.dispatch(batchActions([
          { type: Buses.REMOVE_BUS, payload: { busId: id } },
          { type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: { busInProgressId: id } },
        ]));
      })
      .subscribe();
  }
}
