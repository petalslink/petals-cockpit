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
import { IStore } from '../interfaces/store.interface';
import { Components } from '../../features/cockpit/workspaces/state/components/components.reducer';

export abstract class ComponentsService {
  abstract getDetailsComponent(componentId: string): Observable<Response>;

  abstract putState(componentId: string, newState: string): Observable<Response>;

  abstract watchEventComponentStateChangeOk(): void;
}

@Injectable()
export class ComponentsServiceImpl extends ComponentsService {
  constructor(private http: Http, private sseService: SseService, private store$: Store<IStore>) {
    super();
  }

  getDetailsComponent(componentId: string) {
    return this.http.get(`${environment.urlBackend}/components/${componentId}`);
  }

  putState(componentId: string, newState: string) {
    return this.http.put(`${environment.urlBackend}/components/${componentId}`, { state: newState });
  }

  watchEventComponentStateChangeOk() {
    this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.COMPONENT_STATE_CHANGE)
      .do((data: {
        id: string,
        state: string
      }) => {
        this.store$.dispatch({
          type: Components.CHANGE_STATE_SUCCESS,
          payload: { componentId: data.id, newState: data.state }
        });
      })
      .subscribe();
  }
}
