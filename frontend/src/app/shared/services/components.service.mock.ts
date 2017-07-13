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

import { componentsService } from 'mocks/components-mock';
import * as helper from 'app/shared/helpers/mock.helper';
import {
  ComponentsServiceImpl,
  ComponentState,
  EComponentState,
} from './components.service';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { SseServiceMock } from './sse.service.mock';
import { environment } from 'environments/environment';
import { toJsTable } from 'app/shared/helpers/jstable.helper';
import { IServiceAssemblyBackendSSE } from 'app/shared/services/service-assemblies.service';
import { IServiceUnitBackendSSE } from 'app/shared/services/service-units.service';

@Injectable()
export class ComponentsServiceMock extends ComponentsServiceImpl {
  constructor(http: Http, private sseService: SseService) {
    super(http);
  }

  getDetailsComponent(componentId: string) {
    const detailsComponent = componentsService.get(componentId).getDetails();

    return helper.responseBody(detailsComponent);
  }

  putState(
    _workspaceId: string,
    componentId: string,
    newState: ComponentState,
    parameters: { [key: string]: string }
  ) {
    // in order to simulate an error, at least for E2E tests, if the http-port contains 'error', throw an error
    if (
      parameters &&
      parameters['http-port'] &&
      parameters['http-port'].includes('error')
    ) {
      return helper.errorBackend(
        '[Mock message] An error happened when trying to change the state of that component',
        400
      );
    }

    const component = componentsService.get(componentId);
    if (newState === EComponentState.Unloaded) {
      componentsService.remove(componentId);
    } else {
      component.state = newState;
    }

    if (parameters) {
      component.parameters = parameters;
    }

    const response = {
      id: componentId,
      state: newState,
    };

    // when the state changes, trigger a fake SSE event
    setTimeout(
      () =>
        (this.sseService as SseServiceMock).triggerSseEvent(
          SseWorkspaceEvent.COMPONENT_STATE_CHANGE.event,
          response
        ),
      environment.mock.sseDelay
    );

    return helper.responseBody(response);
  }

  deploySu(
    workspaceId: string,
    componentId: string,
    file: File,
    serviceUnitName: string
  ) {
    let o: Observable<Response>;
    if (serviceUnitName.includes('error')) {
      o = helper.errorBackend(
        '[Mock message] An error happened when trying to deploy the service-unit',
        400
      );
    } else {
      const component = componentsService.get(componentId);
      const [serviceAssembly, serviceUnit] = component.container.addServiceUnit(
        component,
        'Shutdown',
        serviceUnitName
      );

      const response = {
        serviceAssemblies: serviceAssembly.toObj(),
        serviceUnits: serviceUnit.toObj(),
      };

      setTimeout(
        () =>
          (this.sseService as SseServiceMock).triggerSseEvent(
            SseWorkspaceEvent.SA_DEPLOYED.event,
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
}
