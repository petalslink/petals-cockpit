// angular modules
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// rxjs
import { Observable, Observer } from 'rxjs';

// sse
import IOnMessageEvent = sse.IOnMessageEvent;

// our environment
import { environment } from '../../../environments/environment';

// our helpers
import { replaceIds } from '../helpers/helper';

// our interfaces
import { IBus } from '../interfaces/petals.interface';

@Injectable()
export class SseMockService {
  private observer: Observer<any>;
  private timeoutSse: Array<any> = [];

  constructor(private http: Http) { }

  subscribeToMessage(idWorkspace): Observable<IOnMessageEvent> {
    return Observable.create(observer => {
      if (environment.debug) {
        console.debug('subscribing to a new sse connection');
      }

      this.observer = observer;

      return () => {
        // unsubscribe
        if (environment.debug) {
          console.debug('closing previous sse connection');
        }

        let i = this.timeoutSse.length - 1;

        while (this.timeoutSse.length > 0) {
          // cancel every timeout of the mock ...
          clearTimeout(this.timeoutSse[i]);

          // and clean the timeout array
          this.timeoutSse.pop();
          i--;
        }

        this.observer.complete();
      };
    });
  }

  // used only for the mock
  triggerSse(bus: IBus) {
    // wait before simulating an sse response
    let timeoutSseTmp = setTimeout(() => {
      this.http.get('./mocks-json/imported-bus.json')
        .map(data => data.json())
        .subscribe((newBus: IBus) => {
          // replace every ID by a generated UUID
          replaceIds(newBus);

          // ... but keep the original bus ID
          newBus.id = bus.id;

          if (environment.debug) {
            console.debug('sse : A bus was added :', newBus);
          }

          this.observer.next({
            event: 'BUS_IMPORT_OK',
            data: newBus
          });
        });
    }, environment.sseDelay);

    this.timeoutSse.push(timeoutSseTmp);
  }
}
