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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as helper from 'app/shared/helpers/mock.helper';
import { endpointsService } from 'mocks/endpoints-mock';
import { EndpointsServiceImpl } from './endpoints.service';

@Injectable()
export class EndpointsServiceMock extends EndpointsServiceImpl {
  constructor(http: HttpClient) {
    super(http);
  }

  getDetailsEndpoint(endpointId: string) {
    const detailsEndpoint = endpointsService.get(endpointId).getDetails();

    return helper.responseBody(detailsEndpoint.endpoint);
  }
}
