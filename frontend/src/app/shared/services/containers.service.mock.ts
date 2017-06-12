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
import { Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';

import { environment } from 'environments/environment';
import { ContainersServiceImpl } from './containers.service';
import { containersService } from '../../../mocks/containers-mock';
import * as helper from './../helpers/mock.helper';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import { SseService, SseWorkspaceEvent } from 'app/shared/services/sse.service';
import { IStore } from 'app/shared/interfaces/store.interface';
import { EServiceAssemblyState } from 'app/shared/services/service-assemblies.service';

@Injectable()
export class ContainersServiceMock extends ContainersServiceImpl {
  constructor(
    http: Http,
    store$: Store<IStore>,
    private pSseService: SseService,
    notification: NotificationsService
  ) {
    super(http, store$, pSseService, notification);
  }

  getDetailsContainer(containerId: string) {
    const detailsContainer = containersService.get(containerId).getDetails();

    return helper.responseBody(detailsContainer);
  }

  deployComponent(workspaceId: string, containerId: string, file: File) {
    if (file.name.includes('error')) {
      return helper.errorBackend(
        '[Mock message] An error happened when trying to deploy the component',
        400
      );
    }

    const name = file.name.replace(/\.zip$/, '');
    const component = containersService
      .get(containerId)
      .addComponent('Loaded', name);

    const response = {
      components: component.toObj(),
    };

    setTimeout(
      () =>
        (this.pSseService as SseServiceMock).triggerSseEvent(
          SseWorkspaceEvent.COMPONENT_DEPLOYED,
          response
        ),
      environment.mock.sseDelay
    );

    return helper.responseBody(response);
  }

  deployServiceAssembly(workspaceId: string, containerId: string, file: File) {
    if (file.name.includes('error')) {
      return helper.errorBackend(
        '[Mock message] An error happened when trying to deploy the service-assembly',
        400
      );
    }

    const [serviceAssembly, serviceUnits] = containersService
      .get(containerId)
      .addServiceAssembly(EServiceAssemblyState.Shutdown);

    const response = {
      serviceAssemblies: serviceAssembly,
      serviceUnits: serviceUnits,
    };

    setTimeout(
      () =>
        (this.pSseService as SseServiceMock).triggerSseEvent(
          SseWorkspaceEvent.SA_DEPLOYED,
          response
        ),
      environment.mock.sseDelay
    );

    return helper.responseBody(response);
  }

  deploySharedLibrary(workspaceId: string, containerId: string, file: File) {
    if (file.name.includes('error')) {
      return helper.errorBackend(
        '[Mock message] An error happened when trying to deploy the shared library',
        400
      );
    }

    const sl = containersService.get(containerId).addSharedLibrary();

    const response = {
      sharedLibraries: sl.toObj(),
    };

    setTimeout(
      () =>
        (this.pSseService as SseServiceMock).triggerSseEvent(
          SseWorkspaceEvent.SL_DEPLOYED,
          response
        ),
      environment.mock.sseDelay
    );

    return helper.responseBody(response);
  }
}
