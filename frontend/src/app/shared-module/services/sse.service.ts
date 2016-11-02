// angular modules
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

// sse
import IEventSourceStatic = sse.IEventSourceStatic;
import IOnMessageEvent = sse.IOnMessageEvent;

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { IBus } from '../interfaces/petals.interface';

@Injectable()
export class SseService {
  private currentSse: IEventSourceStatic;

  constructor() { }

  subscribeToMessage(idWorkspace): Observable<IOnMessageEvent> {
    if (typeof this.currentSse !== 'undefined' && this.currentSse !== null) {
      if (environment.debug) {
        console.debug('closing previous sse connection');
      }

      this.currentSse.close();
    }

    return Observable.create(observer => {
      if (environment.debug) {
        console.debug('subscribing to a new sse connection');
      }

      // creates event object
      let eventSource = new EventSource(`${environment.urlBackend}/workspaces/${idWorkspace}/events`);

      this.currentSse = eventSource;

      // listing server messages
      eventSource.addEventListener('WORKSPACE_CHANGE', (e: any) => {
        e = JSON.parse(e.data);

        observer.next({ event: e.event, data: e.data });
      });

      eventSource.onerror = err => {
        console.error(`Error on SSE stream for workspace ${idWorkspace}`, err);
        observer.error('Event source failed');
      };

      eventSource.onmessage = event => {
        console.warn(`Unexpected event on SSE stream for workspace ${idWorkspace}`, event);
      };

      eventSource.onopen = event => {
        console.info(`SSE stream opened for workspace ${idWorkspace}`, event);
      };

      return () => {
        eventSource.close();
      };
    });
  }

  // only used for mock !
  // but we do have to put it here otherwise we'd have to import the mock
  // and it would also be in prod
  triggerSse(bus: IBus) {

  }
}
