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
  constructor() { }

  subscribeToMessage(url) {
    return Observable.create(observer => {
      // creates event object
      let eventSource = new EventSource(`${environment.urlBackendSse}/${url}`);

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
