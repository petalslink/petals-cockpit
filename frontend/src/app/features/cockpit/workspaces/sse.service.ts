import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { environment } from './../../../../environments/environment';

// define all the workspace events
export class SseWorkspaceEvent {
  public static BUS_IMPORT_OK = 'BUS_IMPORT_OK';
  public static WORKSPACE_CONTENT = 'WORKSPACE_CONTENT';
  public static BUS_IMPORT_ERROR = 'BUS_IMPORT_ERROR';
  public static SU_STATE_CHANGE = 'SU_STATE_CHANGE';

  public static get allEvents() {
    return [
      SseWorkspaceEvent.BUS_IMPORT_OK,
      SseWorkspaceEvent.WORKSPACE_CONTENT,
      SseWorkspaceEvent.BUS_IMPORT_ERROR,
      SseWorkspaceEvent.SU_STATE_CHANGE
    ];
  }
}

@Injectable()
export class SseService {
  /**
   * _currentSse
   *
   * holds the current sse connection
   *
   * @private
   * @type {*}
   */
  private _currentSse$: any;

  /**
   * _registeredEvents
   *
   * holds a map containing all the events that we need to watch
   * in order to notify subscribers
   *
   * @private
   * @type {Map<string, Subject<any>>}
   * @memberOf WorkspacesService
   */
  private _registeredEvents: Map<string, { eventListener: any, subject$: Subject<any> }> = new Map();

  constructor() { }

  // for mock only
  public triggerSseEvent(eventName: string, data?: any) { }

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
  public watchWorkspaceRealTime(workspaceId: string) {
    if (typeof this._currentSse$ !== 'undefined' && this._currentSse$ !== null) {
      if (environment.debug) {
        console.debug('closing previous sse connection');
      }

      this._currentSse$.close();
    }

    if (environment.debug) {
      console.debug('subscribing to a new sse connection');
    }

    this._currentSse$ = new EventSource(`${environment.urlBackend}/workspaces/${workspaceId}`);

    // foreach event
    SseWorkspaceEvent.allEvents.forEach(eventName => {
      if (this._registeredEvents.has(eventName)) {
        // if event already exists, remove the event listener from sse
        const eventListenerToRemove = this._registeredEvents.get(eventName).eventListener;
        this._currentSse$.removeEventListener(eventName, eventListenerToRemove);
      } else {
        // if event doesn't exist, create a subject for it ...
        this._registeredEvents.set(eventName, { eventListener: null, subject$: new Subject() });
      }

      // in both cases, add the new event listener (it was either removed or didn't exist)
      const eventListener = ({ data }: { data: string }) => {
        this._registeredEvents.get(eventName).subject$.next(JSON.parse(data));
      };

      this._registeredEvents.set(eventName, {
        eventListener,
        subject$: this._registeredEvents.get(eventName).subject$
      });

      this._currentSse$.addEventListener(eventName, eventListener);
    });

    return Observable.of(null);
  }

  /**
   * subscribeToWorkspaceEvent
   *
   * return an observable to observe a certain type of SSE event
   *
   * @param {string} eventName : The name event to observe
   *
   * @return {Observable} Observable which is triggered every time there's the event `eventName`
   */
  public subscribeToWorkspaceEvent(eventName: string) {
    if (this._registeredEvents.has(eventName)) {
      return this._registeredEvents.get(eventName).subject$.asObservable();
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
