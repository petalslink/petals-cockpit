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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStore } from './../interfaces/store.interface';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { Buses } from './../../features/cockpit/workspaces/state/buses/buses.reducer';
import { batchActions } from 'redux-batched-actions';
import { BusesInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { NotificationsService } from 'angular2-notifications';
import { IBus } from './../../features/cockpit/workspaces/state/buses/bus.interface';
import { busesService } from './../../../mocks/buses-mock';
import { environment } from './../../../environments/environment';
import * as helper from './../helpers/mock.helper';

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
          { type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: { busInProgressId: id } }
        ]));

        this._notifications.info(`Bus removed`, `A bus has been removed`);
      })
      .subscribe();
  }

  getDetailsBus(busId: string) {
    const detailsBus = busesService.read(busId).getDetails();

    return helper
      .responseBody(detailsBus)
      .delay(environment.httpDelay);
  }
}
