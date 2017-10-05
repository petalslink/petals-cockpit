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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as helper from 'app/shared/helpers/mock.helper';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import { UsersService } from 'app/shared/services/users.service';
import { UsersServiceMock } from 'app/shared/services/users.service.mock';
import { environment } from 'environments/environment';
import {
  errorBackend,
  errorBackendLongText,
  IMPORT_HTTP_ERROR_IP,
  IMPORT_HTTP_ERROR_IP_LONG_TEXT,
} from 'mocks/backend-mock';
import { busesService } from 'mocks/buses-mock';
import { workspacesService } from 'mocks/workspaces-mock';
import { BusesServiceImpl, IBusImport } from './buses.service';
import { SseActions, SseService } from './sse.service';

@Injectable()
export class BusesServiceMock extends BusesServiceImpl {
  constructor(
    http: HttpClient,
    private sseService: SseService,
    private userService: UsersService
  ) {
    super(http);
  }

  postBus(idWorkspace: string, bus: IBusImport) {
    // only used by the tests to verify an error coming from the backend...
    if (bus.ip === IMPORT_HTTP_ERROR_IP) {
      return helper.errorBackend(errorBackend, 500);
    } else if (bus.ip === IMPORT_HTTP_ERROR_IP_LONG_TEXT) {
      return helper.errorBackend(errorBackendLongText, 500);
    }

    const newBus = workspacesService.get(idWorkspace).tryAddBus(bus);

    let event: string;
    if (newBus.eventData.importError) {
      event = SseActions.BusImportErrorSse;
    } else {
      event = SseActions.BusImportOkSse;
    }

    const detailsBus = {
      ...bus,
      id: newBus.id,
      importError: '',
    };

    return helper.responseBody(detailsBus).do(_ => {
      // simulate the backend sending the bus in progress on the SSE
      setTimeout(() => {
        (this.sseService as SseServiceMock).triggerSseEvent(
          SseActions.BusImportSse,
          detailsBus
        );
        // simulate the backend sending the imported bus on the SSE
        setTimeout(
          () =>
            (this.sseService as SseServiceMock).triggerSseEvent(
              event,
              newBus.eventData
            ),
          environment.mock.sseDelay
        );
      }, environment.mock.sseDelay);
    });
  }

  deleteBus(_idWorkspace: string, id: string) {
    return helper.response(204).do(_ => {
      // simulate the backend sending the answer on the SSE
      setTimeout(
        () =>
          (this
            .sseService as SseServiceMock).triggerSseEvent(
            SseActions.BusDeletedSse,
            {
              id,
              reason: `bus deleted by ${(this
                .userService as UsersServiceMock).getCurrentUser().id}`,
            }
          ),
        environment.mock.sseDelay
      );
    });
  }

  getDetailsBus(busId: string) {
    const detailsBus = busesService.read(busId).getDetails();

    return helper.responseBody(detailsBus);
  }
}
