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
import { NotificationsService } from 'angular2-notifications';
import { Store } from '@ngrx/store';

import { environment } from './../../../environments/environment';
import { SseService, SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/interfaces/store.interface';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';
import { toJavascriptMap } from 'app/shared/helpers/map.helper';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.reducer';
import { IComponentBackendSSE } from 'app/shared/services/components.service';

export interface IContainerBackendSSECommon {
  id: string;
  name: string;
  busId: string;
}

export interface IContainerBackendDetailsCommon {
  ip: string;
  port: number;
  systemInfo: string;
}

export interface IContainerBackendSSE extends IContainerBackendSSECommon {
  components: string[];
  serviceAssemblies: string[];
}

export interface IContainerBackendDetails extends IContainerBackendDetailsCommon {
  reachabilities: string[];
}

export abstract class ContainersService {
  abstract getDetailsContainer(containerId: string): Observable<Response>;

  abstract deployComponent(workspaceId: string, containerId: string, file: File): Observable<Response>;

  abstract deployServiceAssembly(workspaceId: string, containerId: string, file: File): Observable<Response>;

  abstract watchEventComponentDeployedOk(): Observable<void>;
}

@Injectable()
export class ContainersServiceImpl extends ContainersService {
  constructor(
    private http: Http,
    private store$: Store<IStore>,
    private sseService: SseService,
    private notification: NotificationsService
  ) {
    super();
  }

  getDetailsContainer(containerId: string) {
    return this.http.get(`${environment.urlBackend}/containers/${containerId}`);
  }

  deployComponent(workspaceId: string, containerId: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${environment.urlBackend}/workspaces/${workspaceId}/containers/${containerId}/components`, formData);
  }

  deployServiceAssembly(workspaceId: string, containerId: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${environment.urlBackend}/workspaces/${workspaceId}/containers/${containerId}/serviceassemblies`, formData);
  }

  watchEventComponentDeployedOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.COMPONENT_DEPLOYED)
      .do((data: any) => {
        const components = toJavascriptMap<IComponentBackendSSE>(data.components);

        // there is only one component deployed here
        const component = components.byId[components.allIds[0]];

        this.notification.success('Component deployed', `"${component.name}" has been deployed`);

        this.store$.dispatch(batchActions([
          // add the component
          { type: Components.ADD_COMPONENTS_SUCCESS, payload: components },
          // add it to the container
          { type: Containers.DEPLOY_COMPONENT_SUCCESS, payload: component }
        ]));
      })
      .mapTo(null);
  }
}
