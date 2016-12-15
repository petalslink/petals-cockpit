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

// rxjs
import { Observable } from 'rxjs';

// sse
import IEventSourceStatic = sse.IEventSourceStatic;
import IOnMessageEvent = sse.IOnMessageEvent;

// our environment
import { environment } from '../../../environments/environment';

// our interfaces
import { INewBus } from '../interfaces/petals.interface';

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
  triggerSse(type: string, obj: any) {

  }
}
