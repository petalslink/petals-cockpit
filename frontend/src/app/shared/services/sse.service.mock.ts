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
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { SseWorkspaceEvent } from './sse.service';
import { workspacesService } from '../../../mocks/workspaces-mock';
import { SseService } from './sse.service';

@Injectable()
export class SseServiceMock extends SseService {
  private isSseOpened = false;

  private registeredEvents: Map<string, Subject<any>> = new Map();

  constructor() {
    super();
  }

  // call that method from another mock to simulate an SSE event
  public triggerSseEvent(eventName: string, data: any) {
    if (this.registeredEvents.has(eventName)) {
      if (environment.debug) {
        console.debug('SSE: ', eventName, data);
      }
      this.registeredEvents.get(eventName).next(data);
    } else if (environment.debug) {
      console.error(`
        Tried to triggerSseEvent for ${eventName}, but no event of this name was watching the SSE.
        Did you call watchWorkspaceRealTime first? Is the event listed in SseWorkspaceEvent class?
      `);
    }
  }

  public watchWorkspaceRealTime(workspaceId: string) {
    this.stopWatchingWorkspace();

    this.isSseOpened = true;

    if (environment.debug) {
      console.debug('subscribing to a new sse connection');
    }

    // foreach event
    SseWorkspaceEvent.allEvents
      .filter(eventName => !this.registeredEvents.has(eventName))
      .forEach(eventName => this.registeredEvents.set(eventName, new Subject()));

    const workspaceContent = workspacesService.getWorkspaceComposed(workspaceId);

    // simulate the backend sending the first event of the SSE
    setTimeout(() => this.triggerSseEvent(SseWorkspaceEvent.WORKSPACE_CONTENT, workspaceContent), 500);

    return Observable.of(null);
  }

  public stopWatchingWorkspace() {
    if (this.isSseOpened) {
      if (environment.debug) {
        console.debug('closing previous sse connection');
      }
    }

    this.isSseOpened = false;
  }

  public subscribeToWorkspaceEvent(eventName: string) {
    if (this.registeredEvents.has(eventName)) {
      return this.registeredEvents.get(eventName).asObservable().delay(environment.sseDelay);
    }

    if (environment.debug) {
      console.error(`
        Tried to subscribeToWorkspaceEvent for ${eventName}, but no event of this name was watching the SSE.
        Did you call watchWorkspaceRealTime first? Is the event listed in SseWorkspaceEvent class?
      `);
    }

    return Observable.empty();
  }
}
