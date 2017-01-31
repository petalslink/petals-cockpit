import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { IStore } from './../interfaces/store.interface';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { Buses } from './../../features/cockpit/workspaces/state/buses/buses.reducer';
import { batchActions } from 'redux-batched-actions';
import { BusesInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class BusesMockService {
  private _watchingEventBusDeleted = false;

  constructor(private _store$: Store<IStore>, private _sseService: SseService, private _notifications: NotificationsService) { }

  public watchEventBusDeleted() {
    if (this._watchingEventBusDeleted) {
      return;
    }

    this._watchingEventBusDeleted = true;

    this._sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_DELETED)
      .filter(({ id }) => typeof id !== 'undefined')
      .map(({ id }) => {
        this._store$.dispatch(batchActions([
          { type: Buses.REMOVE_BUS, payload: { busId: id } },
          { type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: { busInProgressId: id } },
        ]));

        this._notifications.info(`Bus removed`, `A bus has been removed`);
      })
      .subscribe();
  }
}
