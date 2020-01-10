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

import * as helper from '@shared/helpers/mock.helper';
import { ServicesServiceImpl } from './services.service';

@Injectable()
export class ServicesServiceMock extends ServicesServiceImpl {
  constructor(http: HttpClient) {
    super(http);
  }

  getDetailsService(id: string) {
    switch (id) {
      case 'idService0': {
        return helper.responseBody({
          interfaces: ['idInterface0', 'idInterface4'],
          endpoints: ['idEndpoint0', 'idEndpoint4'],
        });
      }
      case 'idService1': {
        return helper.responseBody({
          interfaces: ['idInterface1'],
          endpoints: ['idEndpoint1', 'idEndpoint2'],
        });
      }
      case 'idService2': {
        return helper.responseBody({
          interfaces: ['idInterface2', 'idInterface3'],
          endpoints: ['idEndpoint2'],
        });
      }
      case 'idService3': {
        return helper.responseBody({
          interfaces: ['idInterface3'],
          endpoints: ['idEndpoint3'],
        });
      }
      case 'idService4': {
        return helper.responseBody({
          interfaces: [
            'idInterface0',
            'idInterface1',
            'idInterface2',
            'idInterface3',
            'idInterface4',
          ],
          endpoints: [
            'idEndpoint0',
            'idEndpoint1',
            'idEndpoint2',
            'idEndpoint3',
            'idEndpoint4',
          ],
        });
      }
      case 'idService12': {
        return helper.responseBody({
          interfaces: ['idInterface12'],
          endpoints: ['idEndpoint12'],
        });
      }
      case 'idService13': {
        return helper.responseBody({
          interfaces: ['idInterface13'],
          endpoints: ['idEndpoint13'],
        });
      }
      // TODO: Need investigation to mock the requested operation
      case 'idServiceForbidden': {
        return helper.errorBackend('Fordidden requested operation', 403);
      }
      default: {
        return helper.errorBackend('Service not found', 404);
      }
    }
  }
}
