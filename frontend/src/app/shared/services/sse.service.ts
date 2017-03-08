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

// define all the workspace events
export class SseWorkspaceEvent {
  public static BUS_IMPORT_OK = 'BUS_IMPORT_OK';
  public static WORKSPACE_CONTENT = 'WORKSPACE_CONTENT';
  public static BUS_IMPORT_ERROR = 'BUS_IMPORT_ERROR';
  public static SU_STATE_CHANGE = 'SU_STATE_CHANGE';
  public static COMPONENT_STATE_CHANGE = 'COMPONENT_STATE_CHANGE';
  public static BUS_DELETED = 'BUS_DELETED';

  public static get allEvents() {
    return [
      SseWorkspaceEvent.BUS_IMPORT_OK,
      SseWorkspaceEvent.WORKSPACE_CONTENT,
      SseWorkspaceEvent.BUS_IMPORT_ERROR,
      SseWorkspaceEvent.SU_STATE_CHANGE,
      SseWorkspaceEvent.COMPONENT_STATE_CHANGE,
      SseWorkspaceEvent.BUS_DELETED
    ];
  }
}

export abstract class SseService {

  /**
   * watchWorkspaceRealTime
   *
   * when the user selects a workspace, this method will be call to subscribe
   * to the sse stream of that workspace. It will automatically close the previous
   * connection if another workspace was selected
   *
   * @param {string} workspaceId
   *
   * @return {function} Call the function to close the SSE stream if needed
   */
  abstract watchWorkspaceRealTime(workspaceId: string): Observable<void>;

  /**
   * subscribeToWorkspaceEvent
   *
   * return an observable to observe a certain type of SSE event
   *
   * @param {string} eventName : The name event to observe
   *
   * @return {Observable} Observable which is triggered every time there's the event `eventName`
   */
  abstract subscribeToWorkspaceEvent(eventName: string): Observable<any>;
}

@Injectable()
export class SseServiceImpl extends SseService {
  /**
   * currentSse
   *
   * holds the current sse connection
   *
   * @private
   * @type {*}
   */
  private currentSse$: any;

  /**
   * registeredEvents
   *
   * holds a map containing all the events that we need to watch
   * in order to notify subscribers
   *
   * @private
   * @type {Map<string, Subject<any>>}
   * @memberOf WorkspacesService
   */
  private registeredEvents: Map<string, { eventListener: any, subject$: Subject<any> }> = new Map();

  watchWorkspaceRealTime(workspaceId: string) {
    if (typeof this.currentSse$ !== 'undefined' && this.currentSse$ !== null) {
      if (environment.debug) {
        console.debug('closing previous sse connection');
      }

      this.currentSse$.close();
    }

    if (environment.debug) {
      console.debug('subscribing to a new sse connection');
    }

    this.currentSse$ = new EventSource(`${environment.urlBackend}/workspaces/${workspaceId}`);

    // foreach event
    SseWorkspaceEvent.allEvents.forEach(eventName => {
      if (this.registeredEvents.has(eventName)) {
        // if event already exists, remove the event listener from sse
        const eventListenerToRemove = this.registeredEvents.get(eventName).eventListener;
        this.currentSse$.removeEventListener(eventName, eventListenerToRemove);
      } else {
        // if event doesn't exist, create a subject for it ...
        this.registeredEvents.set(eventName, { eventListener: null, subject$: new Subject() });
      }

      // in both cases, add the new event listener (it was either removed or didn't exist)
      const eventListener = ({ data }: { data: string }) => {
        this.registeredEvents.get(eventName).subject$.next(JSON.parse(data));
      };

      this.registeredEvents.set(eventName, {
        eventListener,
        subject$: this.registeredEvents.get(eventName).subject$
      });

      this.currentSse$.addEventListener(eventName, eventListener);
    });

    return Observable.of(null);
  }

  subscribeToWorkspaceEvent(eventName: string) {
    if (this.registeredEvents.has(eventName)) {
      return this.registeredEvents.get(eventName).subject$.asObservable();
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
