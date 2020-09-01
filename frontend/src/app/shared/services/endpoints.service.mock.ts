/**
 * Copyright (C) 2017-2020 Linagora
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

import { workspacesService } from '@mocks/workspaces-mock';
import * as helper from '@shared/helpers/mock.helper';
import flatMap from 'lodash-es/flatMap';
import { EndpointsServiceImpl } from './endpoints.service';
import { UsersService } from './users.service';
import { UsersServiceMock } from './users.service.mock';

@Injectable()
export class EndpointsServiceMock extends EndpointsServiceImpl {
  constructor(http: HttpClient, private usersService: UsersService) {
    super(http);
  }

  getDetailsEndpoint(id: string) {
    const mock = this.usersService as UsersServiceMock;

    if (id === 'idEndpointForbidden') {
      return helper.errorBackend('Fordidden requested operation', 403);
    }

    // a list of same Id endpoints
    const endpoint = flatMap(
      workspacesService.getWorkspaces(mock.getCurrentUser().id),
      wks => wks.getEndpoints()
    ).find(edp => edp.id === id);
    // looking for the list with the desired endpoint id

    if (endpoint === null) {
      return helper.errorBackend('Endpoint not found', 404);
    }

    return helper.responseBody({
      service: endpoint.serviceId,
      interfaces: Array.from(endpoint.interfaces),
    });
  }
}
