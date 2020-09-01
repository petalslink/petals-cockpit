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
import { tap } from 'rxjs/operators';

import { environment } from '@env/environment';
import {
  errorBackend,
  errorBackendLongText,
  FAST_IMPORT_ERROR_IP,
  FAST_IMPORT_OK_IP,
  IMPORT_CANCEL_IP,
  IMPORT_HTTP_ERROR_IP,
  IMPORT_HTTP_ERROR_IP_LONG_TEXT,
} from '@mocks/backend-mock';
import { busesService } from '@mocks/buses-mock';
import { workspacesService } from '@mocks/workspaces-mock';
import * as helper from '@shared/helpers/mock.helper';
import { BusesServiceImpl, IBusImport } from '@shared/services/buses.service';
import { IEndpointBackendSSE } from '@shared/services/endpoints.service';
import { IInterfaceBackendSSE } from '@shared/services/interfaces.service';
import { IServiceBackendSSE } from '@shared/services/services.service';
import { SseActions, SseService } from '@shared/services/sse.service';
import { SseServiceMock } from '@shared/services/sse.service.mock';
import { UsersService } from '@shared/services/users.service';
import { UsersServiceMock } from '@shared/services/users.service.mock';

@Injectable()
export class BusesServiceMock extends BusesServiceImpl {
  importWillCancel = false;

  constructor(
    http: HttpClient,
    private sseService: SseService,
    private userService: UsersService
  ) {
    super(http);
  }

  postFastBus(idWorkspace: string, bus: IBusImport) {
    const newBus = workspacesService.get(idWorkspace).tryAddBus(bus);
    let detailsBus = {
      ...bus,
      id: newBus.id,
      importError: '',
    };

    const sseServiceMock = this.sseService as SseServiceMock;

    sseServiceMock.triggerSseEvent(SseActions.BusImportSse, detailsBus);

    if (bus.ip === FAST_IMPORT_ERROR_IP) {
      const ipPort = `${bus.ip}:${bus.port}`;

      detailsBus = {
        ...detailsBus,
        importError: `Can't connect to ${ipPort}`,
      };
      // sending error
      sseServiceMock.triggerSseEvent(SseActions.BusImportErrorSse, detailsBus);
    } else {
      // sending new bus
      sseServiceMock.triggerSseEvent(
        SseActions.BusImportOkSse,
        newBus.eventData
      );
    }

    return helper.responseBody(detailsBus);
  }

  postBus(idWorkspace: string, bus: IBusImport) {
    // only used by the tests to verify an error coming from the backend...
    if (bus.ip === IMPORT_HTTP_ERROR_IP) {
      return helper.errorBackend(errorBackend, 500);
    } else if (bus.ip === IMPORT_HTTP_ERROR_IP_LONG_TEXT) {
      return helper.errorBackend(errorBackendLongText, 500);
    } else if (
      bus.ip === FAST_IMPORT_ERROR_IP ||
      bus.ip === FAST_IMPORT_OK_IP
    ) {
      return this.postFastBus(idWorkspace, bus);
    }

    const newBus = workspacesService.get(idWorkspace).tryAddBus(bus);

    const detailsBus = {
      ...bus,
      id: newBus.id,
      importError: '',
      content: {
        endpoints: {},
        interfaces: {},
        services: {},
      },
    };

    let event: string;
    let additionalDelay = 0;
    if (newBus.eventData.importError) {
      // sending error
      event = SseActions.BusImportErrorSse;
    } else if (bus.ip === IMPORT_CANCEL_IP) {
      // sending cancel import bus
      event = SseActions.BusDetachedSse;
      this.importWillCancel = true;
      newBus.eventData = detailsBus;
      additionalDelay = 3500;
    } else {
      // sending new bus
      event = SseActions.BusImportOkSse;
    }

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
            environment.mock.sseDelay + additionalDelay
          );
        }, environment.mock.sseDelay);
      })
    );
  }

  detachBus(_idWorkspace: string, id: string) {
    const mock = this.userService as UsersServiceMock;

    if (this.importWillCancel) {
      return helper.response(204);
    }

    const affectedWorkspace = workspacesService.get(_idWorkspace);

    const removedComponentsList = affectedWorkspace
      .getBuses()
      .find(buss => buss.id === id)
      .getComponents();

    let contentLeft: {
      endpoints: {
        [id: string]: IEndpointBackendSSE;
      };
      interfaces: { [id: string]: IInterfaceBackendSSE };
      services: { [id: string]: IServiceBackendSSE };
    };
    if (affectedWorkspace.getBuses().length === 1) {
      contentLeft = { endpoints: {}, interfaces: {}, services: {} };
    } else {
      affectedWorkspace
        .getEndpoints()
        // hacking because added endpoints will only have one comp
        .filter(edp => removedComponentsList.includes(edp.componentId))
        .forEach(
          edp =>
            delete affectedWorkspace.getEndpoints()[
              affectedWorkspace.getEndpoints().indexOf(edp)
            ]
        );

      affectedWorkspace
        .getInterfaces()
        .filter(itf =>
          // hacking because added interfaces will only have one comp
          removedComponentsList.includes(itf.componentsIds[0])
        )
        .forEach(
          itf =>
            delete affectedWorkspace.getInterfaces()[
              affectedWorkspace.getInterfaces().indexOf(itf)
            ]
        );

      affectedWorkspace
        .getServices()
        .filter(serv =>
          // hacking because added services will only have one comp
          removedComponentsList.includes(serv.componentsIds[0])
        )
        .forEach(
          serv =>
            delete affectedWorkspace.getServices()[
              affectedWorkspace.getServices().indexOf(serv)
            ]
        );

      contentLeft = {
        endpoints: affectedWorkspace
          .getEndpoints()
          .reduce((acc, curr) => ({ ...acc, ...curr.toObj() }), {}),
        interfaces: affectedWorkspace
          .getInterfaces()
          .reduce((acc, curr) => ({ ...acc, ...curr.toObj() }), {}),
        services: affectedWorkspace
          .getServices()
          .reduce((acc, curr) => ({ ...acc, ...curr.toObj() }), {}),
      };
    }

    return helper.response(204).pipe(
      tap(_ => {
        // simulate the backend sending the answer on the SSE
        setTimeout(
          () =>
            (this.sseService as SseServiceMock).triggerSseEvent(
              SseActions.BusDetachedSse,
              {
                id,
                reason: `Bus detached by ${mock.getCurrentUser().id}`,
                content: contentLeft,
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
