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

  abstract watchEventSuDeployedOk(): Observable<void>;
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

  watchEventSuDeployedOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.SA_DEPLOYED)
      .do((data: any) => {
        // TODO const serviceAssemblies = toJavascriptMap<IServiceAssemblyBackend>(data.serviceAssemblies);
        const serviceUnits = toJavascriptMap<IServiceUnitBackendSSE>(data.serviceUnits);

        // TODO for now there is only one, but expect the SA to hold many
        const serviceUnit = serviceUnits.byId[serviceUnits.allIds[0]];

        // TODO we should notify about the SA, not the SU
        this.notification.success('SU deployed', `"${serviceUnit.name}" has been deployed`);

        const actions = serviceUnits.allIds
          .map(id => serviceUnits.byId[id])
          .map(su => ({
            // add it to the component
            // TODO we should add the SA to the container
            // TODO why not rely on ADD_SERVICE_UNITS_SUCCESS?
            type: Components.DEPLOY_SERVICE_UNIT_SUCCESS,
            payload: su
          }));

        this.store$.dispatch(batchActions([
          // TODO we should call ADD_SERVICE_ASSEMBLIES_SUCCESS also
          { type: ServiceUnits.ADD_SERVICE_UNITS_SUCCESS, payload: serviceUnits },
          ...actions
        ]));
      })
      .mapTo(null);
  }
}
