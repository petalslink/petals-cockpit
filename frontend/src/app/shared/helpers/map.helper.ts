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

import { omit } from 'lodash';
import { environment } from 'environments/environment';

// TODO replace all of this with robustly implemented immutable maps?

export interface JsMap<I> {
  readonly byId: { readonly [id: string]: I };
  readonly allIds: string[];
}

export function emptyJavascriptMap<I>(): JsMap<I> {
  return {
    byId: {},
    allIds: [],
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
 * And also ensure elements are fully initialised.
 */
export function mergeInto<I, M extends JsMap<I>>(
  map: M,
  toMerge: JsMap<I>,
  initializer: I
): M {
  return Object.assign({}, map, toMerge, {
    allIds: [...Array.from(new Set([...map.allIds, ...toMerge.allIds]))],
    byId: toMerge.allIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: Object.assign<object, I, I>(
          {},
          acc[id] ? acc[id] : initializer,
          toMerge.byId[id]
        ),
      }),
      map.byId
    ),
  });
}

/**
 * This merges the fields of toMerge into map, put only the elements of toMerge.byId
 * into map.byId elements, and only toMerge.allIds into map.allIds.
 * But this keep the previous data of map.byId associated to the elements in toMerge.byId
 */
export function mergeOnly<I, M extends JsMap<I>>(
  map: M,
  toMerge: JsMap<I>,
  initializer: I
): M {
  return Object.assign({}, map, toMerge, {
    allIds: [...toMerge.allIds],
    byId: toMerge.allIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: Object.assign<object, I, I, I>(
          {},
          initializer,
          map.byId[id],
          toMerge.byId[id]
        ),
      }),
      {}
    ),
  });
}

/**
 * This put all the elements of toMerge.byId in map.byId.
 */
export function putAll<I, M extends JsMap<I>>(
  map: M,
  toMerge: JsMap<I>,
  initializer: I
): M {
  // normally there shouldn't be any duplicate, so it's cheaper to check that now
  // than to use a Set below.
  let duplicate = false;
  toMerge.allIds.forEach(id => {
    if (map.byId[id]) {
      duplicate = true;
      if (!environment.strictCoherence) {
        if (environment.debug) {
          console.debug(
            `putAll called on an already existing element ${id} on: ${map}`
          );
        } else {
          console.warn(`putAll called on an already existing element ${id}`);
        }
        return map;
      } else {
        throw Error(`${id} already exists in this map! This is a bug!`);
      }
    }
  });

  return Object.assign({}, map, {
    allIds: duplicate
      ? [...Array.from(new Set([...map.allIds, ...toMerge.allIds]))]
      : [...map.allIds, ...toMerge.allIds],
    byId: toMerge.allIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: Object.assign<object, I, I>({}, initializer, toMerge.byId[id]),
      }),
      map.byId
    ),
  });
}

/**
 * This merge value into map.byId[id]
 */
export function updateById<I, M extends JsMap<I>>(
  map: M,
  id: string,
  value: object
): M {
  if (!map.byId[id]) {
    if (!environment.strictCoherence) {
      if (environment.debug) {
        console.debug(
          `updateById called on an unexisting element ${id} on: ${map}`
        );
      } else {
        console.warn(`updateById called on an unexisting element ${id}`);
      }
      return map;
    } else {
      throw Error(`${id} does not exist in this map! This is a bug!`);
    }
  }

  return Object.assign({}, map, {
    byId: {
      ...map.byId,
      [id]: Object.assign({}, map.byId[id], value),
    },
  });
}

/**
 * This put value in map.byId[id] and adds id to allIds.
 */
export function putById<I, M extends JsMap<I>>(
  map: M,
  id: string,
  value: I,
  initializer: I
): M {
  if (map.byId[id]) {
    if (!environment.strictCoherence) {
      if (environment.debug) {
        console.debug(
          `putById called on an already existing element ${id} on: ${map}`
        );
      } else {
        console.warn(`putById called on an already existing element ${id}`);
      }
      return map;
    } else {
      throw Error(`${id} already exists in this map! This is a bug!`);
    }
  }

  return Object.assign({}, map, {
    allIds: map.byId[id]
      ? [...Array.from(new Set([...map.allIds, id]))]
      : [...map.allIds, id],
    byId: {
      ...map.byId,
      [id]: Object.assign({}, initializer, value),
    },
  });
}

/**
 * This remove map.byId[id] (and from allIds)
 */
export function removeById<I, M extends JsMap<I>>(map: M, id: string): M {
  if (!map.byId[id]) {
    if (!environment.strictCoherence) {
      if (environment.debug) {
        console.debug(
          `removeById called on an unexisting element ${id} on: ${map}`
        );
      } else {
        console.warn(`removeById called on an unexisting element ${id}`);
      }
      return map;
    } else {
      throw Error(`${id} does not exist in this map! This is a bug!`);
    }
  }

  return Object.assign({}, map, {
    byId: omit(map.byId, id),
    allIds: map.allIds.filter(i => i !== id),
  });
}
