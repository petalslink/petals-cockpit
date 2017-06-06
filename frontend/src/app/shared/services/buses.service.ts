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
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { IStore } from './../interfaces/store.interface';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { Buses } from './../../features/cockpit/workspaces/state/buses/buses.reducer';
import { BusesInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { ServiceUnits } from './../../features/cockpit/workspaces/state/service-units/service-units.reducer';
import { Components } from './../../features/cockpit/workspaces/state/components/components.reducer';
import { Containers } from './../../features/cockpit/workspaces/state/containers/containers.reducer';
import { environment } from './../../../environments/environment';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { IContainerBackendSSE } from 'app/shared/services/containers.service';
import { IComponentBackendSSE } from 'app/shared/services/components.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { toJavascriptMap } from 'app/shared/helpers/map.helper';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.reducer';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';

export interface IBusBackendSSECommon {
  id: string;
  name: string;
  workspaceId: string;
}

export interface IBusBackendDetailsCommon { }

export interface IBusBackendSSE extends IBusBackendSSECommon {
  containers: string[];
}

export interface IBusInProgressBackendCommon {
  id: string;
  username: string;
  port: number;
  ip: string;
  importError: string;
}

// used when we import a bus
export interface IBusImport {
  port: number;
  ip: string;
  username: string;
  password: string;
  passphrase: string;
}

export interface IBusInProgressBackend extends IBusInProgressBackendCommon { }

export interface IBusBackendDetails extends IBusBackendDetailsCommon { }

export abstract class BusesService {
  abstract postBus(idWorkspace: string, bus: IBusImport): Observable<Response>;

  abstract deleteBus(idWorkspace: string, id: string): Observable<Response>;

  abstract getDetailsBus(busId: string): Observable<Response>;

  abstract watchEventBusImport(): Observable<void>;

  abstract watchEventBusDeleted(): Observable<void>;

  abstract watchEventBusImportOk(): Observable<void>;

  abstract watchEventBusImportError(): Observable<void>;
}

@Injectable()
export class BusesServiceImpl extends BusesService {
  constructor(
    private http: Http,
    private store$: Store<IStore>,
    private router: Router,
    private sseService: SseService,
    private notifications: NotificationsService
  ) {
    super();
  }

  postBus(idWorkspace: string, bus: IBusImport) {
    return this.http.post(`${environment.urlBackend}/workspaces/${idWorkspace}/buses`, bus);
  }

  deleteBus(idWorkspace: string, id: string) {
    return this.http.delete(`${environment.urlBackend}/workspaces/${idWorkspace}/buses/${id}`);
  }

  getDetailsBus(busId: string) {
    return this.http.get(`${environment.urlBackend}/buses/${busId}`);
  }

  watchEventBusImport() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_IMPORT)
      .do(bip => this.store$.dispatch({
        type: BusesInProgress.ADD_BUSES_IN_PROGRESS,
        payload: toJavascriptMap<IBusInProgressBackend>({ [bip.id]: bip })
      }));
  }

  watchEventBusDeleted() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_DELETED)
      .withLatestFrom(this.store$)
      .do(([{ id, reason }, state]) => {
        const bus = state.buses.byId[id];
        if (bus) {
          this.notifications.info(bus.name, reason);
          this.store$.dispatch({ type: Buses.REMOVE_BUS, payload: { busId: id } });
          // redirect to current workspace
          this.router.navigate(['/workspaces', state.workspaces.selectedWorkspaceId]);
        } else {
          const bip = state.busesInProgress.byId[id];
          this.notifications.info(`${bip.ip}:${bip.port}`, reason);
          this.store$.dispatch({ type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: id });
        }
      })
      .mapTo(null);
  }

  watchEventBusImportOk() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_IMPORT_OK)
      .do((data: any) => {
        const buses = toJavascriptMap<IBusBackendSSE>(data.buses);

        // there should be only one element in there!
        const bus = buses.byId[buses.allIds[0]];

        this.notifications.success(`Bus import success`, `The import of the bus ${bus.name} succeeded`);

        this.store$.dispatch(batchActions([
          { type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: bus.id },
          { type: Buses.ADD_BUSES_SUCCESS, payload: buses },
          { type: Containers.ADD_CONTAINERS_SUCCESS, payload: toJavascriptMap<IContainerBackendSSE>(data.containers) },
          {
            type: ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS,
            payload: toJavascriptMap<IComponentBackendSSE>(data.serviceAssemblies)
          },
          { type: Components.ADD_COMPONENTS_SUCCESS, payload: toJavascriptMap<IComponentBackendSSE>(data.components) },
          { type: ServiceUnits.ADD_SERVICE_UNITS_SUCCESS, payload: toJavascriptMap<IServiceUnitBackendSSE>(data.serviceUnits) },
          { type: SharedLibraries.ADDED, payload: toJavascriptMap<ISharedLibraryBackendSSE>(data.sharedLibraries) }
        ]));
      });
  }

  watchEventBusImportError() {
    return this.sseService
      .subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_IMPORT_ERROR)
      .do((busInError: any) => {

        this.notifications.alert(`Bus import error`,
          `The import of a bus from the IP ${busInError.ip}:${busInError.port} failed`);

        this.store$.dispatch({ type: BusesInProgress.UPDATE_ERROR_BUS_IN_PROGRESS, payload: busInError });
      });
  }
}
