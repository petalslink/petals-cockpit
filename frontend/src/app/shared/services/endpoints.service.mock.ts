/**
 * Copyright (C) 2017-2019 Linagora
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

import * as helper from '@shared/helpers/mock.helper';
import { EndpointsServiceImpl } from './endpoints.service';

@Injectable()
export class EndpointsServiceMock extends EndpointsServiceImpl {
  constructor(http: HttpClient) {
    super(http);
  }

  getDetailsEndpoint(id: string) {
    switch (id) {
      case 'idEndpoint0': {
        return helper.responseBody({
          service: 'idService0',
          interfaces: ['idInterface0', 'idInterface4'],
        });
      }
      case 'idEndpoint1': {
        return helper.responseBody({
          service: 'idService1',
          interfaces: ['idInterface1', 'idInterface2'],
        });
      }
      case 'idEndpoint2': {
        return helper.responseBody({
          service: 'idService2',
          interfaces: ['idInterface2'],
        });
      }
      case 'idEndpoint3': {
        return helper.responseBody({
          service: 'idService3',
          interfaces: ['idInterface3'],
        });
      }
      case 'idEndpoint4': {
        return helper.responseBody({
          service: 'idService0',
          interfaces: [
            'idInterface0',
            'idInterface1',
            'idInterface2',
            'idInterface3',
            'idInterface4',
          ],
        });
      }
      case 'idEndpoint12': {
        return helper.responseBody({
          service: 'idService12',
          interfaces: ['idInterface12'],
        });
      }
      case 'idEndpoint13': {
        return helper.responseBody({
          service: 'idService13',
          interfaces: ['idInterface13'],
        });
      }
      // TODO: Need investigation to mock the requested operation
      case 'idEndpointForbidden': {
        return helper.errorBackend('Fordidden requested operation', 403);
      }
      default: {
        return helper.errorBackend('Endpoint not found', 404);
      }
    }
  }
}
