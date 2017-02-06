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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { environment } from './../../../environments/environment';
import { getDetailsServiceUnit } from '../../../mocks/workspace-id-wks-0';

@Injectable()
export class ServiceUnitsMockService {
  constructor() { }

  getDetailsServiceUnit(idWorkspace: string, serviceUnitId: string) {
    const detailsServiceUnit = getDetailsServiceUnit(serviceUnitId);

    const response: Response = <Response>{
      ok: true,
      json: () => {
        return detailsServiceUnit;
      }
    };

    return Observable
      .of(response)
      .delay(environment.httpDelay);
  }
}
