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
import {
  ESharedLibraryState,
  SharedLibrariesServiceImpl,
  SharedLibraryState,
} from 'app/shared/services/shared-libraries.service';
import { SseActions, SseService } from 'app/shared/services/sse.service';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import { environment } from 'environments/environment';
import { sharedLibrariesService } from 'mocks/shared-libraries-mock';

@Injectable()
export class SharedLibrariesServiceMock extends SharedLibrariesServiceImpl {
  constructor(private sseService: SseService, http: HttpClient) {
    super(http);
  }

  getDetails(id: string) {
    const details = sharedLibrariesService.get(id).getDetails();

    return helper.responseBody(details);
  }

  putState(_workspaceId: string, id: string, state: SharedLibraryState) {
    if (state === ESharedLibraryState.Unloaded) {
      sharedLibrariesService.remove(id);
    }

    const response = { id, state };

    // when the state changes, trigger a fake SSE event
    setTimeout(
      () =>
        (this.sseService as SseServiceMock).triggerSseEvent(
          SseActions.SlStateChangeSse,
          response
        ),
      environment.mock.sseDelay
    );

    return helper.responseBody(response);
  }
}
