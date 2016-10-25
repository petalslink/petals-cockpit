// angular modules
import { Injectable } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { IBus } from '../interfaces/petals.interface';

@Injectable()
export class SseService {
  private currentSse;

  constructor() { }

  subscribeToMessage(idWorkspace) {
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
      let eventSource = new EventSource(`${environment.urlBackendSse}/workspaces/${idWorkspace}`);

      this.currentSse = eventSource;

      // listing server messages
      eventSource.onmessage = (evt) => {
        observer.next(evt.data);
      };

      eventSource.onerror = () => {
        observer.error('Event source failed');
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
