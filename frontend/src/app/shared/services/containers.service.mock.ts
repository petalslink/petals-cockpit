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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { toJsTable } from 'app/shared/helpers/jstable.helper';
import * as helper from 'app/shared/helpers/mock.helper';
import { EServiceAssemblyState } from 'app/shared/services/service-assemblies.service';
import { SseActions, SseService } from 'app/shared/services/sse.service';
import { containersService } from 'mocks/containers-mock';
import { deployMockAndTriggerSse } from 'mocks/utils';
import { ContainersServiceImpl } from './containers.service';

@Injectable()
export class ContainersServiceMock extends ContainersServiceImpl {
  constructor(http: HttpClient, private sseService: SseService) {
    super(http);
  }

  getDetailsContainer(containerId: string) {
    const detailsContainer = containersService.get(containerId).getDetails();

    return helper.responseBody(detailsContainer);
  }

  deployComponent(
    workspaceId: string,
    containerId: string,
    file: File,
    name: string
  ) {
    return deployMockAndTriggerSse({
      ifError: {
        isThereAnError: () => file.name.includes('error'),
        error: {
          message:
            '[Mock message] An error happened when trying to deploy the component',
          code: 400,
        },
      },
      ifSuccess: {
        file,
        addResourceToMock: () => {
          const components = containersService
            .get(containerId)
            .addComponent('Loaded', name)
            .toObj();

          return {
            sseResult: {
              components,
            },
            httpResult: toJsTable(components),
          };
        },
        sseService: this.sseService,
        sseSuccessEvent: SseActions.ComponentDeployedSse,
      },
    });
  }

  deployServiceAssembly(workspaceId: string, containerId: string, file: File) {
    return deployMockAndTriggerSse({
      ifError: {
        isThereAnError: () => file.name.includes('error'),
        error: {
          message:
            '[Mock message] An error happened when trying to deploy the service-assembly',
          code: 400,
        },
      },
      ifSuccess: {
        file,
        addResourceToMock: () => {
          const [serviceAssembly, serviceUnits] = containersService
            .get(containerId)
            .addServiceAssembly(EServiceAssemblyState.Shutdown);

          return {
            sseResult: {
              serviceAssemblies: serviceAssembly,
              serviceUnits,
            },
            httpResult: {
              serviceAssemblies: toJsTable(serviceAssembly),
              serviceUnits: toJsTable(serviceUnits),
            },
          };
        },
        sseService: this.sseService,
        sseSuccessEvent: SseActions.SaDeployedSse,
      },
    });
  }

  deploySharedLibrary(workspaceId: string, containerId: string, file: File) {
    return deployMockAndTriggerSse({
      ifError: {
        isThereAnError: () => file.name.includes('error'),
        error: {
          message:
            '[Mock message] An error happened when trying to deploy the shared library',
          code: 400,
        },
      },
      ifSuccess: {
        file,
        addResourceToMock: () => {
          const sharedLibraries = containersService
            .get(containerId)
            .addSharedLibrary()
            .toObj();

          return {
            sseResult: {
              sharedLibraries,
            },
            httpResult: toJsTable(sharedLibraries),
          };
        },
        sseService: this.sseService,
        sseSuccessEvent: SseActions.SlDeployedSse,
      },
    });
  }
}
