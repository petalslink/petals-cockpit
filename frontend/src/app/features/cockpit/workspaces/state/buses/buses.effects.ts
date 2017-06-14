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
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Action, Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { Buses } from './buses.reducer';
import { IStore } from 'app/shared/interfaces/store.interface';
import {
  BusesService,
  IBusBackendSSE,
} from 'app/shared/services/buses.service';
import { environment } from 'environments/environment';
import { SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { toJavascriptMap } from 'app/shared/helpers/map.helper';
import { batchActions } from 'app/shared/helpers/batch-actions.helper';
import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.reducer';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';
import { ServiceAssemblies } from 'app/features/cockpit/workspaces/state/service-assemblies/service-assemblies.reducer';
import { IContainerBackendSSE } from 'app/shared/services/containers.service';
import { IComponentBackendSSE } from 'app/shared/services/components.service';
import { Components } from 'app/features/cockpit/workspaces/state/components/components.reducer';
import { ServiceUnits } from 'app/features/cockpit/workspaces/state/service-units/service-units.reducer';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.reducer';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';

@Injectable()
export class BusesEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<IStore>,
    private busesService: BusesService,
    private router: Router,
    private notifications: NotificationsService
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchDeleted$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.BUS_DELETED.action)
    .withLatestFrom(this.store$)
    .filter(([action, state]) => !!state.buses.byId[action.payload.id])
    .map(([action, state]) => {
      const { id, reason } = action.payload;
      const bus = state.buses.byId[id];

      this.notifications.info(bus.name, reason);

      if (state.buses.selectedBusId === id) {
        this.router.navigate([
          '/workspaces',
          state.workspaces.selectedWorkspaceId,
        ]);
      }

      return {
        type: Buses.REMOVE_BUS,
        payload: { busId: id },
      };
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  watchImportOk$: Observable<Action> = this.actions$
    .ofType(SseWorkspaceEvent.BUS_IMPORT_OK.action)
    .withLatestFrom(this.store$)
    .map(([action, state]) => {
      const data = action.payload;
      const buses = toJavascriptMap<IBusBackendSSE>(data.buses);

      // there should be only one element in there!
      const bus = buses.byId[buses.allIds[0]];

      this.notifications.success(
        `Bus import success`,
        `The import of the bus ${bus.name} succeeded`
      );

      if (state.busesInProgress.selectedBusInProgressId === bus.id) {
        this.router.navigate([
          '/workspaces',
          state.workspaces.selectedWorkspaceId,
          'petals',
          'buses',
          bus.id,
        ]);
      }

      return batchActions([
        { type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: bus.id },
        { type: Buses.ADD_BUSES_SUCCESS, payload: buses },
        {
          type: Containers.ADD_CONTAINERS_SUCCESS,
          payload: toJavascriptMap<IContainerBackendSSE>(data.containers),
        },
        {
          type: ServiceAssemblies.ADD_SERVICE_ASSEMBLIES_SUCCESS,
          payload: toJavascriptMap<IComponentBackendSSE>(
            data.serviceAssemblies
          ),
        },
        {
          type: Components.ADD_COMPONENTS_SUCCESS,
          payload: toJavascriptMap<IComponentBackendSSE>(data.components),
        },
        {
          type: ServiceUnits.ADD_SERVICE_UNITS_SUCCESS,
          payload: toJavascriptMap<IServiceUnitBackendSSE>(data.serviceUnits),
        },
        {
          type: SharedLibraries.ADDED,
          payload: toJavascriptMap<ISharedLibraryBackendSSE>(
            data.sharedLibraries
          ),
        },
      ]);
    });

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchBusDetails$: Observable<Action> = this.actions$
    .ofType(Buses.FETCH_BUS_DETAILS)
    .switchMap((action: { type: string; payload: { busId: string } }) =>
      this.busesService
        .getDetailsBus(action.payload.busId)
        .map((res: Response) => {
          const rslt = res.json();
          return {
            type: Buses.FETCH_BUS_DETAILS_SUCCESS,
            payload: { busId: action.payload.busId, rslt },
          };
        })
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error caught in buses.effects.ts: ofType(Buses.FETCH_BUS_DETAILS)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Buses.FETCH_BUS_DETAILS_ERROR,
            payload: { busId: action.payload.busId },
          });
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  deleteBus$: Observable<Action> = this.actions$
    .ofType(Buses.DELETE_BUS)
    .withLatestFrom(
      this.store$.select(state => state.workspaces.selectedWorkspaceId)
    )
    .switchMap(([action, idWorkspace]) =>
      this.busesService
        .deleteBus(idWorkspace, action.payload)
        .mergeMap(_ => Observable.empty())
        .catch(err => {
          if (environment.debug) {
            console.group();
            console.warn(
              'Error catched in buses.effects: ofType(Buses.DELETE_BUS)'
            );
            console.error(err);
            console.groupEnd();
          }

          return Observable.of({
            type: Buses.DELETE_BUS_FAILED,
            payload: action.payload,
          });
        })
    );
}
