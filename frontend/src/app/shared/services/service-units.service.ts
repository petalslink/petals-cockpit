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
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';

import { environment } from './../../../environments/environment';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { ServiceUnits } from '../../features/cockpit/workspaces/state/service-units/service-units.reducer';
import { IStore } from '../interfaces/store.interface';
import { ServiceUnitState } from '../../features/cockpit/workspaces/state/service-units/service-unit.interface';
import { IServiceUnitsTable } from '../../features/cockpit/workspaces/state/service-units/service-units.interface';

export abstract class ServiceUnitsService {
  abstract getDetailsServiceUnit(serviceUnitId: string): Observable<Response>;

  abstract putState(workspaceId: string, serviceUnitId: string, newState: string): Observable<Response>;

  abstract watchEventSuStateChangeOk(): Observable<void>;
}

@Injectable()
export class ServiceUnitsServiceImpl extends ServiceUnitsService {
  constructor(
    private http: Http,
    private router: Router,
    private sseService: SseService,
    private store$: Store<IStore>,
    private notification: NotificationsService
  ) {
    super();
  }

  getDetailsServiceUnit(serviceUnitId: string) {
    return this.http.get(`${environment.urlBackend}/serviceunits/${serviceUnitId}`);
  }

  putState(workspaceId: string, serviceUnitId: string, newState: string) {
    return this.http.put(`${environment.urlBackend}/workspaces/${workspaceId}/serviceunits/${serviceUnitId}`, { state: newState });
  }

  watchEventSuStateChangeOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.SU_STATE_CHANGE)
      .withLatestFrom(this
        .store$
        .select(state => [state.workspaces.selectedWorkspaceId, state.serviceUnits])
      )
      .do(([data, [selectedWorkspaceId, serviceUnits]]: [{ id: string, state: string }, [string, IServiceUnitsTable]]) => {
        if (data.state === ServiceUnitState.Unloaded) {
          this.router.navigate(['/workspaces', selectedWorkspaceId]);

          const serviceUnit = serviceUnits.byId[data.id];

          this.notification.success('Service unit unloaded', `"${serviceUnit.name}" has been unloaded`);

          this.store$.dispatch({
            type: ServiceUnits.REMOVE_SERVICE_UNIT,
            payload: { serviceUnitId: data.id }
          });
        } else {
          this.store$.dispatch({
            type: ServiceUnits.CHANGE_STATE_SUCCESS,
            payload: { serviceUnitId: data.id, newState: data.state }
          });
        }
      })
      .mapTo(null);
  }
}
