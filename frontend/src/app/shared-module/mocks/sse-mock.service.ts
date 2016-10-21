// angular modules
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// rxjs
import { Observable, Observer } from 'rxjs';

// generate a UUID
/* tslint:disable */
let generateUuidV4 = a => a?(a^Math.random()*16>>a/4)
  .toString(16):(<any>[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,generateUuidV4);
/* tslint:enable */

// replace IDs in the json received
// by generated UUID
let replaceIds = obj => {
  if (typeof obj.id !== 'undefined') {
    obj.id = generateUuidV4(null);
  }

  for (let i in obj) {
    if (typeof obj[i] === 'object') {
      replaceIds(obj[i]);
    }
  }
};

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
  triggerSse(timer: number) {
    this.http.get('./mocks-json/imported-bus.json')
      .map(data => data.json())
      .subscribe(newBus => {
        // replace every ID by a generated UUID
        replaceIds(newBus);

        // wait before simulating an sse response
        setTimeout(() => {
          this.observer.next({
            event: 'BUS_IMPORTED',
            data: newBus
          });
        }, timer);
      });
  }
}
