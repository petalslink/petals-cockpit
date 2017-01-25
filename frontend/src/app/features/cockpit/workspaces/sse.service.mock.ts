import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

import { environment } from './../../../../environments/environment';
import { SseWorkspaceEvent } from './sse.service';
import { getNewWorkspace, getNewBusFull } from './../../../../mocks/workspace-id-wks-0';

@Injectable()
export class SseServiceMock {
  private _isSseOpened = false;

  private _registeredEvents: Map<string, Subject<any>> = new Map();

  constructor() { }

  // call that method from another mock to simulate an SSE event
  public triggerSseEvent(eventName: string, data?: any) {
    switch (eventName) {
      case SseWorkspaceEvent.WORKSPACE_CONTENT:
        this._registeredEvents.get(eventName).next(this.getDataWorkspaceContent(data));
        break;

      case SseWorkspaceEvent.BUS_IMPORT_OK:
        this._registeredEvents.get(eventName).next(this.getDataBusImportOk(data));
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

  // --------------------------------------------------------

  private getDataWorkspaceContent(idWorkspace: string) {
    return JSON.stringify(getNewWorkspace(idWorkspace));
  }

  private getDataBusImportOk(idWorkspace: string) {
    return JSON.stringify(getNewBusFull(idWorkspace));
  }
}
