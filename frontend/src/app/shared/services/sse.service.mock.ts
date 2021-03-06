/**
 * Copyright (C) 2017-2020 Linagora
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
import { Action } from '@ngrx/store';
import { Observable, Subscriber } from 'rxjs';

import { environment } from '@env/environment';
import { workspacesService } from '@mocks/workspaces-mock';
import { SseActions, SseService } from './sse.service';

@Injectable()
export class SseServiceMock extends SseService {
  private current: Subscriber<Action> = null;

  constructor() {
    super();
  }

  // call that method from another mock to simulate an SSE event
  public triggerSseEvent(eventName: string, data: any) {
    if (environment.debug) {
      console.debug('SSE: ', eventName, data);
    }

    const generateEvent = SseActions.events[eventName];

    if (generateEvent) {
      this.current.next(generateEvent(data));
    } else {
      throw new Error(`${eventName} does not exist? bug!`);
    }
  }

  public watchWorkspaceRealTime(id: string): Observable<Action> {
    this.stopWatchingWorkspace();

    return new Observable<Action>(observer => {
      if (environment.debug) {
        console.debug('subscribing to a new sse connection');
      }

      this.current = observer;

      const workspace = workspacesService.get(id);

      if (workspace) {
        // simulate the backend sending the first event of the SSE
        setTimeout(
          () =>
            this.triggerSseEvent(
              SseActions.WorkspaceContentSse,
              workspace.toFullObj()
            ),
          500
        );
      } else {
        setTimeout(() => this.current.error('unknown workspace id'), 500);
      }
    });
  }

  public stopWatchingWorkspace() {
    if (this.current) {
      if (environment.debug) {
        console.debug('closing previous sse connection');
      }

      this.current.complete();
      this.current = null;
    }
  }
}
