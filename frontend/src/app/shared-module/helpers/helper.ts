/**
 * Copyright (C) 2016 Linagora
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

// immutable
import { fromJS } from 'immutable';

// typed record
import { TypedRecord } from 'typed-immutable-record';

let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegexp (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};

// generate a UUID
export function generateUuidV4(a = null) {
  /* tslint:disable */
  return a?(a^Math.random()*16>>a/4)
    .toString(16):(<any>[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,generateUuidV4);
  /* tslint:enable */
}

// replace IDs in the json received
// by generated UUID
export function replaceIds(obj) {
  if (typeof obj.id !== 'undefined') {
    obj.id = generateUuidV4(null);
  }

  for (let i in obj) {
    if (typeof obj[i] === 'object') {
      replaceIds(obj[i]);
    }
  }
}

// https://github.com/rangle/typed-immutable-record/issues/23
// redefine the makeTypedFactory to use fromJS so we can have
// deep parsing object
export function makeTypedFactory<E, T extends TypedRecord<T> & E>(obj: E): (val?: E) => T {
  return function TypedFactory(val: E = null): T {
    return fromJS(Object.assign(obj, val)) as T;
  };
};
