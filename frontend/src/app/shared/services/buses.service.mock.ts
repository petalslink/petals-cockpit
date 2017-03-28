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
import { Store } from '@ngrx/store';

import { BusesServiceImpl } from './buses.service';
import { IStore } from './../interfaces/store.interface';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import { NotificationsService } from 'angular2-notifications';
import { environment } from './../../../environments/environment';
import * as helper from './../helpers/mock.helper';
import { busesService } from './../../../mocks/buses-mock';
import { workspacesService } from '../../../mocks/workspaces-mock';
import { IBusInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { UsersService } from 'app/shared/services/users.service';
import { UsersMockService } from 'app/shared/services/users.service.mock';

@Injectable()
export class BusesMockService extends BusesServiceImpl {

  private firstErrorSent = false;

  constructor(
    http: Http,
    store$: Store<IStore>,
    private pSseService: SseService,
    private userService: UsersService,
    notifications: NotificationsService) {
    super(http, store$, pSseService, notifications);
  }

  postBus(idWorkspace: string, bus: IBusInProgress) {
    // when mocking, we make the first test fail with an HTTP error
    if (!this.firstErrorSent) {
      this.firstErrorSent = true;
      return helper.responseBody('Error backend', 500);
    }

    const newBus = workspacesService.getWorkspace(idWorkspace).addBus(bus);

    let event;
    if (newBus.eventData.importError) {
      event = SseWorkspaceEvent.BUS_IMPORT_ERROR;
    } else {
      event = SseWorkspaceEvent.BUS_IMPORT_OK;
    }

    const detailsBus = {
      ...bus,
      id: newBus.id
    };

    return helper
      .responseBody(detailsBus)
      .do(_ => {
        // simulate the backend sending the bus in progress on the SSE
        setTimeout(() => {
          (this.pSseService as SseServiceMock).triggerSseEvent(SseWorkspaceEvent.BUS_IMPORT, detailsBus);
          // simulate the backend sending the imported bus on the SSE
          setTimeout(() => (this.pSseService as SseServiceMock)
            .triggerSseEvent(event, newBus.eventData), environment.sseDelay);
        }, environment.sseDelay);

      });
  }

  deleteBus(_idWorkspace: string, id: string) {
    return helper
      .response(204)
      .do(_ => {
        // simulate the backend sending the answer on the SSE
        setTimeout(() => (this.pSseService as SseServiceMock)
          .triggerSseEvent(SseWorkspaceEvent.BUS_DELETED, {
            id,
            reason: `bus deleted by ${(this.userService as UsersMockService).getCurrentUser().id}`
          }), environment.sseDelay);
      });
  }

  getDetailsBus(busId: string) {
    const detailsBus = busesService.read(busId).getDetails();

    return helper.responseBody(detailsBus);
  }
}
