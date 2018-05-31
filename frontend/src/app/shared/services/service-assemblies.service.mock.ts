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
import { environment } from 'environments/environment';
import { serviceAssembliesService } from 'mocks/service-assemblies-mock';

import { SseActions, SseService } from 'app/shared/services/sse.service';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import {
  EServiceAssemblyState,
  ServiceAssembliesServiceImpl,
  ServiceAssemblyState,
} from './service-assemblies.service';

@Injectable()
export class ServiceAssembliesServiceMock extends ServiceAssembliesServiceImpl {
  constructor(private sseService: SseService, http: HttpClient) {
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
    if (newState === EServiceAssemblyState.Unloaded) {
      serviceAssembliesService.remove(serviceAssemblyId);
    } else {
      serviceAssembly.state = newState;
    }

    const response = {
      id: serviceAssemblyId,
      state: newState,
    };

    // when the state changes, trigger a fake SSE event
    setTimeout(
      () =>
        (this.sseService as SseServiceMock).triggerSseEvent(
          SseActions.SaStateChangeSse,
          response
        ),
      environment.mock.sseDelay
    );

    return helper.responseBody(response);
  }
}
