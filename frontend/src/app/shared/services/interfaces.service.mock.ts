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

import { Endpoint } from '@mocks/endpoints-mock';
import { workspacesService } from '@mocks/workspaces-mock';
import * as helper from '@shared/helpers/mock.helper';
import { InterfacesServiceImpl } from './interfaces.service';
import { UsersService } from './users.service';
import { UsersServiceMock } from './users.service.mock';

@Injectable()
export class InterfacesServiceMock extends InterfacesServiceImpl {
  constructor(http: HttpClient, private usersService: UsersService) {
    super(http);
  }

  getDetailsInterface(id: string) {
    const mock = this.usersService as UsersServiceMock;

    if (id === 'idServiceForbidden') {
      return helper.errorBackend('Fordidden requested operation', 403);
    }

    const endpoints: Endpoint[] = workspacesService
      .getWorkspaces(mock.getCurrentUser().id)
      .map<Endpoint[]>(wks => wks.getEndpoints())
      // find right workspace
      .find(edpList =>
        edpList.map(edp => edp.interfaces).some(intList => intList.includes(id))
      )
      // get right endpoints
      .filter(edp => edp.interfaces.includes(id));

    if (endpoints === []) {
      return helper.errorBackend('Interface not found', 404);
    }

    return helper.responseBody({
      services: endpoints.map(edp => edp.serviceId),
      endpoints: endpoints.map(edp => edp.id),
    });
  }
}
