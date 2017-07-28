/**
 * Copyright (C) 2017 Linagora
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

import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

import { environment } from '../../../environments/environment';

export class SseWorkspaceEvent {
  public static readonly events: SseWorkspaceEvent[] = [];

  public static readonly BUS_IMPORT = new SseWorkspaceEvent('BUS_IMPORT');
  public static readonly BUS_IMPORT_OK = new SseWorkspaceEvent('BUS_IMPORT_OK');
  public static readonly WORKSPACE_CONTENT = new SseWorkspaceEvent(
    'WORKSPACE_CONTENT'
  );
  public static readonly BUS_IMPORT_ERROR = new SseWorkspaceEvent(
    'BUS_IMPORT_ERROR'
  );
  public static readonly SA_STATE_CHANGE = new SseWorkspaceEvent(
    'SA_STATE_CHANGE'
  );
  public static readonly COMPONENT_STATE_CHANGE = new SseWorkspaceEvent(
    'COMPONENT_STATE_CHANGE'
  );
  public static readonly BUS_DELETED = new SseWorkspaceEvent('BUS_DELETED');
  public static readonly WORKSPACE_DELETED = new SseWorkspaceEvent(
    'WORKSPACE_DELETED'
  );
  public static readonly SA_DEPLOYED = new SseWorkspaceEvent('SA_DEPLOYED');
  public static readonly COMPONENT_DEPLOYED = new SseWorkspaceEvent(
    'COMPONENT_DEPLOYED'
  );
  public static readonly SL_DEPLOYED = new SseWorkspaceEvent('SL_DEPLOYED');
  public static readonly SL_STATE_CHANGE = new SseWorkspaceEvent(
    'SL_STATE_CHANGE'
  );

  public static readonly ON_MESSAGE = SseWorkspaceEvent.toAction('On Message');

  public readonly action: string;

  public static toAction(event: string) {
    return `[SSE Event] ${event}`;
  }

  private constructor(public readonly event: string) {
    this.action = SseWorkspaceEvent.toAction(event);
    SseWorkspaceEvent.events.push(this);
  }
}

export abstract class SseService {
  abstract watchWorkspaceRealTime(workspaceId: string): Observable<Action>;
  abstract stopWatchingWorkspace();
}

@Injectable()
export class SseServiceImpl extends SseService {
  private current: {
    sse: sse.IEventSourceStatic;
    observer: Subscriber<Action>;
  } = null;

  watchWorkspaceRealTime(workspaceId: string): Observable<Action> {
    this.stopWatchingWorkspace();

    return new Observable<Action>(observer => {
      if (environment.debug) {
        console.debug('subscribing to a new sse connection');
      }

      const es = new EventSource(
        `${environment.urlBackend}/workspaces/${workspaceId}/content`
      );

      const cleanup = () => {
        // in case it has been closed or it's an old connection...
        if (!this.current || es !== this.current.sse) {
          if (environment.debug) {
            console.debug('closing old stale sse connection');
          }

          observer.complete();
          es.close();
          return true;
        } else {
          return false;
        }
      };

      SseWorkspaceEvent.events.forEach(event => {
        es.addEventListener(event.event, ev => {
          if (!cleanup()) {
            const json = JSON.parse((ev as any).data);
            observer.next({
              type: event.action,
              payload: json,
            });
          }
        });
      });

      es.onmessage = ev => {
        if (!cleanup()) {
          observer.next({
            type: SseWorkspaceEvent.ON_MESSAGE,
            payload: ev.data,
          });
        }
      };

      es.onerror = ev => {
        if (!cleanup()) {
          // if it's closed, it is a fatal error and it couldn't reconnect
          // else it will just reconnect and all is well from the observable point of view
          if (
            (ev.target as sse.IEventSourceStatic).readyState ===
            EventSource.CLOSED
          ) {
            observer.error('connection was closed');
          }
        }
      };

      this.current = { sse: es, observer };

      return () => this.stopWatchingWorkspace();
    });
  }

  stopWatchingWorkspace() {
    if (this.current) {
      const c = this.current;
      this.current = null;

      if (environment.debug) {
        console.debug('closing sse connection');
      }

      c.observer.complete();
      c.sse.close();
    }
  }
}
