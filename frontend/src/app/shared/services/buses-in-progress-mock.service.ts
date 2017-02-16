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

import { BusesInProgressService } from './buses-in-progress.service';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { SseServiceMock } from './sse.service.mock';
import { IBusInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { environment } from './../../../environments/environment';
import * as helper from './../helpers/mock.helper';
import { workspacesService } from '../../../mocks/workspaces-mock';
import { toJavascriptMap } from '../helpers/shared.helper';

@Injectable()
export class BusesInProgressMockService extends BusesInProgressService {

  private firstErrorSent = false;

  constructor(private _sseService: SseService) {
    super();
  }

  postBus(idWorkspace: string, bus: IBusInProgress) {
    // when mocking, we make the first test fail with an HTTP error
    if (!this.firstErrorSent) {
      this.firstErrorSent = true;
      return helper.responseBody('Error backend', 500);
    }
    const newBus = workspacesService.getWorkspace(idWorkspace).addBus();
    const detailsBus = Object.assign({}, bus, { id: toJavascriptMap(newBus.buses).allIds[0] });

    return helper
      .responseBody(detailsBus)
      .do(_ => {
        // simulate the backend sending the answer on the SSE
        setTimeout(() => (this._sseService as SseServiceMock)
          .triggerSseEvent(SseWorkspaceEvent.BUS_IMPORT_OK, newBus), environment.sseDelay);
      });
  }
}
