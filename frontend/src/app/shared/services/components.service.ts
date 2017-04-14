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
import { IComponentsTable } from '../../features/cockpit/workspaces/state/components/components.interface';
import { EComponentState } from '../../features/cockpit/workspaces/state/components/component.interface';

export abstract class ComponentsService {
  abstract getDetailsComponent(componentId: string): Observable<Response>;

  abstract putState(workspaceId: string, componentId: string, newState: string): Observable<Response>;

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

  putState(workspaceId: string, componentId: string, newState: string) {
    return this.http.put(`${environment.urlBackend}/workspaces/${workspaceId}/components/${componentId}`, { state: newState });
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
      .withLatestFrom(this
        .store$
        .select(state => [state.workspaces.selectedWorkspaceId, state.components])
      )
      .do(([data, [selectedWorkspaceId, components]]: [{ id: string, state: string }, [string, IComponentsTable]]) => {
        if (data.state === EComponentState.Unloaded) {
          this.router.navigate(['/workspaces', selectedWorkspaceId]);

          const component = components.byId[data.id];

          this.notification.success('Component unloaded', `"${component.name}" has been unloaded`);

          this.store$.dispatch({
            type: Components.REMOVE_COMPONENT,
            payload: { componentId: data.id }
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
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.SU_DEPLOYED)
      .do(({ componentId, serviceUnit }: { componentId: string, serviceUnit: { id: string, name: string, state: string } }) => {
        this.notification.success('SU deployed', `"${serviceUnit.name}" has been deployed`);

        this.store$.dispatch({
          type: Components.DEPLOY_SERVICE_UNIT_SUCCESS,
          payload: { componentId, serviceUnit }
        });
      })
      .mapTo(null);
  }
}
