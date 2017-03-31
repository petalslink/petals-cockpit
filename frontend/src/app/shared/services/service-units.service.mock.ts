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
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { ServiceUnitsServiceImpl } from './service-units.service';
import { serviceUnitsService } from '../../../mocks/service-units-mock';
import * as helper from './../helpers/mock.helper';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { SseServiceMock } from './sse.service.mock';
import { environment } from '../../../environments/environment';
import { IStore } from '../interfaces/store.interface';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class ServiceUnitsMockService extends ServiceUnitsServiceImpl {
  constructor(http: Http, router: Router, private pSseService: SseService, store$: Store<IStore>, notification: NotificationsService) {
    super(http, router, pSseService, store$, notification);
  }

  getDetailsServiceUnit(serviceUnitId: string) {
    const detailsServiceUnit = serviceUnitsService.get(serviceUnitId).getDetails();

    return helper.responseBody(detailsServiceUnit);
  }

  putState(_workspaceId: string, serviceUnitId: string, newState: string) {
    serviceUnitsService.get(serviceUnitId).setState(newState);
    // when the state changes, trigger a fake SSE event
    setTimeout(() =>
      (this.pSseService as SseServiceMock).triggerSseEvent(
        SseWorkspaceEvent.SU_STATE_CHANGE,
        {
          id: serviceUnitId,
          state: newState
        }
      ),
      environment.sseDelay
    );

    return helper.responseBody(null);
  }
}
