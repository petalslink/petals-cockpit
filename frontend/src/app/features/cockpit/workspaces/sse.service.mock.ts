import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { environment } from './../../../../environments/environment';
import { SseWorkspaceEvent } from './sse.service';

@Injectable()
export class SseService {
  // simulate an SSE stream with a subject
  private _currentSse$: Subject<any>;

  private _registeredEvents: Map<string, { eventListener: any, subject$: Subject<any> }> = new Map();

  constructor() { }

  // call that method from another mock to simulate an SSE event
  public triggerSseEvent(eventName) {
    this._currentSse$.next(eventName);
  }

  public watchWorkspaceRealTime(workspaceId: string) {
    if (typeof this._currentSse$ !== 'undefined' && this._currentSse$ !== null) {
      if (environment.debug) {
        console.debug('closing previous sse connection');
      }
      // nothing to close in mock
    } else {
      // if it's the first time, init the subject
      this._currentSse$ = new Subject<any>();
    }

    if (environment.debug) {
      console.debug('subscribing to a new sse connection');
    }

    // foreach event
    SseWorkspaceEvent.allEvents.forEach(eventName => {
      if (!this._registeredEvents.has(eventName)) {
        this._registeredEvents.set(eventName, { eventListener: null, subject$: new Subject() });
      }

      // in both cases, add the new event listener (it was either removed or didn't exist)
      const eventListener = ({ data }: { data: string }) => {
        this._registeredEvents.get(eventName).subject$.next(data);
      };

      this._registeredEvents.set(eventName, {
        eventListener,
        subject$: this._registeredEvents.get(eventName).subject$
      });
    });
  }

  public subscribeToWorkspaceEvent(eventName: string) {
    if (this._registeredEvents.has(eventName)) {
      return this._registeredEvents.get(eventName).subject$.asObservable().delay(environment.sseDelay);
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
