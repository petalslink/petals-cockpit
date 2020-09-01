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
import { UsersService } from '@shared/services/users.service';
import { UsersServiceMock } from '@shared/services/users.service.mock';
import flatMap from 'lodash-es/flatMap';
import { ServicesServiceImpl } from './services.service';

@Injectable()
export class ServicesServiceMock extends ServicesServiceImpl {
  constructor(http: HttpClient, private usersService: UsersService) {
    super(http);
  }

  getDetailsService(id: string) {
    const mock = this.usersService as UsersServiceMock;

    if (id === 'idServiceForbidden') {
      return helper.errorBackend('Fordidden requested operation', 403);
    }

    // a list of same Id services
    const endpoints = workspacesService
      .getWorkspaces(mock.getCurrentUser().id)
      .map(wks => wks.getEndpoints())
      // looking for the list with the desired service id
      .find(edps => edps.map(edp => edp.serviceId).includes(id))
      .filter(edp => edp.serviceId === id);

    if (endpoints === []) {
      return helper.errorBackend('Service not found', 404);
    }
    return helper.responseBody({
      interfaces: Array.from(
        new Set(flatMap(endpoints, edp => edp.interfaces))
      ),
      endpoints: endpoints.map(edp => edp.id),
    });
  }
}
