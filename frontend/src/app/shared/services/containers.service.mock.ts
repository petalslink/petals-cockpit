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

@Injectable()
export class ContainersMockService extends ContainersServiceImpl {
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
    const component = containersService.get(containerId).addComponent(file.name.replace(/\.zip$/, ''));

    const response = {
      containerId,
      component: {
        id: component.getId(),
        ...component.getDetails()
      }
    };

    setTimeout(() =>
      (this.pSseService as SseServiceMock).triggerSseEvent(
        SseWorkspaceEvent.COMPONENT_DEPLOYED,
        response
      ),
      environment.sseDelay
    );

    return helper.responseBody(response);
  }
}
