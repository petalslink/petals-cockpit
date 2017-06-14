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

import { serviceAssembliesService } from 'mocks/service-assemblies-mock';
import * as helper from './../helpers/mock.helper';
import { SseService, SseWorkspaceEvent } from './sse.service';
import { SseServiceMock } from './sse.service.mock';
import { environment } from '../../../environments/environment';

import {
  ServiceAssembliesServiceImpl,
  ServiceAssemblyState,
} from 'app/shared/services/service-assemblies.service';

@Injectable()
export class ServiceAssembliesServiceMock extends ServiceAssembliesServiceImpl {
  constructor(private sseService: SseService, http: Http) {
    super(http);
  }

  getDetailsServiceAssembly(serviceAssemblyId: string) {
    const detailsServiceAssembly = serviceAssembliesService
      .get(serviceAssemblyId)
      .getDetails();

    return helper.responseBody(detailsServiceAssembly);
  }

  putState(
    _workspaceId: string,
    serviceAssemblyId: string,
    newState: ServiceAssemblyState
  ) {
    const serviceAssembly = serviceAssembliesService.get(serviceAssemblyId);

    serviceAssembly.setState(newState);

    const response = {
      id: serviceAssemblyId,
      state: newState,
    };

    // when the state changes, trigger a fake SSE event
    setTimeout(
      () =>
        (this.sseService as SseServiceMock).triggerSseEvent(
          SseWorkspaceEvent.SA_STATE_CHANGE.event,
          response
        ),
      environment.mock.sseDelay
    );

    return helper.responseBody(response);
  }
}
