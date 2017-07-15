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

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegexp(str: string) {
  return str.replace(matchOperatorsRe, '\\$&');
}

/**
 * useful to force type inference to take an array as a tuple!
 */
export function tuple<T extends [void] | {}>(t: T): T {
  return t;
}

export function tupleEquals<T extends [void]>(ps: T, ns: T): boolean {
  return arrayEquals(ps, ns);
}

export function arrayEquals<T>(ps: T[], ns: T[]): boolean {
  return ps.length === ns.length && ps.every((p, i) => p === ns[i]);
}

export function isNot(e: object): (object: any) => boolean {
  return e2 => e !== e2;
}
