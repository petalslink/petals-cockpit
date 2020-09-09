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
import has from 'lodash-es/has';
import pickBy from 'lodash-es/pickBy';

import { environment } from '@env/environment';
import { componentsService } from '@mocks/components-mock';
import { deployMockAndTriggerSse } from '@mocks/utils';
import {
  servicesForComp0,
  servicesForComp1,
  workspacesService,
} from '@mocks/workspaces-mock';
import { toJsTable } from '@shared/helpers/jstable.helper';
import * as helper from '@shared/helpers/mock.helper';
import { EServiceAssemblyState } from '@shared/services/service-assemblies.service';
import { tap } from 'rxjs/operators';
import { ComponentsServiceImpl, EComponentState } from './components.service';
import { SseActions, SseService } from './sse.service';
import { SseServiceMock } from './sse.service.mock';

@Injectable()
export class ComponentsServiceMock extends ComponentsServiceImpl {
  constructor(http: HttpClient, private sseService: SseService) {
    super(http);
  }

  getDetailsComponent(componentId: string) {
    const detailsComponent = componentsService.get(componentId).getDetails();

    return helper.responseBody(detailsComponent);
  }

  putState(_workspaceId: string, componentId: string, state: EComponentState) {
    const component = componentsService.get(componentId);

    if (state === EComponentState.Unloaded) {
      componentsService.remove(componentId);
    } else {
      component.state = state;
    }

    const response = {
      id: componentId,
      state,
    };

    return helper.responseBody(response).pipe(
      tap(_ => {
        // when the state changes, trigger a fake SSE event
        setTimeout(() => {
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseActions.ComponentStateChangeSse,
            response
          );

          /**
           * Service updates related to component and service assembly lifecycles are not in scope for these mocks.
           * This is a workaround to be able to trigger controlled SSE even from cypress tests.
           */
          if (_workspaceId === 'idWks0' && componentId === 'idComp0') {
            const servicesUpdate = workspacesService
              .get(_workspaceId)
              .makeServices(servicesForComp0);

            setTimeout(
              () =>
                (this.sseService as SseServiceMock).triggerSseEvent(
                  SseActions.ServicesUpdatedSse,
                  servicesUpdate.eventData
                ),
              environment.mock.sseDelay
            );
          }

          if (_workspaceId === 'idWks0' && componentId === 'idComp1') {
            const servicesUpdate1 = workspacesService
              .get(_workspaceId)
              .makeServices(servicesForComp1);

            setTimeout(
              () =>
                (this.sseService as SseServiceMock).triggerSseEvent(
                  SseActions.ServicesUpdatedSse,
                  servicesUpdate1.eventData
                ),
              environment.mock.sseDelay
            );
          }

          if (_workspaceId === 'idWks0' && componentId === 'idComp2') {
            const servicesUpdate2 = workspacesService
              .get(_workspaceId)
              .makeServices(null);

            setTimeout(
              () =>
                (this.sseService as SseServiceMock).triggerSseEvent(
                  SseActions.ServicesUpdatedSse,
                  servicesUpdate2.eventData
                ),
              environment.mock.sseDelay
            );
          }
        }, environment.mock.sseDelay);
      })
    );
  }

  setParameters(
    _workspaceId: string,
    componentId: string,
    parameters: { [key: string]: string }
  ) {
    // in order to simulate an error, at least for E2E tests
    if (parameters['httpThreadPoolSizeMax'] === '666') {
      return helper.errorBackend(
        '[Mock message] An error happened when trying to change the parameters of that component',
        400
      );
    }

    const component = componentsService.get(componentId);

    function updateParameters(
      params: { [key: string]: string },
      newParams: { [key: string]: string }
    ) {
      return {
        ...params,
        ...pickBy(newParams, (v, k) => has(params, k)),
      };
    }

    if (component.state === EComponentState.Loaded) {
      component.installParameters = updateParameters(
        component.installParameters,
        parameters
      );
    }
    component.runtimeParameters = updateParameters(
      component.runtimeParameters,
      parameters
    );

    return helper.response(204);
  }

  deploySu(
    workspaceId: string,
    componentId: string,
    file: File,
    serviceUnitName: string
  ) {
    return deployMockAndTriggerSse({
      ifError: {
        isThereAnError: () => file.name.includes('error'),
        error: {
          message:
            '[Mock message] An error happened when trying to deploy the service-unit',
          code: 400,
        },
      },
      ifSuccess: {
        file,
        addResourceToMock: () => {
          const component = componentsService.get(componentId);
          const [
            serviceAssembly,
            serviceUnit,
          ] = component.container.addServiceUnit(
            component,
            EServiceAssemblyState.Shutdown,
            serviceUnitName
          );

          return {
            sseResult: {
              serviceAssemblies: serviceAssembly.toObj(),
              serviceUnits: serviceUnit.toObj(),
            },
            httpResult: {
              serviceAssemblies: toJsTable(serviceAssembly.toObj()),
              serviceUnits: toJsTable(serviceUnit.toObj()),
            },
          };
        },
        sseService: this.sseService,
        sseSuccessEvent: SseActions.SaDeployedSse,
      },
    });
  }
}
