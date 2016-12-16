/**
 * Copyright (C) 2016 Linagora
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

  // within the mock, make the first sse event to respond
  // that the bus couldn't be imported (based on env variable)
  private hasAlreadyFailed = false;

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
  triggerSse(type: string, obj: any) {
    // wait before simulating an sse response
    let sseDelay = environment.sseDelay;

    let action;

    if (type === 'SU_STATE_CHANGE') {
      // do not use the random timer here, just wait 3s
      sseDelay = 3000;

      action = () => {
        this.observer.next({
          event: 'SU_STATE_CHANGE',
          data: {
            id: obj.id,
            state: obj.state
          }
        });
      };
    }

    else if (type === 'BUS_IMPORT_OK') {
      let sseBusImportShouldFail = false;

      if (environment.sseFirstBusImportShouldFail && !this.hasAlreadyFailed) {
        sseBusImportShouldFail = true;
        this.hasAlreadyFailed = true;

        // if the first has to fail, just wait 3s
        sseDelay = 3000;
      }

      action = () => {
        this.http.get('mocks-json/imported-bus.json')
          .map(data => data.json())
          .subscribe((newBus: IBus) => {
            // replace every ID by a generated UUID
            replaceIds(newBus);

            // ... but keep the original bus ID
            newBus.id = obj.id;

            let debugSseMsg;

            if (sseBusImportShouldFail) {
              debugSseMsg = 'sse : An error occurred while trying to import the bus :';

              this.observer.next({
                event: 'BUS_IMPORT_ERROR',
                data: {
                  id: obj.id,
                  importIp: obj.bus.ip,
                  importPort: obj.bus.port,
                  importUsername: obj.bus.username,
                  importError: `An error occurred while trying to import the bus : ${obj.id}`
                }
              });
            }

            else {
              debugSseMsg = 'sse : A bus was added :';

              this.observer.next({
                event: 'BUS_IMPORT_OK',
                data: newBus
              });
            }

            if (environment.debug) {
              console.debug(debugSseMsg, newBus);
            }
          });
      };
    }

    let timeoutSseTmp = setTimeout(action, sseDelay);

    this.timeoutSse.push(timeoutSseTmp);
  }
}
