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
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { batchActions } from 'redux-batched-actions';
import { NotificationsService } from 'angular2-notifications';

import { IStore } from '../../../../../shared/interfaces/store.interface';
import { IBusInProgress, IBusInProgressRow } from './bus-in-progress.interface';
import { BusesInProgress } from './buses-in-progress.reducer';
import { environment } from './../../../../../../environments/environment';
import { BusesInProgressService } from './../../../../../shared/services/buses-in-progress.service';
import { SseService, SseWorkspaceEvent } from './../../../../../shared/services/sse.service';
import { Ui } from './../../../../../shared/state/ui.reducer';
import { ServiceUnits } from './../service-units/service-units.reducer';
import { Buses } from './../buses/buses.reducer';
import { Components } from './../components/components.reducer';
import { Containers } from './../containers/containers.reducer';
import { Workspaces } from './../workspaces/workspaces.reducer';
import { toJavascriptMap } from '../../../../../shared/helpers/shared.helper';

@Injectable()
export class BusesInProgressEffects {
  private _notifIds = new Map<string, string>();

  constructor(
    private _actions$: Actions,
    private _store$: Store<IStore>,
    private _router: Router,
    private _busesInProgressService: BusesInProgressService,
    private _sseService: SseService,
    private _notifications: NotificationsService
  ) { }

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) postBus$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS)
    .combineLatest(this._store$.select(state => state.workspaces.selectedWorkspaceId))
    .do(([action]) => {
      const notifId = this._notifications.info(`Importing bus`, `Importing bus with IP ${action.payload.ip}`);
      this._notifIds.set(action.payload.ip, notifId.id);
    })
    .switchMap(([action, idWorkspace]) =>
      this._busesInProgressService.postBus(idWorkspace, action.payload)
        .map((res: Response) => {
          return {
            type: BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS,
            payload: {
              idWorkspace,
              busInProgress: <IBusInProgressRow>res.json()
            }
          };
        })
    );

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true }) postBusSuccess$: Observable<Action> = this._actions$
    .ofType(BusesInProgress.POST_BUS_IN_PROGRESS_SUCCESS)
    .map((action: Action) => action.payload)
    .do(({idWorkspace, busInProgress}: { idWorkspace: string, busInProgress: IBusInProgressRow }) =>
      this._router.navigate(['/workspaces', idWorkspace, 'petals', 'buses-in-progress', busInProgress.id])
    )
    .do(({ idWorkspace }: { idWorkspace: string }) =>
      // if dev env, this will simulate an SSE event, in prod it won't do anything as triggerSseEvent is empty
      setTimeout(() => this._sseService.triggerSseEvent(SseWorkspaceEvent.BUS_IMPORT_OK, idWorkspace), environment.sseDelay)
    )
    .switchMap(({ idWorkspace, busInProgress }: { idWorkspace: string, busInProgress: IBusInProgressRow }) =>
      this._sseService.subscribeToWorkspaceEvent(SseWorkspaceEvent.BUS_IMPORT_OK)
        .map((data: any) => {
          if (this._notifIds.has(busInProgress.ip)) {
            const notifId = this._notifIds.get(busInProgress.ip);
            this._notifications.remove(notifId);
          }

          this._notifications.success(`Bus imported`, `The bus with the IP ${busInProgress.ip} has been imported`);

          return batchActions([
            { type: BusesInProgress.REMOVE_BUS_IN_PROGRESS, payload: { busInProgressId: busInProgress.id } },
            { type: Buses.FETCH_BUSES_SUCCESS, payload: toJavascriptMap(data.buses) },
            { type: Containers.FETCH_CONTAINERS_SUCCESS, payload: toJavascriptMap(data.containers) },
            { type: Components.FETCH_COMPONENTS_SUCCESS, payload: toJavascriptMap(data.components) },
            { type: ServiceUnits.FETCH_SERVICE_UNITS_SUCCESS, payload: toJavascriptMap(data.serviceUnits) },
          ]);
        })
    );
}