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

import { ResponseOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

/**
 * This simulates the behaviour of Angular's http module:
 * if the status code is not a 2XX, it will return a failing Observable
 */
export function response(status: number): Observable<Response> {
  return responseBody(null, status);
}

/**
 * This simulates the behaviour of Angular's http module:
 * if the status code is not a 2XX, it will return a failing Observable
 */
export function responseBody(body: string | Object | FormData | ArrayBuffer | Blob, status = 200): Observable<Response> {
  const response = new Response(new ResponseOptions({ status, body }));

  if (status >= 200 && status < 300) {
    return Observable.of(response);
  } else {
    return Observable.throw(response);
  }
}
