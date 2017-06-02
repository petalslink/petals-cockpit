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
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';

import { environment } from './../../../environments/environment';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { IStore } from '../interfaces/store.interface';
import { Components } from '../../features/cockpit/workspaces/state/components/components.reducer';
import { EComponentState, ComponentState } from '../../features/cockpit/workspaces/state/components/component.interface';
import { toJavascriptMap } from 'app/shared/helpers/map.helper';
import { IServiceUnitBackendSSE } from 'app/features/cockpit/workspaces/state/service-units/service-unit.interface';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.reducer';
import { IServiceAssemblyBackendSSE } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assembly.interface';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';

export abstract class ComponentsService {
  abstract getDetailsComponent(componentId: string): Observable<Response>;

  abstract putState(
    workspaceId: string,
    componentId: string,
    newState: ComponentState,
    parameters: { [key: string]: string }
  ): Observable<Response>;

  abstract deploySu(workspaceId: string, componentId: string, file: File, serviceUnitName: string): Observable<Response>;

  abstract watchEventComponentStateChangeOk(): Observable<void>;

  abstract watchEventSaDeployedOk(): Observable<void>;
}

@Injectable()
export class ComponentsServiceImpl extends ComponentsService {
  constructor(
    private http: Http,
    private router: Router,
    private sseService: SseService,
    private store$: Store<IStore>,
    private notification: NotificationsService
  ) {
    super();
  }

  getDetailsComponent(componentId: string) {
    return this.http.get(`${environment.urlBackend}/components/${componentId}`);
  }

  putState(workspaceId: string, componentId: string, newState: ComponentState, parameters: { [key: string]: string }) {
    return this.http.put(`${environment.urlBackend}/workspaces/${workspaceId}/components/${componentId}`, { state: newState, parameters });
  }

  deploySu(workspaceId: string, componentId: string, file: File, serviceUnitName: string) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', serviceUnitName);

    return this.http.post(`${environment.urlBackend}/workspaces/${workspaceId}/components/${componentId}/serviceunits`, formData);
  }

  watchEventComponentStateChangeOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.COMPONENT_STATE_CHANGE)
      .withLatestFrom(this.store$)
      .do(([data, store]: [{ id: string, state: ComponentState }, IStore]) => {
        if (data.state === EComponentState.Unloaded) {
          const component = store.components.byId[data.id];
          const container = store.containers.byId[component.containerId];

          this.router.navigate(['/workspaces', store.workspaces.selectedWorkspaceId]);

          this.notification.success('Component unloaded', `"${component.name}" has been unloaded`);

          this.store$.dispatch({
            type: Components.REMOVE_COMPONENT,
            payload: { containerId: container.id, componentId: data.id }
          });
        } else {
          this.store$.dispatch({
            type: Components.CHANGE_STATE_SUCCESS,
            payload: { componentId: data.id, newState: data.state }
          });
        }
      })
      .mapTo(null);
  }

  watchEventSaDeployedOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.SA_DEPLOYED)
      .do((data: any) => {
        const serviceAssemblies = toJavascriptMap<IServiceAssemblyBackendSSE>(data.serviceAssemblies);
        const serviceUnits = toJavascriptMap<IServiceUnitBackendSSE>(data.serviceUnits);

        const serviceAssemby = serviceAssemblies.byId[serviceAssemblies.allIds[0]];

        this.notification.success('SA deployed', `"${serviceAssemby.name}" has been deployed`);

        const actions = serviceUnits.allIds
          .map(id => ({ type: Components.DEPLOY_SERVICE_UNIT_SUCCESS, payload: serviceUnits.byId[id] }));

        this.store$.dispatch(batchActions([
          { type: ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS, payload: serviceAssemblies },
          { type: ServiceUnits.ADD_SERVICE_UNITS_SUCCESS, payload: serviceUnits },
          { type: Containers.DEPLOY_SERVICE_ASSEMBLY_SUCCESS, payload: serviceAssemby },
          ...actions
        ]));
      })
      .mapTo(null);
  }
}
