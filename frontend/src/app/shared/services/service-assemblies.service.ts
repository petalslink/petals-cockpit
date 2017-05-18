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
import {
  EServiceAssemblyState,
  ServiceAssemblyState
} from '../../features/cockpit/workspaces/state/service-assemblies/service-assembly.interface';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';

export abstract class ServiceAssembliesService {
  abstract getDetailsServiceAssembly(serviceAssemblyId: string): Observable<Response>;

  abstract putState(workspaceId: string, serviceAssemblyId: string, newState: ServiceAssemblyState): Observable<Response>;

  abstract watchEventSaStateChangeOk(): Observable<void>;
}

@Injectable()
export class ServiceAssembliesServiceImpl extends ServiceAssembliesService {
  constructor(
    private http: Http,
    private router: Router,
    private sseService: SseService,
    private store$: Store<IStore>,
    private notification: NotificationsService
  ) {
    super();
  }

  getDetailsServiceAssembly(serviceAssemblyId: string) {
    return this.http.get(`${environment.urlBackend}/serviceassemblies/${serviceAssemblyId}`);
  }

  putState(workspaceId: string, serviceAssemblyId: string, newState: ServiceAssemblyState) {
    return this.http.put(`${environment.urlBackend}/workspaces/${workspaceId}/serviceassemblies/${serviceAssemblyId}`, { state: newState });
  }

  watchEventSaStateChangeOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.SA_STATE_CHANGE)
      .withLatestFrom(this.store$)
      .do(([data, store]: [{ id: string, state: ServiceAssemblyState }, IStore]) => {
        const sa = store.serviceAssemblies.byId[data.id];

        if (data.state === EServiceAssemblyState.Unloaded) {
          this.router.navigate(['/workspaces', store.workspaces.selectedWorkspaceId]);

          this.notification.success('Service assembly unloaded', `'${sa.name}' has been unloaded`);

          const actions = [
            {
              type: ServiceAssemblies.REMOVE_SERVICE_ASSEMBLY,
              payload: {
                containerId: sa.containerId,
                serviceAssemblyId: sa.id
              }
            },

            ...sa.serviceUnits.map(suId => ({
              type: ServiceUnits.REMOVE_SERVICE_UNIT,
              payload: {
                componentId: store.serviceUnits.byId[suId].componentId,
                serviceUnitId: suId
              }
            }))
          ];

          this.store$.dispatch(batchActions(actions));
        } else {
          this.store$.dispatch({
            type: ServiceAssemblies.CHANGE_STATE_SUCCESS,
            payload: { newState: data.state, serviceAssemblyId: sa.id }
          });
        }
      })
      .mapTo(null);
  }
}
