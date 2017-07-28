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

import { environment } from 'environments/environment';
import { omit } from 'lodash';

// TODO replace all of this with robustly implemented immutable maps?

export interface JsTable<I> {
  readonly byId: { readonly [id: string]: I & { id: string } };
  readonly allIds: string[];
}

export function emptyJsTable<I>(): JsTable<I> {
  return {
    byId: {},
    allIds: [],
  };
}

export function toJsTable<I>(obj: { [id: string]: I }): JsTable<I> {
  const allIds = Object.keys(obj);

  const byId: { [id: string]: I & { id: string } } = {};

  allIds.forEach(id => {
    byId[id] = Object.assign({}, obj[id], { id });
  });

  return { byId, allIds };
}

/**
 * This merges all the elements of toMerge.byId
 * into table.byId elements and toMerge.allIds into table.allIds.
 * And also ensure elements are fully initialised.
 */
export function mergeInto<I, M extends JsTable<I>>(
  table: M,
  toMerge: JsTable<I>,
  initializer: () => I
): M {
  return Object.assign({}, table, {
    allIds: [...Array.from(new Set([...table.allIds, ...toMerge.allIds]))],
    byId: toMerge.allIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: Object.assign(
          {},
          acc[id] ? acc[id] : initializer(),
          toMerge.byId[id],
          { id }
        ),
      }),
      table.byId
    ),
  });
}

/**
 * This put only the elements of toMerge.byId
 * into table.byId elements, and only toMerge.allIds into table.allIds.
 * But this keep the previous data of table.byId associated to the elements in toMerge.byId
 */
export function mergeOnly<I, M extends JsTable<I>>(
  table: M,
  toMerge: JsTable<I>,
  initializer: () => I
): M {
  return Object.assign({}, table, {
    allIds: [...toMerge.allIds],
    byId: toMerge.allIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: Object.assign(
          {},
          initializer(),
          table.byId[id],
          toMerge.byId[id],
          {
            id,
          }
        ),
      }),
      {}
    ),
  });
}

/**
 * This put all the elements of toMerge.byId in table.byId.
 */
export function putAll<
  I,
  I2 extends Partial<I>,
  M extends JsTable<I> = JsTable<I>,
  M2 extends JsTable<I2> = JsTable<I2>
>(table: M, toMerge: M2, initializer: () => I): M {
  // normally there shouldn't be any duplicate, so it's cheaper to check that now
  // than to use a Set below.
  let duplicate = false;
  toMerge.allIds.forEach(id => {
    if (table.byId[id]) {
      duplicate = true;
      if (!environment.strictCoherence) {
        if (environment.debug) {
          console.debug(
            `putAll called on an already existing element ${id} on:`,
            table
          );
        } else {
          console.warn(`putAll called on an already existing element ${id}`);
        }
        return table;
      } else {
        throw Error(`${id} already exists in this table! This is a bug!`);
      }
    }
  });

  return Object.assign({}, table, {
    allIds: duplicate
      ? [...Array.from(new Set([...table.allIds, ...toMerge.allIds]))]
      : [...table.allIds, ...toMerge.allIds],
    byId: toMerge.allIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: Object.assign(
          {},
          table.byId[id] ? table.byId[id] : initializer(),
          toMerge.byId[id],
          { id }
        ),
      }),
      table.byId
    ),
  });
}

/**
 * This merge value into table.byId[id]
 */
export function updateById<I, M extends JsTable<I> = JsTable<I>>(
  table: M,
  id: string,
  value: Partial<I>
): M {
  if (!table.byId[id]) {
    if (!environment.strictCoherence) {
      if (environment.debug) {
        console.debug(
          `updateById called on an unexisting element ${id} on`,
          table
        );
      } else {
        console.warn(`updateById called on an unexisting element ${id}`);
      }
    } else {
      throw Error(`${id} does not exist in this table! This is a bug!`);
    }
  }

  return Object.assign({}, table, {
    byId: {
      ...table.byId,
      [id]: Object.assign({}, table.byId[id], value, { id }),
    },
  });
}

/**
 * This put value in table.byId[id] and adds id to allIds.
 */
export function putById<I, M extends JsTable<I> = JsTable<I>>(
  table: M,
  id: string,
  value: Partial<I>,
  initializer: () => I
): M {
  if (table.byId[id]) {
    if (!environment.strictCoherence) {
      if (environment.debug) {
        console.debug(
          `putById called on an already existing element ${id} on`,
          table
        );
      } else {
        console.warn(`putById called on an already existing element ${id}`);
      }
    } else {
      throw Error(`${id} already exists in this table! This is a bug!`);
    }
  }

  return Object.assign({}, table, {
    allIds: table.byId[id]
      ? [...Array.from(new Set([...table.allIds, id]))]
      : [...table.allIds, id],
    byId: {
      ...table.byId,
      [id]: Object.assign(
        {},
        table.byId[id] ? table.byId[id] : initializer(),
        value,
        { id }
      ),
    },
  });
}

/**
 * This remove table.byId[id] (and from allIds)
 */
export function removeById<I, M extends JsTable<I> = JsTable<I>>(
  table: M,
  id: string
): M {
  if (!table.byId[id]) {
    if (!environment.strictCoherence) {
      if (environment.debug) {
        console.debug(
          `removeById called on an unexisting element ${id} on`,
          table
        );
      } else {
        console.warn(`removeById called on an unexisting element ${id}`);
      }
      return table;
    } else {
      throw Error(`${id} does not exist in this table! This is a bug!`);
    }
  }

  return Object.assign({}, table, {
    byId: omit(table.byId, id),
    allIds: table.allIds.filter(i => i !== id),
  });
}
