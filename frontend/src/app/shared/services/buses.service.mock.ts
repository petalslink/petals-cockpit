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
import { tap } from 'rxjs/operators';

import { environment } from '@env/environment';
import {
  errorBackend,
  errorBackendLongText,
  IMPORT_HTTP_ERROR_IP,
  IMPORT_HTTP_ERROR_IP_LONG_TEXT,
} from '@mocks/backend-mock';
import { busesService } from '@mocks/buses-mock';
import { workspacesService } from '@mocks/workspaces-mock';
import * as helper from '@shared/helpers/mock.helper';
import { BusesServiceImpl, IBusImport } from '@shared/services/buses.service';
import { SseActions, SseService } from '@shared/services/sse.service';
import { SseServiceMock } from '@shared/services/sse.service.mock';
import { UsersService } from '@shared/services/users.service';
import { UsersServiceMock } from '@shared/services/users.service.mock';

@Injectable()
export class BusesServiceMock extends BusesServiceImpl {
  constructor(
    http: HttpClient,
    private sseService: SseService,
    private userService: UsersService
  ) {
    super(http);
  }

  postBus(idWorkspace: string, bus: IBusImport) {
    // only used by the tests to verify an error coming from the backend...
    if (bus.ip === IMPORT_HTTP_ERROR_IP) {
      return helper.errorBackend(errorBackend, 500);
    } else if (bus.ip === IMPORT_HTTP_ERROR_IP_LONG_TEXT) {
      return helper.errorBackend(errorBackendLongText, 500);
    }

    const newBus = workspacesService.get(idWorkspace).tryAddBus(bus);

    let event: string;
    if (newBus.eventData.importError) {
      event = SseActions.BusImportErrorSse;
    } else {
      event = SseActions.BusImportOkSse;
    }

    const detailsBus = {
      ...bus,
      id: newBus.id,
      importError: '',
    };

    return helper.responseBody(detailsBus).pipe(
      tap(_ => {
        // simulate the backend sending the bus in progress on the SSE
        setTimeout(() => {
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseActions.BusImportSse,
            detailsBus
          );
          // simulate the backend sending the imported bus on the SSE
          setTimeout(
            () =>
              (this.sseService as SseServiceMock).triggerSseEvent(
                event,
                newBus.eventData
              ),
            environment.mock.sseDelay
          );
        }, environment.mock.sseDelay);
      })
    );
  }

  detachBus(_idWorkspace: string, id: string) {
    return helper.response(204).pipe(
      tap(_ => {
        // simulate the backend sending the answer on the SSE
        setTimeout(
          () =>
            (this.sseService as SseServiceMock).triggerSseEvent(
              SseActions.BusDetachedSse,
              {
                id,
                reason: `Bus detached by ${
                  (this.userService as UsersServiceMock).getCurrentUser().id
                }`,
                content: {
                  endpoints: {
                    idEndpoint0: {
                      id: 'idEndpoint0',
                      name: 'edpt-89p82661-test-31o4-l391-00',
                      componentId: 'idComp0',
                    },
                    idEndpoint1: {
                      id: 'idEndpoint1',
                      name: 'edpt-89p82661-test-31o4-l391-01',
                      componentId: 'idComp0',
                    },
                    idEndpoint2: {
                      id: 'idEndpoint2',
                      name: 'edpt-89p82661-test-31o4-l391-02',
                      componentId: 'idComp0',
                    },
                    idEndpoint3: {
                      id: 'idEndpoint3',
                      name: 'edpt-89p82661-test-31o4-l391-03',
                      componentId: 'idComp0',
                    },
                    idEndpoint4: {
                      id: 'idEndpoint4',
                      name: 'edpt-89p82661-test-31o4-l391-04',
                      componentId: 'idComp0',
                    },
                  },
                  interfaces: {
                    idInterface0: {
                      id: 'idInterface0',
                      name:
                        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart0',
                      components: ['idComp0'],
                    },
                    idInterface1: {
                      id: 'idInterface1',
                      name:
                        '{http://namespace-example.fr/interface/technique/version/1.0}Interface-Localpart1',
                      components: ['idComp0'],
                    },
                    idInterface2: {
                      id: 'idInterface2',
                      name:
                        '{http://namespace-example.fr/interface/technique/version/2.0}Interface-Localpart2',
                      components: ['idComp0'],
                    },
                    idInterface3: {
                      id: 'idInterface3',
                      name:
                        '{http://namespace-example.fr/interface/technique/version/3.0}Interface-Localpart3',
                      components: ['idComp0'],
                    },
                    idInterface4: {
                      id: 'idInterface4',
                      name:
                        '{http://namespace-example.fr/interface/technique/version/3.0}Interface-Localpart4',
                      components: ['idComp0'],
                    },
                  },
                  services: {
                    idService0: {
                      id: 'idService0',
                      name:
                        '{http://namespace-example.fr/service/technique/version/1.0}Localpart0',
                      components: ['idComp0'],
                    },
                    idService1: {
                      id: 'idService1',
                      name:
                        '{http://namespace-example.fr/service/technique/version/1.0}Localpart1',
                      components: ['idComp0'],
                    },
                    idService2: {
                      id: 'idService2',
                      name:
                        '{http://namespace-example.fr/service/technique/version/2.0}Localpart2',
                      components: ['idComp0'],
                    },
                    idService3: {
                      id: 'idService3',
                      name:
                        '{http://namespace-example.fr/service/technique/version/3.0}Localpart3',
                      components: ['idComp0'],
                    },
                    idService4: {
                      id: 'idService4',
                      name:
                        '{http://namespace-example.fr/service/technique/version/3.0}Localpart4',
                      components: ['idComp0'],
                    },
                  },
                },
              }
            ),
          environment.mock.sseDelay
        );
      })
    );
  }

  getDetailsBus(busId: string) {
    const detailsBus = busesService.read(busId).getDetails();

    return helper.responseBody(detailsBus);
  }
}
