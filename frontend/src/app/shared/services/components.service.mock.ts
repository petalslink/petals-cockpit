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
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';

import { componentsService } from '../../../mocks/components-mock';
import * as helper from './../helpers/mock.helper';
import { ComponentsServiceImpl } from './components.service';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { IStore } from '../interfaces/store.interface';
import { SseServiceMock } from './sse.service.mock';
import { environment } from '../../../environments/environment';

@Injectable()
export class ComponentsMockService extends ComponentsServiceImpl {
  constructor(
    http: Http,
    router: Router,
    private pSseService: SseService,
    store$: Store<IStore>,
    notification: NotificationsService
  ) {
    super(http, router, pSseService, store$, notification);
  }

  getDetailsComponent(componentId: string) {
    const detailsComponent = componentsService.get(componentId).getDetails();

    return helper.responseBody(detailsComponent);
  }

  putState(_workspaceId: string, componentId: string, newState: string, parameters: { [key: string]: string }) {
    // in order to simulate an error, at least for E2E tests, if the http-port contains 'error', throw an error
    if (parameters && parameters['http-port'] && parameters['http-port'].includes('error')) {
      return helper.responseBody('[Mock message] An error happened when trying to change the state of that component', 400);
    }

    componentsService.get(componentId).setState(newState);

    if (parameters) {
      componentsService.get(componentId).setParameters(parameters);
    }

    // when the state changes, trigger a fake SSE event
    setTimeout(() =>
      (this.pSseService as SseServiceMock).triggerSseEvent(
        SseWorkspaceEvent.COMPONENT_STATE_CHANGE,
        {
          id: componentId,
          state: newState
        }
      ),
      environment.mock.sseDelay
    );

    return helper.responseBody(null);
  }

  deploySu(workspaceId: string, componentId: string, file: File, serviceUnitName: string) {
    const serviceUnit = componentsService.get(componentId).addServiceUnit(serviceUnitName);

    if (serviceUnitName.includes('error')) {
      return helper.responseBody('[Mock message] An error happened when trying to deploy the service-unit', 400);
    }

    setTimeout(() =>
      (this.pSseService as SseServiceMock).triggerSseEvent(
        SseWorkspaceEvent.SU_DEPLOYED,
        {
          componentId,
          serviceUnit: {
            id: serviceUnit.getId(),
            ...serviceUnit.getDetails()
          }
        }
      ),
      environment.mock.sseDelay
    );

    return helper.responseBody(null);
  }
}
