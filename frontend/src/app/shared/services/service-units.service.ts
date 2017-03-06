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
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { environment } from './../../../environments/environment';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { ServiceUnits } from '../../features/cockpit/workspaces/state/service-units/service-units.reducer';
import { IStore } from '../interfaces/store.interface';

export abstract class ServiceUnitsService {
  abstract getDetailsServiceUnit(serviceUnitId: string): Observable<Response>;

  abstract putState(serviceUnitId: string, newState: string): Observable<Response>;

  abstract watchEventSuStateChangeOk(): void;
}

@Injectable()
export class ServiceUnitsServiceImpl extends ServiceUnitsService {
  constructor(private http: Http, private sseService: SseService, private store$: Store<IStore>) {
    super();
  }

  getDetailsServiceUnit(serviceUnitId: string) {
    return this.http.get(`${environment.urlBackend}/serviceunits/${serviceUnitId}`);
  }

  putState(serviceUnitId: string, newState: string) {
    return this.http.put(`${environment.urlBackend}/serviceunits/${serviceUnitId}`, { state: newState });
  }

  watchEventSuStateChangeOk() {
    this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.SU_STATE_CHANGE)
      .do((data: {
        id: string,
        state: string
      }) => {
        this.store$.dispatch({
          type: ServiceUnits.CHANGE_STATE_SUCCESS,
          payload: { serviceUnitId: data.id, newState: data.state }
        });
      })
      .subscribe();
  }
}
