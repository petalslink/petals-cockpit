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
import { Observable } from 'rxjs/Observable';

import { generateUuidV4 } from '../helpers/shared.helper';
import { IBusInProgress } from './../../features/cockpit/workspaces/state/buses-in-progress/bus-in-progress.interface';
import { environment } from './../../../environments/environment';
import * as helper from './../helpers/mock.helper';

@Injectable()
export class BusesInProgressMockService {
  constructor() { }

  postBus(idWorkspace: string, bus: IBusInProgress) {

    const detailsBus = Object.assign({}, bus, { id: generateUuidV4() });

    return helper
      .responseBody(detailsBus)
      .delay(environment.httpDelay);
  }
}
