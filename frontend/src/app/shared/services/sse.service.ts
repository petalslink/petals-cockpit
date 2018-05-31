/**
 * Copyright (C) 2017-2018 Linagora
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
import { Observable, Subscriber } from 'rxjs';

import {
  IBusBackendSSE,
  IBusInProgressBackend,
} from 'app/shared/services/buses.service';
import {
  ComponentState,
  IComponentBackendSSE,
} from 'app/shared/services/components.service';
import { IContainerBackendSSE } from 'app/shared/services/containers.service';
import { IEndpointBackendSSE } from 'app/shared/services/endpoints.service';
import { IInterfaceBackendSSE } from 'app/shared/services/interfaces.service';
import {
  IServiceAssemblyBackendSSE,
  ServiceAssemblyState,
} from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { IServiceBackendSSE } from 'app/shared/services/services.service';
import {
  ISharedLibraryBackendSSE,
  SharedLibraryState,
} from 'app/shared/services/shared-libraries.service';
import { IUserBackend } from 'app/shared/services/users.service';
import { IWorkspaceBackend } from 'app/shared/services/workspaces.service';
import { environment } from 'environments/environment';

export namespace SseActions {
  export type All =
    | typeof BusImportSse
    | typeof BusImportOkSse
    | typeof SseActions.WorkspaceContentSse
    | typeof SseActions.BusImportErrorSse
    | typeof SseActions.SaStateChangeSse
    | typeof SseActions.ComponentStateChangeSse
    | typeof SseActions.BusDeletedSse
    | typeof SseActions.WorkspaceDeletedSse
    | typeof SseActions.SaDeployedSse
    | typeof SseActions.ComponentDeployedSse
    | typeof SseActions.SlDeployedSse
    | typeof SseActions.SlStateChangeSse
    | typeof SseActions.ServicesUpdatedSse;

  export const BusImportSse = 'BUS_IMPORT';
  export const BusImportType = '[Sse] Bus import';
  export class BusImport implements Action {
    readonly type = BusImportType;
    constructor(public readonly payload: IBusInProgressBackend) {}
  }

  export const BusImportOkSse = 'BUS_IMPORT_OK';
  export const BusImportOkType = '[Sse] Bus import ok';
  export class BusImportOk implements Action {
    readonly type = BusImportOkType;
    constructor(
      public readonly payload: {
        buses: { [key: string]: IBusBackendSSE };
        containers: { [key: string]: IContainerBackendSSE };
        components: { [key: string]: IComponentBackendSSE };
        endpoints: { [key: string]: IEndpointBackendSSE };
        interfaces: { [key: string]: IInterfaceBackendSSE };
        serviceAssemblies: { [key: string]: IServiceAssemblyBackendSSE };
        serviceUnits: { [key: string]: IServiceUnitBackendSSE };
        services: { [key: string]: IServiceBackendSSE };
        sharedLibraries: { [key: string]: ISharedLibraryBackendSSE };
      }
    ) {}
  }

  export const WorkspaceContentSse = 'WORKSPACE_CONTENT';
  export const WorkspaceContentType = '[Sse] Workspace content';
  export class WorkspaceContent implements Action {
    readonly type = WorkspaceContentType;
    constructor(
      public readonly payload: {
        workspace: IWorkspaceBackend;
        users: { [key: string]: IUserBackend };
        busesInProgress: { [key: string]: IBusInProgressBackend };
        buses: { [key: string]: IBusBackendSSE };
        containers: { [key: string]: IContainerBackendSSE };
        components: { [key: string]: IComponentBackendSSE };
        endpoints: { [key: string]: IEndpointBackendSSE };
        interfaces: { [key: string]: IInterfaceBackendSSE };
        serviceAssemblies: { [key: string]: IServiceAssemblyBackendSSE };
        serviceUnits: { [key: string]: IServiceUnitBackendSSE };
        services: { [key: string]: IServiceBackendSSE };
        sharedLibraries: { [key: string]: ISharedLibraryBackendSSE };
      }
    ) {}
  }

  export const BusImportErrorSse = 'BUS_IMPORT_ERROR';
  export const BusImportErrorType = '[Sse] Bus import error';
  export class BusImportError implements Action {
    readonly type = BusImportErrorType;
    constructor(public readonly payload: IBusInProgressBackend) {}
  }

  export const SaStateChangeSse = 'SA_STATE_CHANGE';
  export const SaStateChangeType = '[Sse] Sa state change';
  export class SaStateChange implements Action {
    readonly type = SaStateChangeType;
    constructor(
      public readonly payload: { id: string; state: ServiceAssemblyState }
    ) {}
  }

  export const ComponentStateChangeSse = 'COMPONENT_STATE_CHANGE';
  export const ComponentStateChangeType = '[Sse] Component state change';
  export class ComponentStateChange implements Action {
    readonly type = ComponentStateChangeType;
    constructor(
      public readonly payload: { id: string; state: ComponentState }
    ) {}
  }

  export const BusDeletedSse = 'BUS_DELETED';
  export const BusDeletedType = '[Sse] Bus deleted';
  export class BusDeleted implements Action {
    readonly type = BusDeletedType;
    constructor(
      public readonly payload: {
        id: string;
        reason: string;
        content: {
          endpoints: { [key: string]: IEndpointBackendSSE };
          interfaces: { [key: string]: IInterfaceBackendSSE };
          services: { [key: string]: IServiceBackendSSE };
        };
      }
    ) {}
  }

  export const WorkspaceDeletedSse = 'WORKSPACE_DELETED';
  export const WorkspaceDeletedType = '[Sse] Workspace deleted';
  export class WorkspaceDeleted implements Action {
    readonly type = WorkspaceDeletedType;
    constructor(public readonly payload: { id: string }) {}
  }

  export const SaDeployedSse = 'SA_DEPLOYED';
  export const SaDeployedType = '[Sse] Sa deployed';
  export class SaDeployed implements Action {
    readonly type = SaDeployedType;
    constructor(
      public readonly payload: {
        serviceAssemblies: { [key: string]: IServiceAssemblyBackendSSE };
        serviceUnits: { [key: string]: IServiceUnitBackendSSE };
      }
    ) {}
  }

  export const ComponentDeployedSse = 'COMPONENT_DEPLOYED';
  export const ComponentDeployedType = '[Sse] Component deployed';
  export class ComponentDeployed implements Action {
    readonly type = ComponentDeployedType;
    constructor(
      public readonly payload: {
        components: { [key: string]: IComponentBackendSSE };
      }
    ) {}
  }

  export const SlDeployedSse = 'SL_DEPLOYED';
  export const SlDeployedType = '[Sse] Sl deployed';
  export class SlDeployed implements Action {
    readonly type = SlDeployedType;
    constructor(
      public readonly payload: {
        sharedLibraries: { [key: string]: ISharedLibraryBackendSSE };
      }
    ) {}
  }

  export const SlStateChangeSse = 'SL_STATE_CHANGE';
  export const SlStateChangeType = '[Sse] Sl state change';
  export class SlStateChange implements Action {
    readonly type = SlStateChangeType;
    constructor(
      public readonly payload: { id: string; state: SharedLibraryState }
    ) {}
  }

  export const ServicesUpdatedSse = 'SERVICES_UPDATED';
  export const ServicesUpdatedType = '[Sse] Services updated';
  export class ServicesUpdated implements Action {
    readonly type = ServicesUpdatedType;
    constructor(
      public readonly payload: {
        endpoints: { [key: string]: IEndpointBackendSSE };
        interfaces: { [key: string]: IInterfaceBackendSSE };
        services: { [key: string]: IServiceBackendSSE };
      }
    ) {}
  }

  /**
   * events his a map to find a Redux action based on the name of an SSE action
   */
  export const events: { [key: string]: (payload: any) => Action } = {
    [SseActions.BusImportSse]: payload => new SseActions.BusImport(payload),
    [SseActions.BusImportOkSse]: payload => new SseActions.BusImportOk(payload),
    [SseActions.WorkspaceContentSse]: payload =>
      new SseActions.WorkspaceContent(payload),
    [SseActions.BusImportErrorSse]: payload =>
      new SseActions.BusImportError(payload),
    [SseActions.SaStateChangeSse]: payload =>
      new SseActions.SaStateChange(payload),
    [SseActions.ComponentStateChangeSse]: payload =>
      new SseActions.ComponentStateChange(payload),
    [SseActions.BusDeletedSse]: payload => new SseActions.BusDeleted(payload),
    [SseActions.WorkspaceDeletedSse]: payload =>
      new SseActions.WorkspaceDeleted(payload),
    [SseActions.SaDeployedSse]: payload => new SseActions.SaDeployed(payload),
    [SseActions.ComponentDeployedSse]: payload =>
      new SseActions.ComponentDeployed(payload),
    [SseActions.SlDeployedSse]: payload => new SseActions.SlDeployed(payload),
    [SseActions.SlStateChangeSse]: payload =>
      new SseActions.SlStateChange(payload),
    [SseActions.ServicesUpdatedSse]: payload =>
      new SseActions.ServicesUpdated(payload),
  };
}

export abstract class SseService {
  abstract watchWorkspaceRealTime(workspaceId: string): Observable<Action>;
  abstract stopWatchingWorkspace(): void;
}

@Injectable()
export class SseServiceImpl extends SseService {
  private current: {
    sse: EventSource;
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

      for (const event of Object.keys(SseActions.events)) {
        es.addEventListener(event, ev => {
          if (!cleanup()) {
            const json = JSON.parse((ev as any).data);
            const generateEvent = SseActions.events[event];

            if (generateEvent) {
              observer.next(generateEvent(json));
            } else if (environment.debug) {
              console.error(
                'SseServiceImpl: Unknown action name "${eventName}"'
              );
            }
          }
        });
      }

      if (environment.debug) {
        es.onmessage = ev => {
          if (!cleanup()) {
            console.error('SseServiceImpl: Unknown message from SSE');
          }
        };
      }

      es.onerror = ev => {
        if (!cleanup()) {
          // if it's closed, it is a fatal error and it couldn't reconnect
          // else it will just reconnect and all is well from the observable point of view
          const targ = ev.target as EventSource;

          if (targ.readyState === targ.CLOSED) {
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
