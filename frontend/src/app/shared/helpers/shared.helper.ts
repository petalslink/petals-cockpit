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

// generate a UUID
export function generateUuidV4(a = null) {
  /* tslint:disable */
  return a ? (a ^ Math.random() * 16 >> a / 4)
    .toString(16) : (<any>[1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUuidV4);
  /* tslint:enable */
}

export function toJavascriptMap(map: any) {
  const allIds = Object.keys(map);

  const byId = {};

  allIds.forEach(id => {
    byId[id] = {
      ...map[id],
      id
    };
  });

  return { byId, allIds };
}

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegexp(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
}

export function arrayEquals(ps: any[], ns: any[]): boolean {
  return ps.every((p, i) => p === ns[i]);
}
