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

export abstract class ContainersService {
  abstract getDetailsContainer(containerId: string): Observable<Response>;

  abstract deployComponent(workspaceId: string, containerId: string, file: File, componentName: string): Observable<Response>;

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

  deployComponent(workspaceId: string, containerId: string, file: File, componentName: string) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', componentName);

    return this.http.post(`${environment.urlBackend}/workspaces/${workspaceId}/containers/${containerId}/components`, formData);
  }

  watchEventComponentDeployedOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.COMPONENT_DEPLOYED)
      .do(({ containerId, component }: { containerId: string, component: { id: string, name: string, state: string } }) => {
        this.notification.success('Component deployed', `"${component.name}" has been deployed`);

        this.store$.dispatch({
          type: Containers.DEPLOY_COMPONENT_SUCCESS,
          payload: { containerId, component }
        });
      })
      .mapTo(null);
  }
}
