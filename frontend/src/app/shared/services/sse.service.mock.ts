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
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../environments/environment';
import { SseWorkspaceEvent } from './sse.service';
import { getNewWorkspace, getNewBusFull } from '../../../mocks/workspace-id-wks-0';

@Injectable()
export class SseServiceMock {
  private _isSseOpened = false;

  private _registeredEvents: Map<string, Subject<any>> = new Map();

  constructor() { }

  // call that method from another mock to simulate an SSE event
  public triggerSseEvent(eventName: string, data?: any) {
    switch (eventName) {
      case SseWorkspaceEvent.WORKSPACE_CONTENT:
        this._registeredEvents.get(eventName).next(getNewWorkspace(data));
        break;

      case SseWorkspaceEvent.BUS_IMPORT_OK:
        this._registeredEvents.get(eventName).next(getNewBusFull());
        break;

      case SseWorkspaceEvent.BUS_DELETED:
        this._registeredEvents.get(eventName).next({ id: data.id });
        break;
    }
  }

  public watchWorkspaceRealTime(workspaceId: string) {
    if (this._isSseOpened && environment.debug) {
      console.debug('closing previous sse connection');
    }

    this._isSseOpened = true;

    if (environment.debug) {
      console.debug('subscribing to a new sse connection');
    }

    // foreach event
    SseWorkspaceEvent.allEvents.forEach(eventName => {
      if (!this._registeredEvents.has(eventName)) {
        this._registeredEvents.set(eventName, new Subject());
      }

      const eventListener = ({ data }: { data: string }) => {
        this._registeredEvents.get(eventName).next(data);
      };

      this._registeredEvents.set(eventName, this._registeredEvents.get(eventName));
    });

    return Observable.of(null);
  }

  public subscribeToWorkspaceEvent(eventName: string) {
    if (this._registeredEvents.has(eventName)) {
      return this._registeredEvents.get(eventName).asObservable().delay(environment.sseDelay);
    }

    if (environment.debug) {
      console.error(`
        try to subscribeToWorkspaceEvent with an event name ${eventName} but no event of this name was watching the SSE.
        Have you call watchWorkspaceRealTime first ? Is the event listed in SseWorkspaceEvent class ?
      `);
    }

    return Observable.empty();
  }
}
