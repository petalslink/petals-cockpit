// angular modules
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// rxjs
import { Observable, Observer } from 'rxjs';

// our environment
import { environment } from '../../../environments/environment';

// our helpers
import { replaceIds } from '../helpers/helper';

// our interfaces
import { IBus } from '../interfaces/petals.interface';

// our actions
import { BUS_IMPORTED } from '../reducers/workspaces.reducer';

@Injectable()
export class SseMockService {
  private observer: Observer<any>;

  constructor(private http: Http) { }

  subscribeToMessage(url) {
    return Observable.create(observer => {
      this.observer = observer;

      return () => {
        // unsubscribe
      };
    });
  }

  // used only for the mock
  triggerSse(bus: IBus) {
    this.http.get('./mocks-json/imported-bus.json')
      .map(data => data.json())
      .subscribe((newBus: IBus) => {
        // replace every ID by a generated UUID
        replaceIds(newBus);

        // ... but keep the original bus ID
        newBus.id = bus.id;

        // wait before simulating an sse response
        setTimeout(() => {
          this.observer.next({
            event: BUS_IMPORTED,
            data: newBus
          });
        }, environment.sseDelay);
      });
  }
}
