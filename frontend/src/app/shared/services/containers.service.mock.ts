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
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { toJsTable } from 'app/shared/helpers/jstable.helper';
import * as helper from 'app/shared/helpers/mock.helper';
import { IComponentBackendSSE } from 'app/shared/services/components.service';
import {
  EServiceAssemblyState,
  IServiceAssemblyBackendSSE,
} from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';
import { ISharedLibraryBackendSSE } from 'app/shared/services/shared-libraries.service';
import { SseActions, SseService } from 'app/shared/services/sse.service';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import { environment } from 'environments/environment';
import { containersService } from 'mocks/containers-mock';
import { ContainersServiceImpl } from './containers.service';

@Injectable()
export class ContainersServiceMock extends ContainersServiceImpl {
  constructor(http: Http, private sseService: SseService) {
    super(http);
  }

  getDetailsContainer(containerId: string) {
    const detailsContainer = containersService.get(containerId).getDetails();

    return helper.responseBody(detailsContainer);
  }

  deployComponent(workspaceId: string, containerId: string, file: File) {
    let o: Observable<Response>;
    if (file.name.includes('error')) {
      o = helper.errorBackend(
        '[Mock message] An error happened when trying to deploy the component',
        400
      );
    } else {
      const name = file.name.replace(/\.zip$/, '');
      const component = containersService
        .get(containerId)
        .addComponent('Loaded', name);

      const response = {
        components: component.toObj(),
      };

      setTimeout(
        () =>
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseActions.ComponentDeployedSse,
            response
          ),
        environment.mock.sseDelay
      );
      o = helper.responseBody(response);
    }

    return o.map(res => toJsTable<IComponentBackendSSE>(res.json().components));
  }

  deployServiceAssembly(workspaceId: string, containerId: string, file: File) {
    let o: Observable<Response>;
    if (file.name.includes('error')) {
      o = helper.errorBackend(
        '[Mock message] An error happened when trying to deploy the service-assembly',
        400
      );
    } else {
      const [serviceAssembly, serviceUnits] = containersService
        .get(containerId)
        .addServiceAssembly(EServiceAssemblyState.Shutdown);

      const response = {
        serviceAssemblies: serviceAssembly,
        serviceUnits: serviceUnits,
      };

      setTimeout(
        () =>
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseActions.SaDeployedSse,
            response
          ),
        environment.mock.sseDelay
      );
      o = helper.responseBody(response);
    }

    return o.map(res => {
      const data = res.json();
      return {
        serviceAssemblies: toJsTable<IServiceAssemblyBackendSSE>(
          data.serviceAssemblies
        ),
        serviceUnits: toJsTable<IServiceUnitBackendSSE>(data.serviceUnits),
      };
    });
  }

  deploySharedLibrary(workspaceId: string, containerId: string, file: File) {
    let o: Observable<Response>;
    if (file.name.includes('error')) {
      o = helper.errorBackend(
        '[Mock message] An error happened when trying to deploy the shared library',
        400
      );
    } else {
      const sl = containersService.get(containerId).addSharedLibrary();

      const response = {
        sharedLibraries: sl.toObj(),
      };

      setTimeout(
        () =>
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseActions.SlDeployedSse,
            response
          ),
        environment.mock.sseDelay
      );
      o = helper.responseBody(response);
    }

    return o.map(res =>
      toJsTable<ISharedLibraryBackendSSE>(res.json().sharedLibraries)
    );
  }
}
