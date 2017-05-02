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
import { EServiceUnitState, ServiceUnitState } from '../../features/cockpit/workspaces/state/service-units/service-unit.interface';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';

export abstract class ServiceUnitsService {
  abstract getDetailsServiceUnit(serviceUnitId: string): Observable<Response>;

  abstract putState(workspaceId: string, serviceAssemblyId: string, newState: ServiceUnitState): Observable<Response>;

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

  putState(workspaceId: string, serviceAssemblyId: string, newState: ServiceUnitState) {
    return this.http.put(`${environment.urlBackend}/workspaces/${workspaceId}/serviceassemblies/${serviceAssemblyId}`, { state: newState });
  }

  watchEventSuStateChangeOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.SA_STATE_CHANGE)
      .withLatestFrom(this.store$)
      .do(([data, store]: [{ id: string, state: ServiceUnitState }, IStore]) => {
        const sus = store.serviceUnits.allIds
          .map(id => store.serviceUnits.byId[id])
          .filter(su => su.serviceAssemblyId === data.id);
        if (data.state === EServiceUnitState.Unloaded && sus.length > 0) {
          this.router.navigate(['/workspaces', store.workspaces.selectedWorkspaceId]);

          // we should notify about the SA, not the SU
          this.notification.success('Service unit unloaded', `"${sus[0].name}" has been unloaded`);

          const actions = sus.map(su => ({
            type: ServiceUnits.REMOVE_SERVICE_UNIT,
            payload: { componentId: su.componentId, serviceUnitId: su.id }
          }));

          this.store$.dispatch(batchActions(actions));
        } else {
          const actions = sus.map(su => ({
            type: ServiceUnits.CHANGE_STATE_SUCCESS,
            payload: { newState: data.state, serviceUnitId: su.id }
          }));

          this.store$.dispatch(batchActions(actions));
        }
      })
      .mapTo(null);
  }
}
