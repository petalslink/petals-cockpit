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
import { interval, Observable, of } from 'rxjs';
import { delay, last, map, share, take } from 'rxjs/operators';

import * as helper from 'app/shared/helpers/mock.helper';
import { SseActions, SseService } from 'app/shared/services/sse.service';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import { environment } from 'environments/environment';

/**
 * help to handle a request which has a progress
 * (for example when uploading a file)
 */
export const deployMockAndTriggerSse = (conf: {
  ifError: {
    isThereAnError: () => boolean;
    error: {
      message: string;
      code: number;
    };
  };
  ifSuccess: {
    file: File;
    addResourceToMock: () => {
      sseResult: { [key: string]: any };
      httpResult: { [key: string]: any };
    };
    sseService: SseService;
    sseSuccessEvent: SseActions.All;
  };
}): { progress$: Observable<number>; result$: Observable<any> } => {
  if (conf.ifError.isThereAnError()) {
    const { error } = conf.ifError;

    return {
      progress$: of(0),
      result$: helper.errorBackend(error.message, error.code),
    };
  }

  const progress$ = interval(20).pipe(take(100 + 1), share());

  const result$ = progress$.pipe(
    last(),
    delay(environment.mock.httpDelay),
    map(() => {
      const resource = conf.ifSuccess.addResourceToMock();

      setTimeout(
        () =>
          (conf.ifSuccess.sseService as SseServiceMock).triggerSseEvent(
            conf.ifSuccess.sseSuccessEvent,
            resource.sseResult
          ),
        environment.mock.sseDelay
      );

      return resource.httpResult;
    })
  );

  return { progress$, result$ };
};
