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

import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';
import { delay, dematerialize, materialize } from 'rxjs/operators';

import { environment } from 'environments/environment';

/**
 * This simulates the behaviour of Angular's http module:
 * if the status code is not a 2XX, it will return a failing Observable
 */
export function response<T = undefined>(status: number): Observable<T> {
  return responseBody<T>(undefined, status);
}

/**
 * This simulates the behaviour of Angular's http module:
 * if the status code is not a 2XX, it will return a failing Observable
 */
export function responseBody<T = undefined>(
  body: T,
  status = 200,
  error?: { code: number; message: string }
): Observable<T> {
  if (status >= 200 && status < 300) {
    return of(body).pipe(delay(environment.mock.httpDelay));
  } else {
    return _throw(new HttpErrorResponse({ status, error })).pipe(
      materialize(),
      delay(environment.mock.httpDelay),
      dematerialize()
    );
  }
}

/**
 * The backend answers errors like this
 */
export function errorBackend<T = undefined>(
  message: string,
  code: number
): Observable<T> {
  return responseBody(undefined, code, { code, message });
}
