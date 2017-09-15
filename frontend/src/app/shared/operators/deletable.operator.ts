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

import { Observable } from 'rxjs/Observable';

export interface IDeletable<T> {
  isDeleted: boolean;
  value: T;
}

export function deletable<T>(obs: Observable<T>): Observable<IDeletable<T>> {
  return obs
    .scan((acc: IDeletable<T>, curr: T) => {
      if (curr === null || curr === undefined) {
        if (acc === undefined) {
          return undefined;
        } else {
          return {
            isDeleted: true,
            value: acc.value,
          };
        }
      } else {
        return {
          isDeleted: false,
          value: curr,
        };
      }
    }, undefined)
    .distinctUntilChanged(
      (p, n) =>
        p === n ||
        (p && n && p.isDeleted === n.isDeleted && p.value === n.value)
    );
}
