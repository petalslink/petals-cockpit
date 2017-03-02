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
import { Http, Response } from '@angular/http';
import { Store } from '@ngrx/store';
import { batchActions } from 'redux-batched-actions';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { IStore } from './../interfaces/store.interface';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { Buses } from './../../features/cockpit/workspaces/state/buses/buses.reducer';
import { BusesInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { ServiceUnits } from './../../features/cockpit/workspaces/state/service-units/service-units.reducer';
import { Components } from './../../features/cockpit/workspaces/state/components/components.reducer';
import { Containers } from './../../features/cockpit/workspaces/state/containers/containers.reducer';
import { environment } from './../../../environments/environment';
import { toJavascriptMap } from '../helpers/shared.helper';


export abstract class BusesService {
  abstract watchEventBusDeleted(): void;

  abstract watchEventBusImportOk(): void;

  abstract watchEventBusImportError(): void;

  abstract getDetailsBus(busId: string): Observable<Response>;
}

@Injectable()
export class BusesServiceImpl extends BusesService {
  constructor(
    private http: Http,
    private store$: Store<IStore>,
    private sseService: SseService,
    private notifications: NotificationsService
  ) {
    super();
  }

  watchEventBusDeleted() {
    this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_DELETED)
      .map(({ id }) => {
        this.store$.dispatch(batchActions([
          { type: Buses.REMOVE_BUS, payload: { busId: id } },
          { type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: { busInProgressId: id, importOk: false } },
        ]));
      })
      .subscribe();
  }

  watchEventBusImportOk() {
    this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_IMPORT_OK)
      .map((data: any) => {

        const buses = toJavascriptMap(data.buses);

        // there should be only one element in there!
        const busInProgress = buses.byId[buses.allIds[0]];

        this.notifications.success(`Bus import success`,
          `The import of a bus from the IP ${busInProgress.ip}:${busInProgress.port} succeeded`);

        this.store$.dispatch(batchActions([
          { type: Buses.FETCH_BUSES_SUCCESS, payload: buses },
          { type: Containers.FETCH_CONTAINERS_SUCCESS, payload: toJavascriptMap(data.containers) },
          { type: Components.FETCH_COMPONENTS_SUCCESS, payload: toJavascriptMap(data.components) },
          { type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS, payload: toJavascriptMap(data.serviceUnits) },
        ]));

        // this dispatch is separated from the batchActions on purpose
        // TODO see #230
        this.store$.dispatch({
          type: BusesInProgress.REMOVE_BUS_IN_PROGRESS,
          payload: { busInProgressId: busInProgress.id, importOk: true }
        });
      })
      .subscribe();
  }

  watchEventBusImportError() {
    this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_IMPORT_ERROR)
      .map((busInError: any) => {

        this.notifications.alert(`Bus import error`,
          `The import of a bus from the IP ${busInError.ip}:${busInError.port} failed`);

        this.store$.dispatch({ type: BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS, payload: busInError });
      })
      .subscribe();
  }

  getDetailsBus(busId: string) {
    return this.http.get(`${environment.urlBackend}/buses/${busId}`);
  }
}
