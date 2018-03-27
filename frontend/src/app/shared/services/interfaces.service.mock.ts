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
import { InterfacesServiceImpl } from './interfaces.service';

@Injectable()
export class InterfacesServiceMock extends InterfacesServiceImpl {
  constructor(http: HttpClient) {
    super(http);
  }

  getDetailsInterface(id: string) {
    switch (id) {
      case 'idInterface0': {
        return helper.responseBody({
          services: ['idService0', 'idService4'],
          endpoints: ['idEndpoint0', 'idEndpoint4'],
        });
      }
      case 'idInterface1': {
        return helper.responseBody({
          services: ['idService1'],
          endpoints: ['idEndpoint1', 'idEndpoint2'],
        });
      }
      case 'idInterface2': {
        return helper.responseBody({
          services: ['idService2', 'idService3'],
          endpoints: ['idEndpoint2'],
        });
      }
      case 'idInterface3': {
        return helper.responseBody({
          services: ['idService3'],
          endpoints: ['idEndpoint3'],
        });
      }
      case 'idInterface4': {
        return helper.responseBody({
          services: [
            'idService0',
            'idService1',
            'idService2',
            'idService3',
            'idService4',
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
      case 'idInterface12': {
        return helper.responseBody({
          services: ['idService12'],
          endpoints: ['idEndpoint12'],
        });
      }
      case 'idInterface13': {
        return helper.responseBody({
          services: ['idService13'],
          endpoints: ['idEndpoint13'],
        });
      }
      // TODO: Need investigation to mock the requested operation
      case 'idInterfaceForbidden': {
        return helper.errorBackend('Fordidden requested operation', 403);
      }
      default: {
        return helper.errorBackend('Interface not found', 404);
      }
    }
  }
}
