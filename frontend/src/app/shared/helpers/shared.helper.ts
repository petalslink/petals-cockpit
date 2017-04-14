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

import { omit } from 'underscore';

// generate a UUID
export function generateUuidV4(a = null) {
  /* tslint:disable */
  return a ? (a ^ Math.random() * 16 >> a / 4)
    .toString(16) : (<any>[1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUuidV4);
  /* tslint:enable */
}

// TODO replace all that with immutable maps!
export interface JsMap<I> {
  readonly byId: { readonly [id: string]: I };
  readonly allIds: string[];
}

export function emptyJavascriptMap<I>(): JsMap<I> {
  return {
    byId: {},
    allIds: []
  };
}

export function toJavascriptMap<I>(obj: object): JsMap<I> {
  const allIds = Object.keys(obj);

  const byId: { [id: string]: I } = {};

  allIds.forEach(id => {
    byId[id] = Object.assign({}, obj[id], { id });
  });

  return { byId, allIds };
}

/**
 * This merges the fields of toMerge into map, all the elements of toMerge.byId
 * into map.byId elements and toMerge.allIds into map.allIds.
 */
export function mergeInto<I, M extends JsMap<I>>(map: M, toMerge: JsMap<I>): M {
  return Object.assign({},
    map,
    toMerge,
    {
      // TODO should we update allIds in this case?!
      allIds: [...Array.from(new Set([...map.allIds, ...toMerge.allIds]))],
      byId: toMerge.allIds.reduce((acc, id) => ({
        ...acc,
        [id]: Object.assign<object, I, I>({}, acc[id], toMerge.byId[id])
      }), map.byId)
    });
}

/**
 * This put all the elements of toMerge.byId in map.byId (overwriting the previous one).
 */
export function putAll<I, M extends JsMap<I>>(map: M, toMerge: JsMap<I>): M {
  return Object.assign({},
    map,
    {
      allIds: [...Array.from(new Set([...map.allIds, ...toMerge.allIds]))],
      byId: toMerge.allIds.reduce((acc, id) => ({
        ...acc,
        [id]: Object.assign<object, I>({}, toMerge.byId[id])
      }), map.byId)
    });
}

/**
 * This merge value into map.byId[id] and if needed adds id to map.allIds.
 */
export function updateById<I, M extends JsMap<I>>(map: M, id: string, value: object): M {
  return Object.assign({},
    map,
    {
      // TODO should we update allIds in this case?!
      allIds: map.byId[id] ? map.allIds : [...map.allIds, id],
      byId: {
        ...map.byId,
        [id]: Object.assign({}, map.byId[id], value)
      }
    });
}

/**
 * This put value in map.byId[id] (overwriting the previous value) and if needed adds id to allIds.
 */
export function putById<I, M extends JsMap<I>>(map: M, id: string, value: I): M {
  return Object.assign({},
    map,
    {
      allIds: map.byId[id] ? map.allIds : [...map.allIds, id],
      byId: {
        ...map.byId,
        [id]: Object.assign({}, value)
      }
    });
}

/**
 * This remove map.byId[id] (and from allIds)
 */
export function removeById<I, M extends JsMap<I>>(map: M, id: string): M {
  return Object.assign({},
    map,
    {
      byId: omit(map.byId, id),
      allIds: map.allIds.filter(i => i !== id)
    });
}

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegexp(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
}

/**
 * useful to force type inference to take an array as a tuple!
 */
export function tuple<T extends [void] | {}>(t: T): T {
  return t;
}

export function arrayEquals<T extends [void]>(ps: T, ns: T): boolean {
  return ps.every((p, i) => p === ns[i]);
}

export function isNot(e: object): (object) => boolean {
  return (e2) => e !== e2;
}

const reActionName = /.*REDUCER_(.*)/;
/**
 * take an action type and remove the reducer name prefix
 */
export function type(actionName: string) {
  const arr = reActionName.exec(actionName);

  if (arr.length === 2) {
    return arr[1];
  }

  return actionName;
}
